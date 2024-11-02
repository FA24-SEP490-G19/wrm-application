package com.wrm.application.dto;

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

    @JsonProperty("rental_id")
    private Long rentalId;

    @JsonProperty("signed_date")
    private LocalDateTime signedDate;

    @JsonProperty("expiry_date")
    private LocalDateTime expiryDate;

    @JsonProperty("is_deleted")
    private Boolean isDeleted;

    @JsonProperty("created_date")
    private LocalDateTime createdDate;

    @JsonProperty("last_modified_date")
    private LocalDateTime lastModifiedDate;

    @JsonProperty("contract_img_link")
    private List<String> contractImageLinks;
}
