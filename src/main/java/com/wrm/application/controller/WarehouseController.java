package com.wrm.application.controller;

import com.wrm.application.dto.warehouse.WarehouseDTO;
import com.wrm.application.dto.warehouse.WarehouseUpdateDTO;
import com.wrm.application.response.ResponseObject;
import com.wrm.application.response.warehouse.WarehouseDetailResponse;
import com.wrm.application.response.warehouse.WarehouseListResponse;
import com.wrm.application.response.warehouse.WarehouseResponse;
import com.wrm.application.service.impl.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<ResponseObject> getAllWarehouses(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "minSize", required = false) Float minSize,
            @RequestParam(value = "maxSize", required = false) Float maxSize,
            @RequestParam(value = "status", required = false) String status) {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<WarehouseResponse> warehousePage;
        if ((keyword != null && !keyword.isEmpty()) || minSize != null || maxSize != null || (status != null && !status.isEmpty())){
            warehousePage = warehouseService.getWarehouseByCriteria(keyword, minSize, maxSize, status, pageRequest);
        } else {
            warehousePage = warehouseService.getAllWarehouses(pageRequest);
        }

        int totalPages = warehousePage.getTotalPages();

        List<WarehouseResponse> warehouses = warehousePage.getContent();
        WarehouseListResponse.builder()
                .warehouses(warehouses)
                .totalPages(totalPages)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get all warehouses successfully")
                .status(HttpStatus.OK)
                .data(warehouses)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getWarehouseById(@PathVariable Long id) throws Exception {
        WarehouseDetailResponse warehouse = warehouseService.getWarehouseById(id);
        return ResponseEntity.ok(ResponseObject.builder()
                .message("Get warehouse's details successfully")
                .status(HttpStatus.OK)
                .data(warehouse)
                .build());
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> createWarehouse(@Valid @RequestBody WarehouseDTO warehouseDTO, BindingResult result) throws Exception {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .message(errorMessage.toString())
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .build());
            }
            WarehouseResponse warehouse = warehouseService.createWarehouse(warehouseDTO);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Warehouse created successfully")
                    .status(HttpStatus.CREATED)
                    .data(warehouse)
                    .build());
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> updateWarehouse(@PathVariable Long id, @Valid @RequestBody WarehouseUpdateDTO warehouseUpdateDTO, BindingResult result) throws Exception {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .message(errorMessage.toString())
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .build());
            }
            WarehouseResponse warehouse = warehouseService.updateWarehouse(id, warehouseUpdateDTO);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Warehouse updated successfully")
                    .status(HttpStatus.OK)
                    .data(warehouse)
                    .build());
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> deleteWarehouse(@PathVariable Long id) {
        try {
            warehouseService.deleteWarehouse(id);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Warehouse deleted successfully")
                    .status(HttpStatus.OK)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .message(e.getMessage())
                    .status(HttpStatus.BAD_REQUEST)
                    .build());
        }
    }
}
