package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.RentalStatus;
import com.wrm.application.constant.enums.RentalType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalDTO {
    @JsonProperty("rental_id")
    private Long rentalId;

    @JsonProperty("customer_id")
    private Long customerId;

    @JsonProperty("customer_name")
    private String customerName;

    @JsonProperty("warehouse_id")
    private Long warehouseId;

    @JsonProperty("sales_id")
    private Long salesId;

    @JsonProperty("lot_id")
    private Long lotId;

    @JsonProperty("additional_service_id")
    private Long additionalServiceId;

    @JsonProperty("contract_id")
    private Long contractId;

    @Enumerated(EnumType.STRING)
    @JsonProperty("rental_type")
    private RentalType rentalType;

    private float price;

    @JsonProperty("start_date")
    private LocalDateTime startDate;

    @JsonProperty("end_date")
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private RentalStatus status;
}
