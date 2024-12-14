package com.wrm.application.dto.dashboard;

import lombok.*;

@Data
@AllArgsConstructor
public class RevenueStatsDTO {
    private Integer period; // Month, Quarter, or Year
    private Integer year;
    private Double revenue;
}
