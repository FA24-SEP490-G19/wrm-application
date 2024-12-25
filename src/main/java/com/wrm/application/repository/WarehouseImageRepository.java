package com.wrm.application.repository;

import com.wrm.application.model.Warehouse;
import com.wrm.application.model.WarehouseImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseImageRepository extends JpaRepository<WarehouseImage, Long> {

    List<WarehouseImage> findAllByWarehouseId(Long warehouseId);
    Optional<WarehouseImage> findByImageUrl(String imageUrl);
    void deleteAllByWarehouseId(Long warehouseId);

}
