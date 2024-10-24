package com.wrm.application.service.impl;

import com.wrm.application.component.enums.LotStatus;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.model.Lot;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.LotRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.service.ILotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LotService implements ILotService {
    private final LotRepository lotRepository;

    @Override
    public List<Lot> getAllLots() {
        return lotRepository.findAll();
    }

    @Override
    public Lot getLotById(Long id) throws DataNotFoundException {
        return lotRepository.findLotById(id).orElseThrow(() -> new DataNotFoundException("Lot not found with ID: " + id));

    }

    @Override
    public Lot updateLotStatus(Long lotId, LotStatus newStatus) throws DataNotFoundException {
        Lot lot = getLotById(lotId);
        lot.setStatus(newStatus);
        return lotRepository.save(lot);
    }

}
