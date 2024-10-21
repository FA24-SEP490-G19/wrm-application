package com.wrm.application.dto;

import lombok.*;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LotDTO {
    private Long id;
    private Long warehouseId;
    private float size;
    private String description;
    private int status;
}
