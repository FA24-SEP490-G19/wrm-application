package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.component.enums.LotStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class LotDTO {
    private Long id;

    private String description;

    private Float size;

    @Enumerated(EnumType.STRING)
    private LotStatus status;

    @JsonProperty("warehouse_id")
    private Long warehouseId;
}
