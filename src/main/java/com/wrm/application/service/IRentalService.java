package com.wrm.application.service;

import com.wrm.application.dto.RentalDTO;
import com.wrm.application.response.rental.RentalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface IRentalService {

    Page<RentalResponse> getAllRentals(PageRequest pageRequest);

    Page<RentalResponse> getBySalesId(String remoteUser, PageRequest pageRequest);

    RentalResponse createRental(RentalDTO rentalDTO, String remoteUser) throws Exception;

    RentalResponse updateRentalStatus(Long id, RentalDTO rentalDTO) throws Exception;

    void deleteRental(Long id) throws Exception;

    Page<RentalResponse> getByCustomerId(Long customerId, PageRequest pageRequest);

    Page<RentalResponse> getByWarehouseId(Long warehouseId, PageRequest pageRequest);

    RentalResponse getRentalById(Long id) throws Exception;
}
