package com.wrm.application.service;

import com.wrm.application.dto.RentalDetailDTO;
import com.wrm.application.response.rental.RentalDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface IRentalDetailService {
    Page<RentalDetailResponse> getByWarehouseId(String remoteUser, PageRequest pageRequest) throws Exception;

    Page<RentalDetailResponse> getByCustomerId(String remoteUser, PageRequest pageRequest) throws Exception;

    List<RentalDetailResponse> getByRentalId(Long rentalId) throws Exception;

    RentalDetailResponse updateRentalDetailStatus(Long id, RentalDetailDTO rentalDetailDTO) throws Exception;
}
