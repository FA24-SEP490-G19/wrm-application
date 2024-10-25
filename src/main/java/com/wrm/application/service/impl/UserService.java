package com.wrm.application.service.impl;

import com.wrm.application.component.JwtTokenUtil;
import com.wrm.application.component.enums.UserStatus;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.exception.DataNotFoundException;
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

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    public User createUser(UserDTO userDTO) throws Exception{
        String email = userDTO.getEmail();
        if (userRepository.existsByEmail(email)){
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
        if(!role.getRoleName().equals("USER")){
            throw new PermissionDenyException("Permission deny");
        }
        newUser.setRole(role);

        String password = userDTO.getPassword();
        String encodedPassword = passwordEncoder.encode(password);
        newUser.setPassword(encodedPassword);

        return userRepository.save(newUser);
    }

    @Override
    public String login(String email, String password) throws Exception {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new DataNotFoundException("User not found");
        }
        User existingUser = user.get();
        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException("Wrong phone number or password");
        }
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(email, password, existingUser.getAuthorities());

        authenticationManager.authenticate(authenticationToken);
        return jwtTokenUtil.generateToken(existingUser);
    }
    public UserDTO getUserProfile(String email) throws DataNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        // Convert User entity to UserDTO
        return UserDTO.builder()

                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .gender(user.getGender())
                .status(user.getStatus())
                .build();
    }
    public UserDTO updateUserProfile(String email, UserDTO updatedUserDTO) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Return a default response or handle as per your app's needs
            return null; // Or throw a custom exception if you prefer
        }
        // Update fields only if provided in the DTO
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
        if (updatedUserDTO.getStatus() != null) {
            user.setStatus(updatedUserDTO.getStatus());
        }

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
