package com.wrm.application.service;

import com.wrm.application.dto.LotDTO;
import com.wrm.application.response.lot.LotResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface ILotService {

    Page<LotResponse> getAllLots(PageRequest pageRequest);

  //LotResponse getLotByWarehouseID(Long id) throws Exception;


    LotResponse updateLot(Long lotId, LotDTO lotDTO) throws Exception;

    void deleteLot(Long lotId) throws Exception;

    LotResponse updateLotStatus(Long lotId,LotDTO lotDTO, String remoteUser) throws Exception;

    List<LotResponse> getAvailableLotsByWarehouseId(Long warehouseId);

    Page<LotResponse> getLotByWarehouseID(PageRequest pageRequest, String remoteUser);
}
