package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.RentalStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalDTO {

    @JsonProperty("customer_id")
    private Long customerId;

    @JsonProperty("warehouse_id")
    private Long warehouseId;

    @JsonProperty("sales_id")
    private Long salesId;

    @Enumerated(EnumType.STRING)
    private RentalStatus status;

    @JsonProperty("rental_items")
    private List<RentalDetailDTO> rentalItems;
}
