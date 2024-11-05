package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("customer_id")
    private Long customerId;

    @JsonProperty("warehouse_id")
    private Long warehouseId;

    @JsonProperty("rating")
    private Integer rating;

    @JsonProperty("comment")
    private String comment;

}
