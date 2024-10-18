package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.component.enums.WarehouseStatus;
import com.wrm.application.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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

    @JsonProperty("warehouse_manager")
    private User warehouseManager;
}
