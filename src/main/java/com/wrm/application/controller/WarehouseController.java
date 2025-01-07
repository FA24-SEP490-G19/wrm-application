package com.wrm.application.controller;

import com.wrm.application.dto.WarehouseDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.response.warehouse.WarehouseDetailResponse;
import com.wrm.application.response.warehouse.WarehouseListResponse;
import com.wrm.application.response.warehouse.WarehouseResponse;
import com.wrm.application.service.IWarehouseService;
import com.wrm.application.service.impl.WarehouseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/warehouses")
public class WarehouseController {
    private final IWarehouseService warehouseService;

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
            warehousePage = warehouseService.getWarehouseByKeyword(keyword, pageRequest);
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

    @GetMapping("/manager")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<WarehouseListResponse> getAllWarehousesByManager(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            @RequestParam(value = "keyword", required = false) String keyword,
            HttpServletRequest req) throws DataNotFoundException {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<WarehouseResponse> warehousePage;
        if (keyword != null && !keyword.isEmpty()) {
            warehousePage = warehouseService.getWarehouseByKeyword(keyword, pageRequest);
        } else {
            warehousePage = warehouseService.getAllWarehousesByManager(pageRequest, req.getRemoteUser());
        }
        int totalPages = warehousePage.getTotalPages();

        List<WarehouseResponse> warehouses = warehousePage.getContent();
        return ResponseEntity.ok(WarehouseListResponse.builder()
                .warehouses(warehouses)
                .totalPages(totalPages)
                .build());
    }


    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path path = Paths.get("C:\\image\\" + filename);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{warehouseId}/images")
    public ResponseEntity<List<String>> getWarehouseImages(@PathVariable Long warehouseId) {
        try {
            List<String> imageIds = warehouseService.getWarehouseImageIds(warehouseId);
            return ResponseEntity.ok(imageIds);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{warehouseId}/images")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> addWarehouseImages(
            @PathVariable Long warehouseId,
            @RequestBody List<String> base64Images) {
        try {
            List<String> addedImageIds = warehouseService.addWarehouseImages(warehouseId, base64Images);
            return ResponseEntity.ok(addedImageIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add images: " + e.getMessage());
        }
    }

    @DeleteMapping("/{warehouseId}/images/{imageId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> deleteWarehouseImage(
            @PathVariable Long warehouseId,
            @PathVariable String imageId) {
        try {
            warehouseService.deleteWarehouseImage(warehouseId, imageId);
            return ResponseEntity.ok("Image deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete image: " + e.getMessage());
        }
    }

    @PutMapping("/{warehouseId}/images")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateWarehouseImages(
            @PathVariable Long warehouseId,
            @RequestBody List<String> base64Images) {
        try {
            List<String> updatedImageIds = warehouseService.updateWarehouseImages(warehouseId, base64Images);
            return ResponseEntity.ok(updatedImageIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update images: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseDetailResponse> getWarehouseById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));

    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES')")
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
            return ResponseEntity.ok("Xóa kho thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<WarehouseResponse>> getWarehousesWithAvailableLots() {
        return ResponseEntity.ok(warehouseService.getWarehousesWithAvailableLots());
    }
}
