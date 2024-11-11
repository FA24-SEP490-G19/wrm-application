package com.wrm.application.service.impl;

import com.wrm.application.model.Token;
import com.wrm.application.repository.TokenRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.response.user.UserResponse;
import com.wrm.application.security.JwtTokenUtil;
import com.wrm.application.constant.enums.UserStatus;
import com.wrm.application.dto.ChangePasswordDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.InvalidParamException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.model.User;
import com.wrm.application.model.Role;
import com.wrm.application.repository.RoleRepository;
import com.wrm.application.repository.UserRepository;
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
    @Override
    public UserResponse createUser(UserDTO userDTO) throws Exception {
        String email = userDTO.getEmail();
        if (userRepository.existsByEmail(email)) {
            throw new DataIntegrityViolationException("Email already exists");
        }
        User newUser = User.builder()
                .fullName(userDTO.getFullName())
                .email(userDTO.getEmail())
                .password(userDTO.getPassword())
                .phoneNumber(userDTO.getPhoneNumber())
                .address(userDTO.getAddress())
                .gender(userDTO.getGender())
                .status(UserStatus.ACTIVE)
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
    public void resetPassword(Long userId, String newPassword)
            throws Exception {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        String encodedPassword = passwordEncoder.encode(newPassword);
        existingUser.setPassword(encodedPassword);
        userRepository.save(existingUser);
        List<Token> tokens = tokenRepository.findByUser(existingUser);
        tokenRepository.deleteAll(tokens);
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

}
