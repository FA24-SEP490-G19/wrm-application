package com.wrm.application.response.lot;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.LotStatus;
import com.wrm.application.model.User;
import com.wrm.application.response.user.UserResponse;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@Builder
public class LotResponse {

    private Long id;

    @JsonProperty("warehouse_id")
    private Long warehouseId;

    private float size;

    private String description;

    private String price;

    @Enumerated(EnumType.STRING)
    private LotStatus status;

    private String customer;

}
