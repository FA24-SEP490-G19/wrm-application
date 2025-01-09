package com.wrm.application.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.wrm.application.model.Lot;
import com.wrm.application.response.lot.LotListResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LotRepository extends JpaRepository<Lot, Long> {

    @Query("SELECT l FROM Lot l WHERE l.id = :lotId AND l.isDeleted = false")
    Optional<Lot> findLotById(Long lotId);


    @Query("""
        SELECT DISTINCT l FROM Lot l 
        LEFT JOIN l.rentals r 
        WHERE l.warehouse.id = :warehouseId 
        AND (l.rentals IS EMPTY OR NOT EXISTS (
            SELECT r2 FROM Rental r2 
            WHERE r2.lot = l 
        ))
        AND l.status = 'AVAILABLE'
        AND l.isDeleted = false
    """)
    List<Lot> findAvailableLotsByWarehouseId(@Param("warehouseId") Long warehouseId);

    @Query("SELECT l FROM Lot l WHERE l.warehouse.id = :warehouseId AND l.isDeleted = false")
    List<Lot> findLotsByWarehouseId(@Param("warehouseId") Long warehouseId);

    @Query("SELECT l FROM Lot l WHERE l.isDeleted = false AND l.warehouse.warehouseManager.id = :warehouseManagerId")
    Page<Lot> findLotsByWarehouseId2(@Param("warehouseManagerId") Long warehouseManagerId, Pageable pageable);

    @Query("SELECT COUNT(l) FROM Lot l " +
            "WHERE l.warehouse.id = :warehouseId " +
            "AND l.status = 'AVAILABLE' AND l.isDeleted = false")
    int countAvailableLots(@Param("warehouseId") Long warehouseId);

    @Query("SELECT COUNT(l) FROM Lot l " +
            "WHERE l.warehouse.id = :warehouseId " +
            "AND l.status = 'OCCUPIED' AND l.isDeleted = false")
    int countRentedLots(@Param("warehouseId") Long warehouseId);

}


