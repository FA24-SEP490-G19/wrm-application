package com.wrm.application.service.impl;

import com.wrm.application.component.enums.LotStatus;
import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Lot;
import com.wrm.application.repository.LotRepository;
import com.wrm.application.service.ILotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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
    public Lot updateLotStatus(Long lotId, LotDTO lotDTO) throws DataNotFoundException {
        Lot lot = getLotById(lotId);
        LotStatus lotStatus = lotDTO.getStatus();
        lot.setStatus(lotStatus);
        return lotRepository.save(lot);
    }

}
