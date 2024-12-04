package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.WarehouseStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseDTO {

    @NotBlank(message = "Vui lòng nhập tên kho")
    @Size(max = 100, message = "Tên kho không được vượt quá 100 ký tự")
    private String name;

    @NotBlank(message = "Vui lòng nhập địa chỉ kho")
    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @Positive(message = "Kích thước kho phải là số dương")
    private float size;

    @Enumerated(EnumType.STRING)
    private WarehouseStatus status;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;

    @JsonProperty("warehouse_manager_id")
    @NotNull(message = "Vui lòng chọn người quản lý kho")
    private Long warehouseManagerId;

    @Size(max = 1000, message = "Chỉ được phép tối đa 5 hình ảnh")
    private List<String> images;

    @JsonProperty("thumbnail")
    private String thumbnail;

    @JsonProperty("lot_items")
    private List<LotDTO> lotItems;
    private List<String> existingImages;

}
