package com.wrm.application.service;

import com.wrm.application.dto.WarehouseDTO;
import com.wrm.application.response.warehouse.WarehouseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface IWarehouseService {
    Page<WarehouseResponse> getAllWarehouses(PageRequest pageRequest);

    WarehouseResponse getWarehouseById(Long id) throws Exception;

    WarehouseResponse createWarehouse(WarehouseDTO warehouseDTO) throws Exception;

    WarehouseResponse updateWarehouse(Long id, WarehouseDTO warehouseDTO) throws Exception;

    void deleteWarehouse(Long id) throws Exception;

    Page<WarehouseResponse> getWarehouseByNameOrAddress(String address, PageRequest pageRequest);
}
