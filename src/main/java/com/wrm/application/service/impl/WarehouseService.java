package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.WarehouseStatus;
import com.wrm.application.dto.WarehouseDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.response.warehouse.WarehouseResponse;
import com.wrm.application.service.IWarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WarehouseService implements IWarehouseService {
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;

    @Override
    public Page<WarehouseResponse> getAllWarehouses(PageRequest pageRequest) {
        return warehouseRepository.findAll(pageRequest).map(warehouse -> {
            return WarehouseResponse.builder()
                    .id(warehouse.getId())
                    .name(warehouse.getName())
                    .address(warehouse.getAddress())
                    .size(warehouse.getSize())
                    .description(warehouse.getDescription())
                    .status(warehouse.getStatus())
                    .warehouseManagerId(warehouse.getWarehouseManager().getId())
                    .createdDate(warehouse.getCreatedDate())
                    .lastModifiedDate(warehouse.getLastModifiedDate())
                    .build();
        });
    }

    @Override
    public WarehouseResponse getWarehouseById(Long id) throws Exception{
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
        if(warehouse.isDeleted()) {
            throw new DataNotFoundException("Warehouse not found");
        }
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .size(warehouse.getSize())
                .description(warehouse.getDescription())
                .status(warehouse.getStatus())
                .warehouseManagerId(warehouse.getWarehouseManager().getId())
                .createdDate(warehouse.getCreatedDate())
                .lastModifiedDate(warehouse.getLastModifiedDate())
                .build();
    }

    @Override
    public WarehouseResponse createWarehouse(WarehouseDTO warehouseDTO) {

        Warehouse newWarehouse = Warehouse.builder()
                .name(warehouseDTO.getName())
                .address(warehouseDTO.getAddress())
                .size(warehouseDTO.getSize())
                .description(warehouseDTO.getDescription())
                .status(WarehouseStatus.ACTIVE)
                .build();

        User warehouseManager = userRepository.findById(warehouseDTO.getWarehouseManagerId())
                .orElseThrow(() -> new DataIntegrityViolationException("User not found"));
        if (warehouseManager.getRole().getId() != 4) {
            throw new DataIntegrityViolationException("User is not a warehouse manager");
        }

        newWarehouse.setWarehouseManager(warehouseManager);
        warehouseRepository.save(newWarehouse);
        return WarehouseResponse.builder()
                .id(newWarehouse.getId())
                .name(newWarehouse.getName())
                .address(newWarehouse.getAddress())
                .size(newWarehouse.getSize())
                .description(newWarehouse.getDescription())
                .status(newWarehouse.getStatus())
                .warehouseManagerId(newWarehouse.getWarehouseManager().getId())
                .createdDate(newWarehouse.getCreatedDate())
                .lastModifiedDate(newWarehouse.getLastModifiedDate())
                .build();
    }

    @Override
    public WarehouseResponse updateWarehouse(Long id, WarehouseDTO warehouseDTO) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataIntegrityViolationException("Warehouse not found"));
        warehouse.setName(warehouseDTO.getName());
        warehouse.setDescription(warehouseDTO.getDescription());
        warehouse.setStatus(warehouseDTO.getStatus());
        warehouseRepository.save(warehouse);
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .size(warehouse.getSize())
                .description(warehouse.getDescription())
                .status(warehouse.getStatus())
                .warehouseManagerId(warehouse.getWarehouseManager().getId())
                .createdDate(warehouse.getCreatedDate())
                .lastModifiedDate(warehouse.getLastModifiedDate())
                .build();
    }

    @Override
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataIntegrityViolationException("Warehouse not found"));
        warehouse.setDeleted(true);
        warehouseRepository.save(warehouse);
    }

    @Override
    public Page<WarehouseResponse> getWarehouseByNameOrAddress(String address, PageRequest pageRequest) {
        return warehouseRepository.findByNameOrAddress(address, pageRequest).map(warehouse -> {
            WarehouseResponse warehouseResponse = WarehouseResponse.builder()
                    .id(warehouse.getId())
                    .name(warehouse.getName())
                    .address(warehouse.getAddress())
                    .size(warehouse.getSize())
                    .description(warehouse.getDescription())
                    .status(warehouse.getStatus())
                    .warehouseManagerId(warehouse.getWarehouseManager().getId())
                    .createdDate(warehouse.getCreatedDate())
                    .lastModifiedDate(warehouse.getLastModifiedDate())
                    .build();
            warehouseResponse.setCreatedDate(warehouse.getCreatedDate());
            warehouseResponse.setLastModifiedDate(warehouse.getLastModifiedDate());
            return warehouseResponse;
        });
    }
}
