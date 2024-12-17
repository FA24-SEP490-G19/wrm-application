package com.wrm.application.repository;

import com.wrm.application.model.Rental;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
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

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END FROM Rental r WHERE r.lot.id = ?1 AND r.isDeleted = false")
    boolean existsByLotId(Long lotId);

    @Query("SELECT r FROM Rental r WHERE r.customer.id = ?1 AND r.status = 'EXPIRED' AND r.isDeleted = false")
    Page<Rental> findCompletedByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT r FROM Rental r WHERE r.startDate >= :startOfDay AND r.endDate < :endOfDay AND r.status = 'ACTIVE' AND r.isDeleted = false")
    List<Rental> findByEndDateRange(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT r FROM Rental r WHERE r.contract.id = :contractId AND r.isDeleted = false")
    Optional<Rental> findByContractId(@Param("contractId") Long contractId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END FROM Rental r WHERE r.lot.id = :lotId AND r.status = 'ACTIVE' AND r.isDeleted = false")
    boolean existsActiveRentalByLotId(@Param("lotId") Long lotId);

    @Query("SELECT r FROM Rental r WHERE r.status = 'ACTIVE' AND r.endDate < :currentDate AND r.isDeleted = false")
    List<Rental> findExpiredRentals(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT r FROM Rental r WHERE r.endDate BETWEEN :today AND :endDate AND r.status = 'ACTIVE' AND r.isDeleted = false")
    Page<Rental> findExpiringRentals(@Param("today") LocalDateTime today, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Rental r WHERE r.endDate BETWEEN :startDate AND :endDate AND r.status = 'ACTIVE' AND r.isDeleted = false")
    int countRentalsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(r) FROM Rental r WHERE r.endDate BETWEEN :startDate AND :endDate AND r.status = 'ACTIVE' AND r.sales.id = :salesId AND r.isDeleted = false")
    int countRentalsByDateRangeForSales(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Long salesId);

    @Query("SELECT r FROM Rental r WHERE r.endDate BETWEEN :startDate AND :endDate AND r.status = 'ACTIVE' AND r.sales.id = :salesId AND r.isDeleted = false")
    Page<Rental> findRentalsByDateRangeForSales(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Long salesId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Rental r WHERE r.endDate BETWEEN :today AND :endDate AND r.warehouse.id = :warehouseId AND r.status = 'ACTIVE' AND r.isDeleted = false")
    int countExpiringRentalsForWarehouse(@Param("today") LocalDateTime today, @Param("endDate") LocalDateTime endDate, @Param("warehouseId") Long warehouseId);

    @Query("SELECT r FROM Rental r WHERE r.endDate BETWEEN :today AND :endDate AND r.warehouse.id = :warehouseId AND r.status = 'ACTIVE' AND r.isDeleted = false")
    Page<Rental> findExpiringRentalsForWarehouse(@Param("today") LocalDateTime today, @Param("endDate") LocalDateTime endDate, @Param("warehouseId") Long warehouseId, Pageable pageable);
}
