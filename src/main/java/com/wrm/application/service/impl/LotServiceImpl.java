package com.wrm.application.service.impl;

import com.wrm.application.model.Lot;
import com.wrm.application.repository.LotRepository;
import com.wrm.application.service.LotService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class LotServiceImpl implements LotService {

    private final LotRepository lotRepository;

    // Lấy danh sách các Lot dựa vào warehouseId
    @Override
    public List<Lot> getLotsByWarehouseId(Long warehouseId) {
        return lotRepository.findByWarehouseId(warehouseId);
    }

    // Lấy chi tiết một Lot dựa vào warehouseId và lotId
    @Override
    public Optional<Lot> getLotDetail(Long warehouseId, Long lotId) {
        return lotRepository.findByWarehouseIdAndLotId(warehouseId, lotId);
    }
}
