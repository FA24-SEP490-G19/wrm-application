package com.wrm.application.service.impl;

import com.wrm.application.component.enums.LotStatus;
import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.model.Lot;
import com.wrm.application.model.User;
import com.wrm.application.repository.LotRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.service.ILotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LotService implements ILotService {
    private final LotRepository lotRepository;
    private final UserRepository userRepository;

    @Override
    public List<Lot> getAllLots() {
        return lotRepository.findAll();
    }

    @Override
    public Lot getLotById(Long id)  {
        return lotRepository.findLotById(id).orElse(null);
    }

    @Override
    public Lot updateLotStatus(Long lotId, LotDTO lotDTO, String remoteUser) throws PermissionDenyException, DataNotFoundException {
        User manager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Manager not found"));

        if (manager.getRole().getId() != 4) {
            throw new PermissionDenyException("User is not a manager");
        }

        Lot lot = lotRepository.findById(lotId)
                .orElseThrow(() -> new DataNotFoundException("Lot not found with ID: " + lotId));

        LotStatus lotStatus = lotDTO.getStatus();
        lot.setStatus(lotStatus);

        return lotRepository.save(lot);
    }


}
