package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseImageDTO {
    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("warehouse_id")
    private Long warehouseId;
}
