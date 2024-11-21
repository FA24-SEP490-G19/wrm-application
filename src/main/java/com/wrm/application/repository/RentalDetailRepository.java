package com.wrm.application.repository;

import com.wrm.application.constant.enums.RentalDetailStatus;
import com.wrm.application.model.RentalDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RentalDetailRepository extends JpaRepository<RentalDetail, Long> {
    @Query("SELECT rd FROM RentalDetail rd JOIN Rental r ON rd.rental.id = r.id WHERE r.status = 'APPROVED' AND r.warehouse.id = ?1 AND rd.isDeleted = false")
    Page<RentalDetail> findByWarehouseId(Long warehouseId, Pageable pageable);

    @Query("SELECT rd FROM RentalDetail rd JOIN Rental r ON rd.rental.id = r.id WHERE rd.status = 'ACTIVE' AND r.customer.id = ?1 AND rd.isDeleted = false")
    Page<RentalDetail> findByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT rd FROM RentalDetail rd WHERE rd.rental.id = ?1 AND rd.isDeleted = false")
    List<RentalDetail> findByRentalId(Long rentalId);

    @Query("SELECT rd FROM RentalDetail rd WHERE rd.lot.id = ?1 AND rd.isDeleted = false")
    boolean existsByStatusAndLotId(Long lotId);

    @Query("SELECT rd FROM RentalDetail rd WHERE rd.contract.id = ?1 AND rd.isDeleted = false")
    boolean existsByContractId(Long contractId);

    @Query("SELECT rd FROM RentalDetail rd WHERE rd.contract.id = :contractId AND rd.isDeleted = false")
    Optional<RentalDetail> findByContractId(@Param("contractId") Long contractId);

    @Query("SELECT rd FROM RentalDetail rd WHERE rd.lot.id = :lotId AND rd.isDeleted = false")
    List<RentalDetail> findByLotId(@Param("lotId") Long lotId);

}
