package com.wrm.application.repository;

import com.wrm.application.model.Rental;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RentalRepository extends JpaRepository<Rental, Long> {
    @Query("SELECT r FROM Rental r WHERE r.sales.id = ?1 AND r.isDeleted = false")
    Page<Rental> findBySalesId(Long salesId, Pageable pageable);

    @Query("SELECT r FROM Rental r WHERE r.customer.id = ?1 AND r.isDeleted = false")
    Page<Rental> findByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT r FROM Rental r WHERE r.warehouse.id = ?1 AND r.isDeleted = false")
    Page<Rental> findByWarehouseId(Long warehouseId, Pageable pageable);

    @Query("SELECT r FROM Rental r WHERE r.isDeleted = false")
    Page<Rental> findAll(Pageable pageable);

    @Query("SELECT r FROM Rental r WHERE r.id = ?1 AND r.isDeleted = false")
    Optional<Rental> findById(Long id);
}
