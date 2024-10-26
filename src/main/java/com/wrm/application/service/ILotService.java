package com.wrm.application.service;

import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Lot;

import java.util.List;

public interface ILotService {

    List<Lot> getAllLots();

    Lot getLotById(Long id) throws DataNotFoundException;

    Lot updateLotStatus(Long lotId, LotDTO lotDTO) throws DataNotFoundException;
}
