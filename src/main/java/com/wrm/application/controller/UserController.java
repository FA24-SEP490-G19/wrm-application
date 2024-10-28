package com.wrm.application.controller;

import com.wrm.application.component.enums.UserStatus;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.dto.UserLoginDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.User;
import com.wrm.application.service.impl.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDTO userDTO, BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body("Invalid user data");
            }
            if (!userDTO.getPassword().equals(userDTO.getRetypePassword())) {
                return ResponseEntity.badRequest().body("Password does not match");
            }
            User user = userService.createUser(userDTO);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        try {
            String token = userService.login(userLoginDTO.getEmail(), userLoginDTO.getPassword());
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(Principal principal) throws DataNotFoundException {
        String email = principal.getName(); // Get the logged-in user's email from the security context
        UserDTO userProfile = userService.getUserProfile(email);
        return ResponseEntity.ok(userProfile);
    }
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateUserProfile(Principal principal, @RequestBody UserDTO updatedUserDTO) {
        String email = principal.getName(); // Retrieve logged-in user's email
        UserDTO updatedProfile = userService.updateUserProfile(email, updatedUserDTO);
        return ResponseEntity.ok(updatedProfile);
    }
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserProfileByEmail(@PathVariable String email) throws DataNotFoundException {
        UserDTO userDTO = userService.getUserProfileByEmail(email);
        return ResponseEntity.ok(userDTO);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(@PathVariable Long id, @RequestParam UserStatus status) throws DataNotFoundException {
        UserDTO userDTO = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserDTO userDTO, BindingResult result) {
        if (result.hasErrors()) {
            // Collect all validation errors and return them in the response
            List<String> errors = result.getAllErrors().stream()
                    .map(error -> error.getDefaultMessage())
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(errors);
        }

        // Check if passwords match
        if (!userDTO.getPassword().equals(userDTO.getRetypePassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }

        try {
            // Use a User entity creation method in UserService
            User createdUser = userService.createUserWithRole(userDTO);

            // Convert User entity to UserDTO to return the created user profile
            UserDTO responseUserDTO = UserDTO.builder()
                    .fullName(createdUser.getFullName())
                    .email(createdUser.getEmail())
                    .phoneNumber(createdUser.getPhoneNumber())
                    .address(createdUser.getAddress())
                    .gender(createdUser.getGender())
                    .status(createdUser.getStatus())
                    .roleId(createdUser.getRole().getId()) // Get the assigned role ID
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(responseUserDTO);
        } catch (Exception e) {
            // Log exception for debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while creating the user");
        }
    }

}
