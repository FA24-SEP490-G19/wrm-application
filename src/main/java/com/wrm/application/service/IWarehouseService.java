package com.wrm.application.service;

import com.wrm.application.model.Warehouse;

import java.util.List;

public interface IWarehouseService {
    List<Warehouse> getAllWarehouses();
    Warehouse getWarehouseById(Long id);
}
