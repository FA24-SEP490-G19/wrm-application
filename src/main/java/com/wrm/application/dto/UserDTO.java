package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.component.enums.UserGender;
import com.wrm.application.component.enums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;


    @NotBlank(message = "Password confirmation is required")
    private String retypePassword;

    @JsonProperty("phone_number")
    private String phoneNumber;

    private String address;

    private UserGender gender;

    private UserStatus status;


    @NotNull(message = "Role ID is required")
    private Long roleId;
}

