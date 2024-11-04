package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContractDTO {
    private Long id;

    @NotNull(message = "Contract signing date cannot be null")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("signed_date")
    private LocalDateTime signedDate;

    @NotNull(message = "Contract expiry date cannot be null")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("expiry_date")
    private LocalDateTime expiryDate;

    @JsonProperty("is_deleted")
    private Boolean isDeleted;

    @JsonProperty("created_date")
    private LocalDateTime createdDate;

    @JsonProperty("last_modified_date")
    private LocalDateTime lastModifiedDate;


}
