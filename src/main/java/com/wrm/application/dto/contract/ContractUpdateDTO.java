package com.wrm.application.dto.contract;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContractUpdateDTO {

    @NotBlank(message = "Signing date is required")
    private LocalDateTime signedDate;

    @NotBlank(message = "Expiry date is required")
    private LocalDateTime expiryDate;

    @Size(max = 10, message = "Maximum of 10 images allowed")
    private List<@Size(max = 500, message = "Image must be a valid base64 string under 500 characters") String> images;
}
