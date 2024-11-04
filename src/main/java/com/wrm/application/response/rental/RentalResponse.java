package com.wrm.application.response.rental;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.RentalStatus;
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

    @JsonProperty("sales_id")
    private Long salesId;

    @Enumerated(EnumType.STRING)
    private RentalStatus status;
}
