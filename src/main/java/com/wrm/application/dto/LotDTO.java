package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.component.enums.LotStatus;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class LotDTO {
    private Long id;

    private String description;

    private Float size;

    private LotStatus status;

    @JsonProperty("warehouse_id")
    private Long warehouseId;
}
