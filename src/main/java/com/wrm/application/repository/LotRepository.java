package com.wrm.application.repository;

import com.wrm.application.model.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LotRepository extends JpaRepository<Lot, Long> {

    // // Tìm tất cả các Lot dựa trên warehouseId
    // List<Lot> findByWarehouseId(Long warehouseId);

    @Query("SELECT l FROM Lot l WHERE l.warehouse_id = :warehouseId")
    List<Lot> findByWarehouseId(@Param("warehouseId") Long warehouseId);

    // // Tìm chi tiết một Lot dựa vào warehouseId và lotId
    // Optional<Lot> findByWarehouseIdAndLotId(Long warehouseId, Long lotId);
    @Query("SELECT l FROM Lot l WHERE l.warehouse.id = :warehouseId AND l.id = :lotId")
    Optional<Lot> findByWarehouseIdAndLotId(@Param("warehouseId") Long warehouseId, @Param("lotId") Long lotId);

}
