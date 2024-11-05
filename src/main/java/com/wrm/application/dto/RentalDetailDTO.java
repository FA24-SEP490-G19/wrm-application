package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.RentalDetailStatus;
import com.wrm.application.model.AdditionalService;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RentalDetailDTO {

    @JsonProperty("rental_id")
    private Long rentalId;

    @JsonProperty("lot_id")
    private Long lotId;

    @JsonProperty("additional_service_id")
    private Long additionalServiceId;

    @JsonProperty("contract_id")
    private Long contractId;

    @Enumerated(EnumType.STRING)
    private RentalDetailStatus status;

    @JsonProperty("start_date")
    private LocalDateTime startDate;

    @JsonProperty("end_date")
    private LocalDateTime endDate;
}
