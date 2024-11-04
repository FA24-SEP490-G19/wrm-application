package com.wrm.application.response.rental;

import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@Builder
public class RentalDetailListResponse {
    private List<RentalDetailResponse> rentalDetails;
    private int totalPages;
}
