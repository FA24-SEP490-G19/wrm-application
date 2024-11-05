package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.LotStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class LotDTO {
    private Long id;

    @Size(max = 500, message = "Description must be less than 500 characters")
    @NotBlank(message = "Description is required")
    private String description;

    @Positive(message = "Size must be greater than 0")
    private float size;

    @Enumerated(EnumType.STRING)
    private LotStatus status;

    @JsonProperty("warehouse_id")
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @Size(max = 100, message = "Price must be less than 100 characters")
    private String price;
}
