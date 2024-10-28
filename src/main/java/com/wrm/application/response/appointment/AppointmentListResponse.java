package com.wrm.application.response.appointment;

import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@Builder
public class AppointmentListResponse {
    private List<AppointmentResponse> appointments;
    private int totalPages;
}
