package com.wrm.application.service;

import com.wrm.application.model.Lot;

import java.util.List;
import java.util.Optional;

public interface LotService {

    // Lấy danh sách tất cả các Lot trong một warehouse
    List<Lot> getLotsByWarehouseId(Long warehouseId);

    // Lấy chi tiết của một Lot cụ thể dựa vào warehouseId và lotId
    Optional<Lot> getLotDetail(Long warehouseId, Long lotId);
}
