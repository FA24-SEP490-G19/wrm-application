package com.wrm.application.response.warehouse;
import com.wrm.application.constant.enums.WarehouseStatus;
import com.wrm.application.dto.FeedbackDTO;
import com.wrm.application.dto.WarehouseImageDTO;
import com.wrm.application.model.Lot;
import com.wrm.application.model.Warehouse;
import com.wrm.application.model.WarehouseImage;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WarehouseResponse {
    private Long id;

    private String name;

    private String address;

    private float size;

    @Enumerated(EnumType.STRING)
    private WarehouseStatus status;

    private String thumbnail;
    private String description;
    private String fullThumbnailPath; // Add this field
    private List<WarehouseImageDTO> warehouseImages; // Changed to use DTO
    private List<FeedbackDTO> feedbackDTOS;

    
}
