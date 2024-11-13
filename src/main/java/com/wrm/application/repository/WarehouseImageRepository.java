package com.wrm.application.repository;

import com.wrm.application.model.Warehouse;
import com.wrm.application.model.WarehouseImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface WarehouseImageRepository extends JpaRepository<WarehouseImage, Long> {
    @Query("SELECT wi FROM WarehouseImage wi WHERE wi.warehouse.id = ?1")
    List<WarehouseImage> findAllByWarehouseId(Long warehouseId);
}
