package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.component.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {
    @JsonProperty("customer_id")
    private Long customerId;

    @JsonProperty("sales_id")
    private Long salesId;

    @JsonProperty("warehouse_id")
    private Long warehouseId;

    @JsonProperty("appointment_date")
    private LocalDateTime appointmentDate;

    private AppointmentStatus status;
}
