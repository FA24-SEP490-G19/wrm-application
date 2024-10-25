package com.wrm.application.response.warehouse;

import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@Builder
public class WarehouseListResponse {
    private List<WarehouseResponse> warehouses;
    private int totalPages;
}
