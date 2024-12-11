package com.wrm.application.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class AdminRevenueStats {
    private Integer period; // Month, Quarter, or Year
    private Integer year;
    private Double revenue;
}
