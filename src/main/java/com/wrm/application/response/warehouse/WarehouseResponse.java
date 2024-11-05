package com.wrm.application.response.warehouse;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.WarehouseStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@Builder
public class WarehouseResponse {
    private Long id;

    private String name;

    private String address;

    private float size;

    @Enumerated(EnumType.STRING)
    private WarehouseStatus status;

    private String description;

    @JsonProperty("warehouse_manager_name")
    private String warehouseManagerName;
}