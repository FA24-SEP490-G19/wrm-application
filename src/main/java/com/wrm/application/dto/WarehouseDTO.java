package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.component.enums.WarehouseStatus;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseDTO {

    private String name;

    private String address;

    private float size;

    private WarehouseStatus status;

    private String description;

    @JsonProperty("warehouse_manager_id")
    private Long warehouseManagerId;
}
