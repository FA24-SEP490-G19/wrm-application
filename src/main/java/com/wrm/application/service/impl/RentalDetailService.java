package com.wrm.application.service.impl;

import com.wrm.application.dto.RentalDetailDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Rental;
import com.wrm.application.model.RentalDetail;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.RentalDetailRepository;
import com.wrm.application.repository.RentalRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.response.rental.RentalDetailResponse;
import com.wrm.application.service.IRentalDetailService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class RentalDetailService implements IRentalDetailService {
    private final RentalDetailRepository rentalDetailRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;

    @Override
    public Page<RentalDetailResponse> getByWarehouseId(String remoteUser, PageRequest pageRequest) throws Exception{
        User warehouseManager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        Warehouse warehouse = warehouseRepository.findByManagerId(warehouseManager.getId())
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));

        return rentalDetailRepository.findByWarehouseId(warehouse.getId(), pageRequest).map(rentalDetail -> {
            return RentalDetailResponse.builder()
                    .id(rentalDetail.getId())
                    .lotId(rentalDetail.getLotId())
                    .warehouseId(warehouse.getId())
                    .additionalServiceId(rentalDetail.getAdditionalService().getId())
                    .startDate(rentalDetail.getStartDate())
                    .endDate(rentalDetail.getEndDate())
                    .build();
        });
    }

    @Override
    public Page<RentalDetailResponse> getByCustomerId(String remoteUser, PageRequest pageRequest) throws Exception {
        User customer = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        return rentalDetailRepository.findByCustomerId(customer.getId(), pageRequest).map(rentalDetail -> {
            return RentalDetailResponse.builder()
                    .id(rentalDetail.getId())
                    .lotId(rentalDetail.getLotId())
                    .warehouseId(rentalDetail.getRental().getWarehouse().getId())
                    .additionalServiceId(rentalDetail.getAdditionalService().getId())
                    .startDate(rentalDetail.getStartDate())
                    .endDate(rentalDetail.getEndDate())
                    .status(rentalDetail.getStatus())
                    .build();
        });
    }

    @Override
    public List<RentalDetailResponse> getByRentalId(Long rentalId) throws Exception {
        return rentalDetailRepository.findByRentalId(rentalId).stream().map(rentalDetail -> {
            return RentalDetailResponse.builder()
                    .id(rentalDetail.getId())
                    .lotId(rentalDetail.getLotId())
                    .warehouseId(rentalDetail.getRental().getWarehouse().getId())
                    .additionalServiceId(rentalDetail.getAdditionalService().getId())
                    .startDate(rentalDetail.getStartDate())
                    .endDate(rentalDetail.getEndDate())
                    .status(rentalDetail.getStatus())
                    .build();
        }).toList();
    }

    @Override
    public RentalDetailResponse updateRentalDetailStatus(Long id, RentalDetailDTO rentalDetailDTO) throws Exception {
        if (rentalDetailDTO.getStatus() == null) {
            throw new IllegalArgumentException("Rental detail status cannot be empty");
        }
        RentalDetail rentalDetail = rentalDetailRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Rental Detail not found"));

        rentalDetail.setStatus(rentalDetailDTO.getStatus());
        rentalDetailRepository.save(rentalDetail);

        return RentalDetailResponse.builder()
                .id(rentalDetail.getId())
                .lotId(rentalDetail.getLotId())
                .warehouseId(rentalDetail.getRental().getWarehouse().getId())
                .additionalServiceId(rentalDetail.getAdditionalService().getId())
                .startDate(rentalDetail.getStartDate())
                .endDate(rentalDetail.getEndDate())
                .status(rentalDetail.getStatus())
                .build();
    }


}
