package com.wrm.application.dto.dashboard;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
public class TopEntityByRevenueDTO {
    private Long id;
    private String name;
    private Double totalRevenue;
}
