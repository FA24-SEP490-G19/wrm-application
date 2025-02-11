package com.wrm.application.service;

import com.wrm.application.dto.RentalDTO;
import com.wrm.application.response.rental.RentalResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface IRentalService {

    Page<RentalResponse> getAllRentals(PageRequest pageRequest);

    Page<RentalResponse> getBySalesId(String remoteUser, PageRequest pageRequest);

    RentalResponse createRental(RentalDTO rentalDTO, String remoteUser) throws Exception;

    RentalResponse updateRentalStatus(Long id, RentalDTO rentalDTO) throws Exception;

    void deleteRental(Long id) throws Exception;

    Page<RentalResponse> getByCustomerId(String remoteUser, PageRequest pageRequest) throws Exception;

    RentalResponse getRentalById(Long id) throws Exception;

    Page<RentalResponse> getByWarehouseId(String remoteUser, PageRequest pageRequest) throws Exception;

    Page<RentalResponse> getHistoryByCustomerId(String remoteUser, PageRequest pageRequest) throws Exception;

    Page<RentalResponse> getAllExpiringRentals(PageRequest pageRequest);

    Page<RentalResponse> getAllExpiringRentalsForSales(String remoteUser, PageRequest pageRequest) throws Exception;

    Page<RentalResponse> getSignedRentalsInAMonthForSales(String remoteUser, PageRequest pageRequest) throws Exception;

    Page<RentalResponse> getAllExpiringRentalsForWarehouse(String remoteUser, PageRequest pageRequest) throws Exception;

    @Transactional
    RentalResponse updateRentalSales(Long id, Long salesId) throws Exception;
}
