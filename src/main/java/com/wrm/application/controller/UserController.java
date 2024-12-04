package com.wrm.application.controller;

import com.wrm.application.exception.InvalidPasswordException;
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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final TokenService tokenService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDTO userDTO, BindingResult result) throws Exception {
        try {
            if (!userDTO.getPassword().equals(userDTO.getRetypePassword())) {
                return ResponseEntity.badRequest().body("Mật khẩu không khớp");
            }
            UserResponse user = userService.createUser(userDTO);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        try {
            String token = userService.login(userLoginDTO.getEmail(), userLoginDTO.getPassword());
            User user = userService.getUserByEmail(userLoginDTO.getEmail());
            tokenService.addToken(user, token);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
            return ResponseEntity.ok("Đăng xuất thành công");
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
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (InvalidParamException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã có lỗi xảy ra");
        }
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email) throws Exception{
        try {
            userService.resetPassword(email);
            return ResponseEntity.ok("Mật khẩu mới đã được gửi tới email của bạn");
        } catch (InvalidPasswordException | DataNotFoundException e) {
            return ResponseEntity.ok(e.getMessage());
        }
    }

    @GetMapping("/ManagerNotHaveWarehouse")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES')")
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
                    .body("Đã xảy ra lỗi khi lấy dữ liệu người dùng");
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

    @GetMapping("/sale")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllSales() {
        try {
            List<UserDTO> customers = userService.getAllSales();
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
            return ResponseEntity.badRequest().body("Mật khẩu không khớp");
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã có lỗi xảy ra khi tạo người dùng");
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateUserProfile(Principal principal, @RequestBody UserDTO updatedUserDTO) {
        String email = principal.getName(); // Retrieve logged-in user's email
        UserDTO updatedProfile = userService.updateUserProfile(email, updatedUserDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES') or hasRole('ROLE_USER') or hasRole('ROLE_MANAGER')")
    public ResponseEntity<User> getUserProfileByEmail(@PathVariable String email) throws Exception {
        User userDTO = userService.getUserByEmail(email);
        return ResponseEntity.ok(userDTO);
    }



}
