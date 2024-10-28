package com.wrm.application.service;

import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.model.Lot;

import java.util.List;

public interface ILotService {

    List<Lot> getAllLots();

    Lot getLotById(Long id) ;

    Lot updateLotStatus(Long lotId,LotDTO lotDTO, String remoteUser) throws PermissionDenyException, DataNotFoundException;
}
