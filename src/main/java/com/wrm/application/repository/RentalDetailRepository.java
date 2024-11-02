package com.wrm.application.repository;

import com.wrm.application.model.RentalDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RentalDetailRepository extends JpaRepository<RentalDetail, Long> {
    @Query("SELECT rd FROM RentalDetail rd JOIN Rental r ON rd.rental.id = r.id WHERE r.warehouse.id = ?1 AND rd.isDeleted = false")
    Page<RentalDetail> findByWarehouseId(Long warehouseId, Pageable pageable);

    @Query("SELECT rd FROM RentalDetail rd JOIN Rental r ON rd.rental.id = r.id WHERE r.customer.id = ?1 AND rd.isDeleted = false")
    Page<RentalDetail> findByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT rd FROM RentalDetail rd WHERE rd.rental.id = ?1 AND rd.isDeleted = false")
    List<RentalDetail> findByRentalId(Long rentalId);
}
