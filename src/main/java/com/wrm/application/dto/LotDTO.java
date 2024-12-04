package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.LotStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class LotDTO {
    private Long id;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    @NotBlank(message = "Vui lòng nhập mô tả")
    private String description;

    @Positive(message = "Kích thước phải lớn hơn 0")
    private float size;

    @Enumerated(EnumType.STRING)
    private LotStatus status;

    @JsonProperty("warehouse_id")
    @NotNull(message = "Vui lòng chọn kho")
    private Long warehouseId;

    @Size(max = 100, message = "Giá không được vượt quá 100 ký tự")
    private String price;
}
