package com.wrm.application.payload.request.warehouse;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class WarehouseCreateRequest {
    private String name;
    private String address;
    private float size;
    private String description;
    private Long warehouseManagerId;
}
