package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.WarehouseStatus;
import com.wrm.application.dto.WarehouseDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.model.WarehouseImage;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.repository.WarehouseImageRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.response.warehouse.WarehouseDetailResponse;
import com.wrm.application.response.warehouse.WarehouseResponse;
import com.wrm.application.service.IWarehouseService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WarehouseService implements IWarehouseService {
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final WarehouseImageRepository warehouseImageRepository;

    @Override
    public Page<WarehouseResponse> getAllWarehouses(PageRequest pageRequest) {
        return warehouseRepository.findAll(pageRequest).map(warehouse -> {
            return WarehouseResponse.builder()
                    .id(warehouse.getId())
                    .name(warehouse.getName())
                    .address(warehouse.getAddress())
                    .size(warehouse.getSize())
                    .status(warehouse.getStatus())
                    .build();
        });
    }

    @Override
    public WarehouseDetailResponse getWarehouseById(Long id) throws Exception {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
        if (warehouse.isDeleted()) {
            throw new DataNotFoundException("Warehouse not found");
        }
        List<WarehouseImage> warehouseImages = warehouseImageRepository.findAllByWarehouseId(id);

        List<String> imageBase64List = new ArrayList<>();
        for (WarehouseImage warehouseImage : warehouseImages) {
            Path imagePath = Paths.get(warehouseImage.getImageUrl());
            byte[] imageBytes = Files.readAllBytes(imagePath);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            imageBase64List.add(base64Image);
        }

        return WarehouseDetailResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .size(warehouse.getSize())
                .description(warehouse.getDescription())
                .status(warehouse.getStatus())
                .warehouseManagerEmail(warehouse.getWarehouseManager().getEmail())
                .warehouseManagerName(warehouse.getWarehouseManager().getFullName())
                .warehouseManagerPhone(warehouse.getWarehouseManager().getPhoneNumber())
                .images(imageBase64List)
                .build();
    }

    @Override
    @Transactional
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

        String thumbnailFileName = null;
        if (warehouseDTO.getThumbnail() != null && !warehouseDTO.getThumbnail().isEmpty()) {
            byte[] thumbnailBytes = Base64.getDecoder().decode(warehouseDTO.getThumbnail());
            thumbnailFileName = saveImageToFileSystem(thumbnailBytes); // Lưu ảnh và lấy đường dẫn
        }

        Warehouse newWarehouse = Warehouse.builder()
                .name(warehouseDTO.getName())
                .address(warehouseDTO.getAddress())
                .size(warehouseDTO.getSize())
                .description(warehouseDTO.getDescription())
                .status(WarehouseStatus.ACTIVE)
                .warehouseManager(warehouseManager)
                .thumbnail(thumbnailFileName)
                .build();

        warehouseRepository.save(newWarehouse);

        List<WarehouseImage> warehouseImages = new ArrayList<>();
        if (warehouseDTO.getImages() != null) {
            for (String base64Image : warehouseDTO.getImages()) {
                byte[] imageBytes = Base64.getDecoder().decode(base64Image);
                String fileName = saveImageToFileSystem(imageBytes);

                WarehouseImage warehouseImage = WarehouseImage.builder()
                        .warehouse(newWarehouse)
                        .imageUrl(fileName)
                        .build();

                warehouseImages.add(warehouseImage);
            }
            warehouseImageRepository.saveAll(warehouseImages);
        }

        return WarehouseResponse.builder()
                .id(newWarehouse.getId())
                .name(newWarehouse.getName())
                .address(newWarehouse.getAddress())
                .size(newWarehouse.getSize())
                .status(newWarehouse.getStatus())
                .build();
    }

    private String saveImageToFileSystem(byte[] imageBytes) throws IOException {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new IllegalArgumentException("Image bytes cannot be null or empty");
        }
        if (imageBytes.length > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Image size exceeds the maximum limit of 10MB.");
        }
        String fileName = UUID.randomUUID().toString() + ".png";
        Path path = Paths.get("uploads/images/warehouse/" + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, imageBytes);
        return path.toString();
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
        warehouse.setAddress(warehouseDTO.getAddress());
        warehouse.setSize(warehouseDTO.getSize());
        warehouse.setStatus(warehouseDTO.getStatus());
        warehouseRepository.save(warehouse);
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .size(warehouse.getSize())
                .status(warehouse.getStatus())
                .build();
    }

    @Override
    public void deleteWarehouse(Long id) throws Exception {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
        warehouse.setDeleted(true);

        List<WarehouseImage> warehouseImages = warehouseImageRepository.findAllByWarehouseId(id);
        for (WarehouseImage image : warehouseImages) {
            image.setDeleted(true);
        }
        warehouseImageRepository.saveAll(warehouseImages);
        warehouseRepository.save(warehouse);
    }

    @Override
    public Page<WarehouseResponse> getWarehouseByKeyword(String keyword, PageRequest pageRequest) {
        return warehouseRepository.findByKeyword(keyword, pageRequest).map(warehouse -> {
            WarehouseResponse warehouseResponse = WarehouseResponse.builder()
                    .id(warehouse.getId())
                    .name(warehouse.getName())
                    .address(warehouse.getAddress())
                    .size(warehouse.getSize())
                    .status(warehouse.getStatus())
                    .build();
            return warehouseResponse;
        });
    }
}
