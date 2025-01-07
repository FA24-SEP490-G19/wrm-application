package com.wrm.application.response.warehouse;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.WarehouseStatus;
import com.wrm.application.dto.FeedbackDTO;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WarehouseDetailResponse {
    private Long id;

    private String name;

    private String address;

    private float size;

    @Enumerated(EnumType.STRING)
    private WarehouseStatus status;

    private String description;

    @JsonProperty("warehouse_manager_name")
    private String warehouseManagerName;

    @JsonProperty("warehouse_manager_email")
    private String warehouseManagerEmail;

    @JsonProperty("warehouse_manager_phone")
    private String warehouseManagerPhone;

    private List<String> images;

    @JsonProperty("feedbacks")
    private List<FeedbackDTO> feedbackDTOS;
}
