package com.wrm.application.response.lot;

import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@Builder
public class LotListResponse {
    private List<LotResponse> lots;
    private int totalPages;
}
