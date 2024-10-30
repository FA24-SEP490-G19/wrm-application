package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.LotStatus;
import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.InvalidParamException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.model.Lot;
import com.wrm.application.model.User;
import com.wrm.application.repository.LotRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.response.lot.LotResponse;
import com.wrm.application.response.warehouse.WarehouseResponse;
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

    @Override
    public Page<LotResponse> getAllLots(PageRequest pageRequest) {
        return lotRepository.findAll(pageRequest).map(lot -> LotResponse.builder()
                .id(lot.getId())
                .description(lot.getDescription())
                .size(lot.getSize())
                .status(lot.getStatus())
                .warehouseId(lot.getWarehouse().getId())
                .createdDate(lot.getCreatedDate())
                .lastModifiedDate(lot.getLastModifiedDate())
                .build());
    }

    @Override
    public LotResponse getLotById(Long id) throws DataNotFoundException {
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
                .createdDate(lot.getCreatedDate())
                .lastModifiedDate(lot.getLastModifiedDate())
                .build();
    }

    @Override
    public LotResponse updateLotStatus(Long lotId, LotDTO lotDTO, String remoteUser) throws DataNotFoundException, PermissionDenyException, InvalidParamException {
        User manager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Manager not found"));

        if (manager.getRole().getId() != 2 && manager.getRole().getId() != 4) {
            throw new PermissionDenyException("User does not have permission to update lot status");
        }

        Lot lot = lotRepository.findLotById(lotId)
                .orElseThrow(() -> new DataNotFoundException("Lot not found with ID: " + lotId));

        LotStatus currentStatus = lot.getStatus();
        LotStatus newStatus = lotDTO.getStatus();

        if (manager.getRole().getId() == 4) {
            if (currentStatus == LotStatus.AVAILABLE && newStatus == LotStatus.RESERVED) {
            } else if (currentStatus == LotStatus.RESERVED && newStatus == LotStatus.OCCUPIED) {
            } else if (currentStatus == LotStatus.OCCUPIED && newStatus == LotStatus.AVAILABLE) {
                throw new PermissionDenyException("Cannot change status from OCCUPIED to AVAILABLE until contract ends.");
            } else {
                throw new InvalidParamException("Invalid status transition for manager role");
            }
        }

        lot.setStatus(newStatus);
        lot = lotRepository.save(lot);

        return LotResponse.builder()
                .id(lot.getId())
                .description(lot.getDescription())
                .size(lot.getSize())
                .status(lot.getStatus())
                .warehouseId(lot.getWarehouse().getId())
                .createdDate(lot.getCreatedDate())
                .lastModifiedDate(lot.getLastModifiedDate())
                .build();
    }





//    @Override
//    public List<Lot> getAllLots() {
//        return lotRepository.findAll();
//    }
//
//    @Override
//    public Lot getLotById(Long id)  {
//        return lotRepository.findLotById(id).orElse(null);
//    }
//
//    @Override
//    public Lot updateLotStatus(Long lotId, LotDTO lotDTO, String remoteUser) throws PermissionDenyException, DataNotFoundException {
//        User manager = userRepository.findByEmail(remoteUser)
//                .orElseThrow(() -> new DataNotFoundException("Manager not found"));
//
//        if (manager.getRole().getId() != 4) {
//            throw new PermissionDenyException("User is not a manager");
//        }
//
//        Lot lot = lotRepository.findById(lotId)
//                .orElseThrow(() -> new DataNotFoundException("Lot not found with ID: " + lotId));
//
//        LotStatus lotStatus = lotDTO.getStatus();
//        lot.setStatus(lotStatus);
//
//        return lotRepository.save(lot);
//    }


}
