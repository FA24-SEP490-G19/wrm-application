package com.wrm.application.controller;

import com.wrm.application.security.JwtTokenUtil;
import com.wrm.application.dto.ChangePasswordDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.dto.UserLoginDTO;
import com.wrm.application.model.Token;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    private final TokenService tokenService;
    private final JwtTokenUtil jwtTokenUtil;

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
            Token jwtToken = tokenService.addToken(user, token);
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
            return ResponseEntity.ok("Logged out successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/change-password")
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

}
