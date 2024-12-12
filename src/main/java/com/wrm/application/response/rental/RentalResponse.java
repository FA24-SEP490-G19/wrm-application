package com.wrm.application.response.rental;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.RentalStatus;
import com.wrm.application.constant.enums.RentalType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RentalResponse {
    private Long id;

    @JsonProperty("customer_id")
    private Long customerId;

    @JsonProperty("warehouse_id")
    private Long warehouseId;

    @JsonProperty("lot_id")
    private Long lotId;

    @JsonProperty("additional_service_id")
    private Long additionalServiceId;

    @JsonProperty("contract_id")
    private Long contractId;

    @JsonProperty("rental_type")
    private RentalType rentalType;

    private float price;

    @JsonProperty("start_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd hh:mm a")
    private LocalDateTime startDate;

    @JsonProperty("end_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd hh:mm a")
    private LocalDateTime endDate;

    @JsonProperty("sales_id")
    private Long salesId;

    @Enumerated(EnumType.STRING)
    private RentalStatus status;
}
