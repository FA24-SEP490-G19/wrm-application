package com.wrm.application;

import com.wrm.application.dto.FeedbackDTO;
import com.wrm.application.dto.WarehouseImageDTO;
import com.wrm.application.model.Feedback;
import com.wrm.application.model.Warehouse;
import com.wrm.application.model.WarehouseImage;
import com.wrm.application.response.warehouse.WarehouseResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class WarehouseMapper {

    public WarehouseImageDTO toWarehouseImageDTO(WarehouseImage warehouseImage) {
        if (warehouseImage == null) {
            return null;
        }

        return WarehouseImageDTO.builder()
                .imageUrl(warehouseImage.getImageUrl())
                .build();
    }

    public FeedbackDTO toFeedback(Feedback feedback) {
        if (feedback == null) {
            return null;
        }

        return FeedbackDTO.builder()
                .comment(feedback.getComment())
                .rating(feedback.getRating())
                .build();
    }

    public WarehouseResponse toWarehouseResponse(Warehouse warehouse) {
        if (warehouse == null) {
            return null;
        }

        List<WarehouseImageDTO> imagesDTOs = warehouse.getWarehouseImages() != null ?
                warehouse.getWarehouseImages().stream()
                        .map(this::toWarehouseImageDTO)
                        .collect(Collectors.toList()) :
                new ArrayList<>();

        List<FeedbackDTO> feedbackDTOS = warehouse.getFeedbacks() != null ?
                warehouse.getFeedbacks().stream()
                        .map(this::toFeedback)
                        .toList() :
                new ArrayList<>();

        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .size(warehouse.getSize())
                .status(warehouse.getStatus())
                .description(warehouse.getDescription())
                .thumbnail(warehouse.getThumbnail())
                .fullThumbnailPath(warehouse.getThumbnail())
                .warehouseImages(imagesDTOs)
                .warehouseManager(warehouse.getWarehouseManager())
                .feedbackDTOS(feedbackDTOS)
                .build();
    }

}