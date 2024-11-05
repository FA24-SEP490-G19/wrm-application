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
                    .warehouseManagerName(warehouse.getWarehouseManager().getFullName())
                    .build();
        });
    }

    @Override
    public WarehouseResponse getWarehouseById(Long id) throws Exception {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
        if (warehouse.isDeleted()) {
            throw new DataNotFoundException("Warehouse not found");
        }
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .size(warehouse.getSize())
                .description(warehouse.getDescription())
                .status(warehouse.getStatus())
                .warehouseManagerName(warehouse.getWarehouseManager().getFullName())
                .build();
    }

    @Override
    public WarehouseResponse createWarehouse(WarehouseDTO warehouseDTO) throws Exception {

        if (warehouseDTO.getName() == null || warehouseDTO.getName().isEmpty()) {
            throw new IllegalArgumentException("Warehouse name cannot be empty");
        }
        if (warehouseDTO.getAddress() == null || warehouseDTO.getAddress().isEmpty()) {
            throw new IllegalArgumentException("Warehouse address cannot be empty");
        }
        if (warehouseDTO.getSize() <= 0) {
            throw new IllegalArgumentException("Warehouse size must be a positive number");
        }
        if (warehouseDTO.getDescription() == null || warehouseDTO.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Warehouse description cannot be empty");
        }

        User warehouseManager = userRepository.findById(warehouseDTO.getWarehouseManagerId())
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        if (warehouseManager.getRole().getId() != 4) {
            throw new DataIntegrityViolationException("User is not a warehouse manager");
        }
        if (warehouseRepository.existsWarehouseByWarehouseManager(warehouseManager)) {
            throw new DataIntegrityViolationException("Warehouse manager is already in charge of another warehouse");
        }

        Warehouse newWarehouse = Warehouse.builder()
                .name(warehouseDTO.getName())
                .address(warehouseDTO.getAddress())
                .size(warehouseDTO.getSize())
                .description(warehouseDTO.getDescription())
                .status(WarehouseStatus.ACTIVE)
                .warehouseManager(warehouseManager)
                .build();

        warehouseRepository.save(newWarehouse);
        return WarehouseResponse.builder()
                .id(newWarehouse.getId())
                .name(newWarehouse.getName())
                .address(newWarehouse.getAddress())
                .size(newWarehouse.getSize())
                .description(newWarehouse.getDescription())
                .status(newWarehouse.getStatus())
                .warehouseManagerName(newWarehouse.getWarehouseManager().getFullName())
                .build();
    }

    @Override
    public WarehouseResponse updateWarehouse(Long id, WarehouseDTO warehouseDTO) throws Exception {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));

        if (warehouseDTO.getName() == null || warehouseDTO.getName().isEmpty()) {
            throw new IllegalArgumentException("Warehouse name cannot be empty");
        }
        if (warehouseDTO.getDescription() == null || warehouseDTO.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Warehouse description cannot be empty");
        }
        if (warehouseDTO.getStatus() == null) {
            throw new IllegalArgumentException("Warehouse status cannot be null");
        }

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
                .warehouseManagerName(warehouse.getWarehouseManager().getFullName())
                .build();
    }

    @Override
    public void deleteWarehouse(Long id) throws Exception {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
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
                    .warehouseManagerName(warehouse.getWarehouseManager().getFullName())
                    .build();
            return warehouseResponse;
        });
    }
}
