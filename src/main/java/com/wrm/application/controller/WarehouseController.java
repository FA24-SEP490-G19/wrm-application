package com.wrm.application.controller;

import com.wrm.application.model.Warehouse;
import com.wrm.application.service.impl.WarehouseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/warehouses")
public class WarehouseController {
    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping("/all")
    public List<Warehouse> getAllWarehouses() {
        return warehouseService.getAllWarehouses();
    }

    @GetMapping("/{id}")
    public String getWarehouseById() {
        return "Warehouse";
    }

    @PostMapping("/create")
    public String createWarehouse() {
        return "Warehouse added";
    }

    @PutMapping("/{id}")
    public String updateWarehouse() {
        return "Warehouse updated";
    }

    @DeleteMapping("/{id}")
    public String deleteWarehouse() {
        return "Warehouse deleted";
    }
}
