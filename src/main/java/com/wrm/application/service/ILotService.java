package com.wrm.application.service;

import com.wrm.application.component.enums.LotStatus;
import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Lot;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;

import java.util.List;
import java.util.Optional;

public interface ILotService {

    List<Lot> getAllLots();

    Lot getLotById(Long id) throws DataNotFoundException;

    Lot updateLotStatus(Long lotId, LotStatus newStatus) throws DataNotFoundException;


}
