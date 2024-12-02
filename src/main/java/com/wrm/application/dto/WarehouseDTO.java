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

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must be less than 255 characters")
    private String address;

    @Positive(message = "Size must be greater than 0")
    private float size;

    @Enumerated(EnumType.STRING)
    private WarehouseStatus status;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @JsonProperty("warehouse_manager_id")
    @NotNull(message = "Warehouse Manager ID is required")
    private Long warehouseManagerId;

    @Size(max = 1000, message = "Maximum of 5 images allowed")
    private List<String> images;

    @JsonProperty("thumbnail")
    private String thumbnail;

    @JsonProperty("lot_items")
    private List<LotDTO> lotItems;
    private List<String> existingImages;  // filenames of images to keep

}
