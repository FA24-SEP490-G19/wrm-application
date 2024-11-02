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
public class RentalListResponse {
    private List<RentalResponse> rentals;
    private int totalPages;
}
