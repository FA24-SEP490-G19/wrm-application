package com.wrm.application.controller;

import com.wrm.application.exception.InvalidPasswordException;
import com.wrm.application.response.ResponseObject;
import com.wrm.application.security.JwtTokenUtil;
import com.wrm.application.dto.auth.ChangePasswordDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.dto.auth.UserLoginDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.InvalidParamException;
import com.wrm.application.model.User;
import com.wrm.application.response.user.UserResponse;
import com.wrm.application.service.impl.TokenService;
import com.wrm.application.service.impl.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final TokenService tokenService;
    private final JwtTokenUtil jwtTokenUtil;

    @PostMapping("/register")
    public ResponseEntity<ResponseObject> register(@Valid @RequestBody UserDTO userDTO, BindingResult result) throws Exception {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .message(errorMessage.toString())
                        .build());
            }
            if (!userDTO.getPassword().equals(userDTO.getRetypePassword())) {
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .message("Password and retype password do not match")
                        .build());
            }
            UserResponse user = userService.createUser(userDTO);
            return ResponseEntity.ok(ResponseObject.builder()
                    .status(HttpStatus.OK)
                    .data(user)
                    .message("User created successfully")
                    .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseObject> login(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        try {
            String token = userService.login(userLoginDTO.getEmail(), userLoginDTO.getPassword());
            User user = userService.getUserByEmail(userLoginDTO.getEmail());
            tokenService.addToken(user, token);
            return ResponseEntity.ok(ResponseObject.builder()
                    .status(HttpStatus.OK)
                    .data(token)
                    .message("Login successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Invalid token");
            }
            String token = authHeader.substring(7);
            tokenService.revokeToken(token);
            return ResponseEntity.ok("Logged out successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(Principal principal,
                                                 @RequestBody @Valid ChangePasswordDTO changePasswordDTO,
                                                 BindingResult result) throws DataNotFoundException {
        if (result.hasErrors()) {
            StringBuilder errorMessages = new StringBuilder();
            result.getAllErrors().forEach(error -> errorMessages.append(error.getDefaultMessage()).append("\n"));
            return ResponseEntity.badRequest().body(errorMessages.toString());
        }
        String email = principal.getName();
        try {
            userService.changePassword(email, changePasswordDTO);
            return ResponseEntity.ok("Password changed successfully");
        } catch (InvalidParamException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }

    @PutMapping("/reset-password/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> resetPassword(@Valid @PathVariable long userId) throws Exception{
        try {
            String newPassword = UUID.randomUUID().toString().substring(0, 5);
            userService.resetPassword(userId, newPassword);
            return ResponseEntity.ok(ResponseObject.builder()
                    .status(HttpStatus.OK)
                    .data(newPassword)
                    .message("Password reset successfully")
                    .build());
        } catch (InvalidPasswordException e) {
            return ResponseEntity.ok(ResponseObject.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .message(e.getMessage())
                    .build());
        } catch (DataNotFoundException e) {
            return ResponseEntity.ok(ResponseObject.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .data(null)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/ManagerNotHaveWarehouse")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<UserDTO> getManagerHaveNotWarehouse() {
        return userService.getManagerHaveNotWarehouse();
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES') or hasRole('ROLE_USER')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserDTO user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching user data");
        }
    }

    @GetMapping("/customers")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllCustomers() {
        try {
            List<UserDTO> customers = userService.getAllCustomers();
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllUser() {
        try {
            List<UserDTO> customers = userService.getAllUser();
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
                    .roleId(createdUser.getRole().getId())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(responseUserDTO);
        } catch (Exception e) {
            // Log exception for debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while creating the user");
        }
    }




}
