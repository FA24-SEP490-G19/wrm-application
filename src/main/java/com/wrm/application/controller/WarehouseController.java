package com.wrm.application.controller;

import com.wrm.application.dto.WarehouseDTO;
import com.wrm.application.response.warehouse.WarehouseListResponse;
import com.wrm.application.response.warehouse.WarehouseResponse;
import com.wrm.application.service.impl.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/warehouses")
public class WarehouseController {
    private final WarehouseService warehouseService;

    @GetMapping("")
    public ResponseEntity<WarehouseListResponse> getAllWarehouses(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            @RequestParam(value = "keyword", required = false) String keyword) {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<WarehouseResponse> warehousePage;
        if (keyword != null && !keyword.isEmpty()) {
            warehousePage = warehouseService.getWarehouseByNameOrAddress(keyword, pageRequest);
        } else {
            warehousePage = warehouseService.getAllWarehouses(pageRequest);
        }

        int totalPages = warehousePage.getTotalPages();

        List<WarehouseResponse> warehouses = warehousePage.getContent();
        return ResponseEntity.ok(WarehouseListResponse.builder()
                .warehouses(warehouses)
                .totalPages(totalPages)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseResponse> getWarehouseById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createWarehouse(@Valid @RequestBody WarehouseDTO warehouseDTO, BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            WarehouseResponse warehouse = warehouseService.createWarehouse(warehouseDTO);
            return ResponseEntity.ok(warehouse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateWarehouse(@PathVariable Long id, @Valid @RequestBody WarehouseDTO warehouseDTO, BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body("Invalid warehouse data");
            }
            WarehouseResponse warehouse = warehouseService.updateWarehouse(id, warehouseDTO);
            return ResponseEntity.ok(warehouse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteWarehouse(@PathVariable Long id) {
        try {
            warehouseService.deleteWarehouse(id);
            return ResponseEntity.ok("Warehouse deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
