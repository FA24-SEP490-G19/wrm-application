package com.wrm.application.service.impl;

import com.wrm.application.model.Token;
import com.wrm.application.repository.TokenRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.response.user.UserResponse;
import com.wrm.application.security.JwtTokenUtil;
import com.wrm.application.constant.enums.UserStatus;
import com.wrm.application.dto.auth.ChangePasswordDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.InvalidParamException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.model.User;
import com.wrm.application.model.Role;
import com.wrm.application.repository.RoleRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.service.IMailService;
import com.wrm.application.service.IUserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;
    private final TokenRepository tokenRepository;
    private final WarehouseRepository warehouseRepository;
    private final IMailService mailService;

    @Override
    public UserResponse createUser(UserDTO userDTO) throws Exception {
        String email = userDTO.getEmail();
        if (email == null || !email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            throw new InvalidParamException("Định dạng email không hợp lệ");
        }
        if (userRepository.existsByEmail(email)) {
            throw new DataIntegrityViolationException("Email đã tồn tại");
        }
        if (userDTO.getPassword() == null || userDTO.getPassword().length() < 8 ||
                !userDTO.getPassword().matches(".*\\d.*") || !userDTO.getPassword().matches(".*[!@#$%^&*].*")) {
            throw new InvalidParamException("Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất một số và một ký tự đặc biệt");
        }
        if (userDTO.getPhoneNumber() == null || !userDTO.getPhoneNumber().matches("^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$")) {
            throw new InvalidParamException("Định dạng số điện thoại không hợp lệ");
        }
        if (userDTO.getFullName() == null || userDTO.getFullName().isEmpty()) {
            throw new InvalidParamException("Họ tên không được để trống");
        }
        if (userDTO.getAddress() == null || userDTO.getAddress().isEmpty() || userDTO.getAddress().length() > 255) {
            throw new InvalidParamException("Địa chỉ không được để trống và phải ít hơn 255 ký tự");
        }
        User newUser = User.builder()
                .fullName(userDTO.getFullName())
                .email(userDTO.getEmail())
                .password(userDTO.getPassword())
                .phoneNumber(userDTO.getPhoneNumber())
                .address(userDTO.getAddress())
                .gender(userDTO.getGender())
                .status(UserStatus.INACTIVE)
                .build();
        Role role = roleRepository.findById(1L)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy vai trò"));
        if (!role.getRoleName().equals("USER")) {
            throw new PermissionDenyException("Quyền bị từ chối");
        }
        newUser.setRole(role);

        String password = userDTO.getPassword();
        String encodedPassword = passwordEncoder.encode(password);
        newUser.setPassword(encodedPassword);

        userRepository.save(newUser);

        String token = jwtTokenUtil.generateToken(newUser);
        mailService.sendVerificationEmail(newUser.getEmail(), token);

        return UserResponse.builder()
                .id(newUser.getId())
                .fullName(newUser.getFullName())
                .email(newUser.getEmail())
                .phoneNumber(newUser.getPhoneNumber())
                .address(newUser.getAddress())
                .gender(newUser.getGender())
                .status(newUser.getStatus())
                .build();
    }

    @Override
    public void verifyEmail(String token, HttpServletResponse response) throws Exception {
        String email = jwtTokenUtil.getSubject(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalStateException("Email đã được xác minh.");
        }
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        response.sendRedirect("http://localhost:5173/active" );

    }

    @Override
    public String login(String email, String password) throws Exception {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new DataNotFoundException("Không tìm thấy người dùng");
        }
        User existingUser = user.get();
        if (existingUser.getStatus() != UserStatus.ACTIVE) {
            throw new PermissionDenyException("Tài khoản của bạn chưa được kích hoạt hoặc đã bị khóa.");
        }
        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(email, password, existingUser.getAuthorities());

        authenticationManager.authenticate(authenticationToken);
        return jwtTokenUtil.generateToken(existingUser);
    }

    @Override
    public User getUserByEmail(String email) throws Exception {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
    }

    @Override
    public List<UserDTO> getManagerHaveNotWarehouse() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().getId() == 4) // Filter for manager role
                .filter(user -> !warehouseRepository.existsByWarehouseManagerId(user.getId())) // Exclude users with a warehouse
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .address(user.getAddress())
                        .gender(user.getGender())
                        .status(user.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    public void changePassword(String email, ChangePasswordDTO changePasswordDTO) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng với email: " + email));

        if (!passwordEncoder.matches(changePasswordDTO.getOldPassword(), user.getPassword())) {
            throw new InvalidParamException("Mật khẩu cũ không đúng");
        }
        if (changePasswordDTO.getNewPassword().equals(changePasswordDTO.getOldPassword())) {
            throw new InvalidParamException("Mật khẩu mới không được giống mật khẩu cũ");
        }
        if (!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmPassword())) {
            throw new InvalidParamException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }
        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
    }

    public UserDTO getUserProfile(String email) throws DataNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        return UserDTO.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .gender(user.getGender())
                .status(user.getStatus())
                .build();
    }

    @Override
    @Transactional
    public void resetPassword(String email) throws Exception {
        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng với email: " + email));
        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        String encodedPassword = passwordEncoder.encode(newPassword);
        existingUser.setPassword(encodedPassword);
        userRepository.save(existingUser);
        List<Token> tokens = tokenRepository.findByUser(existingUser);
        tokenRepository.deleteAll(tokens);

        mailService.sendPasswordResetEmail(existingUser.getEmail(), newPassword);
    }

    @Override
    public UserDTO getUserById(Long id) throws Exception {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        return UserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .build();
    }

    @Override
    public List<UserDTO> getAllCustomers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().getId() == 1) // Filter for user role
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .address(user.getAddress())
                        .gender(user.getGender())
                        .status(user.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getAllSales() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().getId() == 3) // Filter for user role
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .address(user.getAddress())
                        .gender(user.getGender())
                        .status(user.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getAllUser() {
        return userRepository.findAll().stream()
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .address(user.getAddress())
                        .gender(user.getGender())
                        .status(user.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public User createUserWithRole(UserDTO userDTO) throws Exception {
        String email = userDTO.getEmail();
        if (userRepository.existsByEmail(email)) {
            throw new DataIntegrityViolationException("Email đã tồn tại");
        }

        User newUser = User.builder()
                .fullName(userDTO.getFullName())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .phoneNumber(userDTO.getPhoneNumber())
                .address(userDTO.getAddress())
                .gender(userDTO.getGender())
                .status(UserStatus.INACTIVE)
                .build();

        // Find role by ID
        Role role = roleRepository.findById(userDTO.getRoleId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy role"));
        newUser.setRole(role);

        mailService.sendAccountCreationEmail(newUser, userDTO.getPassword());
        return userRepository.save(newUser);
    }

    public UserDTO updateUserProfile(String email, UserDTO updatedUserDTO) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Return a default response or handle as per your app's needs
            return null; // Or throw a custom exception if you prefer
        }
        // Update fields only if provided in the DTO
        if (updatedUserDTO.getEmail() != null) {
            user.setEmail(updatedUserDTO.getEmail());
        }
        if (updatedUserDTO.getFullName() != null) {
            user.setFullName(updatedUserDTO.getFullName());
        }
        if (updatedUserDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(updatedUserDTO.getPhoneNumber());
        }
        if (updatedUserDTO.getAddress() != null) {
            user.setAddress(updatedUserDTO.getAddress());
        }
        if (updatedUserDTO.getGender() != null) {
            user.setGender(updatedUserDTO.getGender());
        }
        //if (updatedUserDTO.getStatus() != null) {
        //    user.setStatus(updatedUserDTO.getStatus());
        //}

        // Save the updated user
        userRepository.save(user);

        // Convert updated user entity to DTO
        return UserDTO.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .gender(user.getGender())
                .status(user.getStatus())
                .build();
    }

    @Override
    public List<UserDTO> getAllCustomerBySales(String remoteUser) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        return userRepository.findCustomersBySalesId(sales.getId()).stream()
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .address(user.getAddress())
                        .gender(user.getGender())
                        .status(user.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getAllCustomersIsActive() {
        return userRepository.findCustomersByStatus(UserStatus.ACTIVE).stream()
                .filter(user -> user.getRole().getId() == 1) // Filter for user role
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .address(user.getAddress())
                        .gender(user.getGender())
                        .status(user.getStatus())
                        .build())
                .collect(Collectors.toList());
    }
}
