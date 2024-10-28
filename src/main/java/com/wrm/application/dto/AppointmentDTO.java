package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.AppointmentStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {
    @JsonProperty("customer_id")
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @JsonProperty("sales_id")
    private Long salesId;

    @JsonProperty("warehouse_id")
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @JsonProperty("appointment_date")
    @NotNull(message = "Appointment date is required")
    private LocalDateTime appointmentDate;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
}
