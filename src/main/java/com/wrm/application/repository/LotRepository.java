package com.wrm.application.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.wrm.application.model.Lot;
import com.wrm.application.response.lot.LotListResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LotRepository extends JpaRepository<Lot, Long> {

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
}


