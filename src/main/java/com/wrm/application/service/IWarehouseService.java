package com.wrm.application.service;

import com.wrm.application.dto.WarehouseDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.response.warehouse.WarehouseDetailResponse;
import com.wrm.application.response.warehouse.WarehouseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface IWarehouseService {
    Page<WarehouseResponse> getAllWarehouses(PageRequest pageRequest);

    WarehouseDetailResponse getWarehouseById(Long id) throws Exception;

    WarehouseResponse createWarehouse(WarehouseDTO warehouseDTO) throws Exception;

    WarehouseResponse updateWarehouse(Long id, WarehouseDTO warehouseDTO) throws Exception;

    void deleteWarehouse(Long id) throws Exception;

    Page<WarehouseResponse> getWarehouseByKeyword(String address, PageRequest pageRequest);


    Page<WarehouseResponse> getAllWarehousesImageByWarehouseId(PageRequest pageRequest);

    void deleteWarehouseImage(Long warehouseId, String imageId) throws DataNotFoundException, IOException;

    List<String> updateWarehouseImages(Long warehouseId, List<String> base64Images) throws DataNotFoundException, IOException;

    List<String> addWarehouseImages(Long warehouseId, List<String> base64Images) throws DataNotFoundException, IOException;

    List<String> getWarehouseImageIds(Long warehouseId) throws DataNotFoundException;

    List<WarehouseResponse> getWarehousesWithAvailableLots();


    Page<WarehouseResponse> getAllWarehousesByManager(PageRequest pageRequest, String remoteUser) throws DataNotFoundException;
}
