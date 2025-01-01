package com.wrm.application.service;

import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.InvalidParamException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.response.lot.LotListResponse;
import com.wrm.application.response.lot.LotResponse;
import com.wrm.application.response.warehouse.WarehouseResponse;
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

    LotResponse getLotByWarehouseID(Long id);
}
