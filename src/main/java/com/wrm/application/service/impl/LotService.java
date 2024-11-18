package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.LotStatus;
import com.wrm.application.constant.enums.RentalDetailStatus;
import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.InvalidParamException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.model.Lot;
import com.wrm.application.model.RentalDetail;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.LotRepository;
import com.wrm.application.repository.RentalDetailRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.response.lot.LotListResponse;
import com.wrm.application.response.lot.LotResponse;
import com.wrm.application.service.ILotService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LotService implements ILotService {
    private final LotRepository lotRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final RentalDetailRepository rentalDetailRepository;

    @Override
    public Page<LotResponse> getAllLots(PageRequest pageRequest) {
        return lotRepository.findAll(pageRequest).map(lot -> LotResponse.builder()
                .id(lot.getId())
                .description(lot.getDescription())
                .size(lot.getSize())
                .status(lot.getStatus())
                .warehouseId(lot.getWarehouse().getId())
                .price(lot.getPrice())
                .build());
    }

    @Override
    public LotResponse getLotById(Long id) throws Exception {
        Lot lot = lotRepository.findLotById(id)
                .orElseThrow(() -> new DataNotFoundException("Lot not found with ID: " + id));
        if (lot.isDeleted()){
            throw new DataNotFoundException("Lot not found");
        }
        return LotResponse.builder()
                .id(lot.getId())
                .description(lot.getDescription())
                .size(lot.getSize())
                .status(lot.getStatus())
                .warehouseId(lot.getWarehouse().getId())
                .price(lot.getPrice())
                .build();
    }



    @Override
    public LotResponse createLot(LotDTO lotDTO) throws Exception {
        if (lotDTO.getDescription() == null || lotDTO.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be empty");
        }
        if (lotDTO.getSize() <= 0) {
            throw new IllegalArgumentException("Size must be a positive number");
        }
        if (lotDTO.getPrice() == null || lotDTO.getPrice().isEmpty()) {
            throw new IllegalArgumentException("Price cannot be empty");
        }

        Warehouse warehouse = warehouseRepository.findById(lotDTO.getWarehouseId())
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
        Lot newLot = Lot.builder()
                .description(lotDTO.getDescription())
                .size(lotDTO.getSize())
                .price(lotDTO.getPrice())
                .status(LotStatus.AVAILABLE)
                .warehouse(warehouse)
                .build();
        lotRepository.save(newLot);
        return LotResponse.builder()
                .id(newLot.getId())
                .description(newLot.getDescription())
                .size(newLot.getSize())
                .price(newLot.getPrice())
                .status(newLot.getStatus())
                .warehouseId(newLot.getWarehouse().getId())
                .build();
    }

    @Override
    public LotResponse updateLot(Long lotId, LotDTO lotDTO) throws Exception {
        Lot existingLot = lotRepository.findById(lotId)
                .orElseThrow(() -> new DataNotFoundException("Lot not found with ID: " + lotId));
        if (lotDTO.getDescription() == null || lotDTO.getDescription().isEmpty()) {
            throw new InvalidParamException("Description cannot be empty");
        }
        existingLot.setDescription(lotDTO.getDescription());
        if (lotDTO.getSize() <= 0) {
            throw new InvalidParamException("Size must be a positive number");
        }
        existingLot.setSize(lotDTO.getSize());
        if (lotDTO.getPrice() == null || lotDTO.getPrice().isEmpty()) {
            throw new InvalidParamException("Price cannot be empty");
        }
        existingLot.setPrice(lotDTO.getPrice());
        if (lotDTO.getStatus() == null) {
            throw new InvalidParamException("Status cannot be null");
        }
        existingLot.setStatus(lotDTO.getStatus());
        lotRepository.save(existingLot);
        return LotResponse.builder()
                .id(existingLot.getId())
                .description(existingLot.getDescription())
                .size(existingLot.getSize())
                .price(existingLot.getPrice())
                .status(existingLot.getStatus())
                .build();
    }

    @Override
    public void deleteLot(Long lotId) throws Exception {
        Lot existingLot = lotRepository.findLotById(lotId)
                .orElseThrow(() -> new DataNotFoundException("Lot not found with ID: " + lotId));
        existingLot.setDeleted(true);
        lotRepository.save(existingLot);
    }

    @Override
    public LotResponse updateLotStatus(Long lotId, LotDTO lotDTO, String remoteUser) throws Exception {
        User manager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Manager not found"));

        if (manager.getRole().getId() != 2 && manager.getRole().getId() != 4) {
            throw new PermissionDenyException("User does not have permission to update lot status");
        }

        Lot lot = lotRepository.findLotById(lotId)
                .orElseThrow(() -> new DataNotFoundException("Lot not found with ID: " + lotId));

        Warehouse warehouse = warehouseRepository.findById(lot.getWarehouse().getId())
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found for Lot"));

        if (!warehouse.getWarehouseManager().getId().equals(manager.getId())) {
            throw new PermissionDenyException("User is not the manager of this warehouse");
        }

        List<RentalDetail> rentalDetails = rentalDetailRepository.findByLotId(lotId);
        if (rentalDetails.stream().noneMatch(rd -> rd.getStatus().equals(RentalDetailStatus.ACTIVE.name()))) {
            throw new IllegalStateException("Cannot update lot status without active rental details.");
        }

        LotStatus newStatus = LotStatus.valueOf(lotDTO.getStatus().toString());
        lot.setStatus(newStatus);
        lotRepository.save(lot);

        return LotResponse.builder()
                .id(lot.getId())
                .description(lot.getDescription())
                .size(lot.getSize())
                .status(LotStatus.valueOf(lot.getStatus().toString()))
                .warehouseId(lot.getWarehouse().getId())
                .price(lot.getPrice())
                .build();
    }


}
