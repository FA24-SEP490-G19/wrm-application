package com.wrm.application.service.impl;

import com.wrm.application.component.enums.WarehouseStatus;
import com.wrm.application.dto.WarehouseDTO;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.service.IWarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService implements IWarehouseService {
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;

    @Override
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @Override
    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id).orElse(null);
    }

    @Override
    public Warehouse createWarehouse(WarehouseDTO warehouseDTO) {

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

        newWarehouse.setWarehouseManagerId(warehouseManager.getId());
        return warehouseRepository.save(newWarehouse);
    }

    @Override
    public Warehouse updateWarehouse(Long id, WarehouseDTO warehouseDTO) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataIntegrityViolationException("Warehouse not found"));
        warehouse.setName(warehouseDTO.getName());
        warehouse.setDescription(warehouseDTO.getDescription());
        warehouse.setStatus(warehouseDTO.getStatus());
        return warehouseRepository.save(warehouse);
    }

    @Override
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataIntegrityViolationException("Warehouse not found"));
        warehouse.setDeleted(true);
        warehouseRepository.save(warehouse);
    }
}
