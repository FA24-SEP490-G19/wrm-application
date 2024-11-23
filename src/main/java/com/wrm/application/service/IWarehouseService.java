package com.wrm.application.service;

import com.wrm.application.dto.warehouse.WarehouseDTO;
import com.wrm.application.dto.warehouse.WarehouseUpdateDTO;
import com.wrm.application.response.warehouse.WarehouseDetailResponse;
import com.wrm.application.response.warehouse.WarehouseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface IWarehouseService {
    Page<WarehouseResponse> getAllWarehouses(PageRequest pageRequest);

    WarehouseDetailResponse getWarehouseById(Long id) throws Exception;

    WarehouseResponse createWarehouse(WarehouseDTO warehouseDTO) throws Exception;

    WarehouseResponse updateWarehouse(Long id, WarehouseUpdateDTO warehouseUpdateDTO) throws Exception;

    void deleteWarehouse(Long id) throws Exception;

    Page<WarehouseResponse> getWarehouseByKeyword(String address, PageRequest pageRequest);

    Page<WarehouseResponse> getWarehouseByCriteria(String keyword, Float minSize, Float maxSize, String status, PageRequest pageRequest);
}
