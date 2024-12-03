package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.UserGender;
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
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new InvalidParamException("Invalid email format");
        }
        if (userRepository.existsByEmail(email)) {
            throw new DataIntegrityViolationException("Email already exists");
        }
        if (userDTO.getPassword() == null || userDTO.getPassword().length() < 8 ||
                !userDTO.getPassword().matches(".*\\d.*") || !userDTO.getPassword().matches(".*[!@#$%^&*].*")) {
            throw new InvalidParamException("Password must be at least 8 characters long and contain at least one number and one special character");
        }
        if (userDTO.getPhoneNumber() == null || !userDTO.getPhoneNumber().matches("^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$")) {
            throw new InvalidParamException("Invalid phone number format");
        }
        if (userDTO.getFullName() == null || userDTO.getFullName().isEmpty()) {
            throw new InvalidParamException("Full name cannot be empty");
        }
        if (userDTO.getAddress() == null || userDTO.getAddress().isEmpty() || userDTO.getAddress().length() > 255) {
            throw new InvalidParamException("Address cannot be empty and must be less than 255 characters");
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
                .orElseThrow(() -> new DataNotFoundException("Role not found"));
        if (!role.getRoleName().equals("USER")) {
            throw new PermissionDenyException("Permission deny");
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

    public void verifyEmail(String token) throws Exception {
        String email = jwtTokenUtil.getSubject(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalStateException("Email already verified.");
        }
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    public String login(String email, String password) throws Exception {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new DataNotFoundException("User not found");
        }
        User existingUser = user.get();
        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException("Wrong email or password");
        }
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(email, password, existingUser.getAuthorities());

        authenticationManager.authenticate(authenticationToken);
        return jwtTokenUtil.generateToken(existingUser);
    }

    @Override
    public User getUserByEmail(String email) throws Exception {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
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
                .orElseThrow(() -> new DataNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(changePasswordDTO.getOldPassword(), user.getPassword())) {
            throw new InvalidParamException("Old password is incorrect");
        }
        if (changePasswordDTO.getNewPassword().equals(changePasswordDTO.getOldPassword())) {
            throw new InvalidParamException("New password cannot be the same as the old password");
        }
        if (!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmPassword())) {
            throw new InvalidParamException("New password and confirm password do not match");
        }
        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
    }

    public UserDTO getUserProfile(String email) throws DataNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
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
                .orElseThrow(() -> new DataNotFoundException("User not found with email: " + email));
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
                .orElseThrow(() -> new DataNotFoundException("User not found"));

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
            throw new DataIntegrityViolationException("Email already exists");
        }

        User newUser = User.builder()
                .fullName(userDTO.getFullName())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .phoneNumber(userDTO.getPhoneNumber())
                .address(userDTO.getAddress())
                .gender(userDTO.getGender())
                .status(UserStatus.ACTIVE)
                .build();

        // Find role by ID
        Role role = roleRepository.findById(userDTO.getRoleId())
                .orElseThrow(() -> new DataNotFoundException("Role not found"));
        newUser.setRole(role);

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

}
