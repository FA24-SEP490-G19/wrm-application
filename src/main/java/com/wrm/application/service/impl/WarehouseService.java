package com.wrm.application.service.impl;

import com.wrm.application.WarehouseMapper;
import com.wrm.application.constant.enums.LotStatus;
import com.wrm.application.constant.enums.WarehouseStatus;
import com.wrm.application.dto.LotDTO;
import com.wrm.application.dto.WarehouseDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Lot;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.model.WarehouseImage;
import com.wrm.application.repository.LotRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.repository.WarehouseImageRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.response.warehouse.WarehouseDetailResponse;
import com.wrm.application.response.warehouse.WarehouseResponse;
import com.wrm.application.service.IWarehouseService;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseService implements IWarehouseService {
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final WarehouseImageRepository warehouseImageRepository;
    private final LotRepository lotRepository;
    private final WarehouseMapper warehouseMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<WarehouseResponse> getAllWarehouses(PageRequest pageRequest) {
        return warehouseRepository.findAll(pageRequest)
                .map(warehouse -> {
                    // Force initialization of the collection
                    Hibernate.initialize(warehouse.getWarehouseImages());
                    return warehouseMapper.toWarehouseResponse(warehouse);
                });
    }

    @Override
    public WarehouseDetailResponse getWarehouseById(Long id) throws Exception {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));
        if (warehouse.isDeleted()) {
            throw new DataNotFoundException("Không tìm thấy kho hàng");
        }
        List<WarehouseImage> warehouseImages = warehouseImageRepository.findAllByWarehouseId(id);

        List<String> imageBase64List = new ArrayList<>();
        for (WarehouseImage warehouseImage : warehouseImages) {

            imageBase64List.add(warehouseImage.getImageUrl());
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
            throw new IllegalArgumentException("Tên kho hàng không được để trống");
        }
        if (warehouseDTO.getAddress() == null || warehouseDTO.getAddress().isEmpty()) {
            throw new IllegalArgumentException("Địa chỉ kho hàng không được để trống");
        }
        if (warehouseDTO.getSize() <= 0) {
            throw new IllegalArgumentException("Kích thước kho hàng phải là một số dương");
        }
        if (warehouseDTO.getDescription() == null || warehouseDTO.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Mô tả kho hàng không được để trống");
        }

        User warehouseManager = userRepository.findById(warehouseDTO.getWarehouseManagerId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        if (warehouseManager.getRole().getId() != 4) {
            throw new DataIntegrityViolationException("Người dùng không phải là quản lý kho hàng");
        }
        if (warehouseRepository.existsWarehouseByWarehouseManager(warehouseManager)) {
            throw new DataIntegrityViolationException("Quản lý kho hàng này đã phụ trách một kho khác");
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

        List<Lot> lots = new ArrayList<>();

        for(LotDTO lotDTO : warehouseDTO.getLotItems()) {
            Lot lot = Lot.builder()
                    .description(lotDTO.getDescription())
                    .size(lotDTO.getSize())
                    .status(LotStatus.AVAILABLE)
                    .warehouse(newWarehouse)
                    .price(lotDTO.getPrice())
                    .build();
            lots.add(lot);
        }
//
//        float totalLotSize = warehouseDTO.getLotItems().stream()
//                .map(LotDTO::getSize)
//                .reduce(0f, Float::sum);
//
//        if (totalLotSize != warehouseDTO.getSize()) {
//            throw new IllegalArgumentException("Total size of lots have to be equal to the warehouse size.");
//        }

        newWarehouse.setLots(lots);

        lotRepository.saveAll(lots);

        List<WarehouseImage> warehouseImages = new ArrayList<>();
        if (warehouseDTO.getImages() != null) {
            for (String base64Image : warehouseDTO.getImages()) {
                byte[] thumbnailBytes = Base64.getDecoder().decode(base64Image);
                thumbnailFileName = saveImageToFileSystem(thumbnailBytes); // Lưu ảnh và lấy đường dẫn
                WarehouseImage warehouseImage = WarehouseImage.builder()
                        .warehouse(newWarehouse)
                        .imageUrl(thumbnailFileName)
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
                .thumbnail(newWarehouse.getThumbnail())
                .build();
    }

    private String saveImageToFileSystem(byte[] imageBytes) throws IOException {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new IllegalArgumentException("Dữ liệu ảnh không được để trống");
        }
        if (imageBytes.length > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Kích thước ảnh vượt quá giới hạn tối đa 10MB.");
        }
        String fileName = UUID.randomUUID().toString() + ".png";
        Path path = Paths.get("C:\\image\\" + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, imageBytes);
        return fileName;
    }

    @Override
    public WarehouseResponse updateWarehouse(Long id, WarehouseDTO warehouseDTO) throws Exception {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        if (warehouseDTO.getName() == null || warehouseDTO.getName().isEmpty()) {
            throw new IllegalArgumentException("Tên kho hàng không được để trống");
        }
        if (warehouseDTO.getDescription() == null || warehouseDTO.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Mô tả kho hàng không được để trống");
        }
        if (warehouseDTO.getStatus() == null) {
            throw new IllegalArgumentException("Trạng thái kho hàng không được để trống");
        }

        // Only process thumbnail if a new one is provided
        if (warehouseDTO.getThumbnail() != null && !warehouseDTO.getThumbnail().isEmpty()) {
            try {
                byte[] thumbnailBytes = Base64.getDecoder().decode(warehouseDTO.getThumbnail());
                String thumbnailFileName = saveImageToFileSystem(thumbnailBytes);
                warehouse.setThumbnail(thumbnailFileName);
            } catch (IllegalArgumentException e) {
                // If not valid base64, assume it's an existing file path
                warehouse.setThumbnail(warehouseDTO.getThumbnail());
            }
        }

        warehouse.setName(warehouseDTO.getName());
        warehouse.setDescription(warehouseDTO.getDescription());
        warehouse.setStatus(warehouseDTO.getStatus());
        warehouse.setSize(warehouseDTO.getSize());
        warehouse.setAddress(warehouseDTO.getAddress());

        warehouseRepository.save(warehouse);
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .size(warehouse.getSize())
                .status(warehouse.getStatus())
                .thumbnail(warehouse.getThumbnail())
                .build();
    }

    @Override
    public void deleteWarehouse(Long id) throws Exception {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));
        warehouse.setDeleted(true);
        warehouse.setStatus(WarehouseStatus.INACTIVE);

        List<WarehouseImage> warehouseImages = warehouseImageRepository.findAllByWarehouseId(id);
        for (WarehouseImage image : warehouseImages) {
            image.setDeleted(true);
        }
        warehouseImageRepository.saveAll(warehouseImages);

        List<Lot> lots = lotRepository.findLotsByWarehouseId(id);
        for (Lot lot : lots) {
            lot.setDeleted(true);
        }
        lotRepository.saveAll(lots);

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

    @Override
    public Page<WarehouseResponse> getAllWarehousesImageByWarehouseId(PageRequest pageRequest) {
        return null;
    }

    @Override
    public List<String> getWarehouseImageIds(Long warehouseId) throws DataNotFoundException {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        return warehouseImageRepository.findAllByWarehouseId(warehouseId)
                .stream()
                .map(WarehouseImage::getImageUrl)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<String> addWarehouseImages(Long warehouseId, List<String> base64Images) throws DataNotFoundException, IOException {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        List<WarehouseImage> newImages = new ArrayList<>();
        List<String> imageIds = new ArrayList<>();

        for (String base64Image : base64Images) {
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            String fileName = saveImageToFileSystem(imageBytes);
            imageIds.add(fileName);

            WarehouseImage warehouseImage = WarehouseImage.builder()
                    .warehouse(warehouse)
                    .imageUrl(fileName)
                    .build();
            newImages.add(warehouseImage);
        }

        warehouseImageRepository.saveAll(newImages);
        return imageIds;
    }

    @Override
    @Transactional
    public void deleteWarehouseImage(Long warehouseId, String imageId) throws DataNotFoundException, IOException {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        WarehouseImage warehouseImage = warehouseImageRepository.findByImageUrl(imageId)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy hình ảnh"));

        if (!warehouseImage.getWarehouse().getId().equals(warehouseId)) {
            throw new IllegalArgumentException("Hình ảnh không thuộc về kho hàng này");
        }

        // Delete physical file
        Path filePath = Paths.get("C:\\image\\" + imageId);
        Files.deleteIfExists(filePath);

        // Delete database record
        warehouseImageRepository.delete(warehouseImage);
    }

    @Override
    @Transactional
    public List<String> updateWarehouseImages(Long warehouseId, List<String> base64Images) throws DataNotFoundException, IOException {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        // Delete existing images
        List<WarehouseImage> existingImages = warehouseImageRepository.findAllByWarehouseId(warehouseId);
        for (WarehouseImage img : existingImages) {
            Path filePath = Paths.get("C:\\image\\" + img.getImageUrl());
            Files.deleteIfExists(filePath);
        }
        warehouseImageRepository.deleteAllByWarehouseId(warehouseId);

        // Add new images
        return addWarehouseImages(warehouseId, base64Images);
    }

    @Override
    @Transactional
    public List<WarehouseResponse> getWarehousesWithAvailableLots() {
        List<Warehouse> warehouses = warehouseRepository.findWarehousesWithAvailableLots();
        return warehouses.stream()
                .map(warehouseMapper::toWarehouseResponse)
                .collect(Collectors.toList());
    }
}
