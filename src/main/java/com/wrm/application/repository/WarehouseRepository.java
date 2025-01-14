package com.wrm.application.repository;

import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findById(Long id);

    @Query("SELECT w FROM Warehouse w WHERE w.isDeleted = false")
    Page<Warehouse> findAll(Pageable pageable);

    @Query("SELECT w FROM Warehouse w WHERE w.isDeleted = false AND w.warehouseManager.id = :managerId")
    Page<Warehouse> findAllByManager(Pageable pageable, @Param("managerId") Long managerId);

    @Query("SELECT w FROM Warehouse w WHERE (w.address LIKE %?1% OR w.name LIKE %?1%) AND w.isDeleted = false")
    Page<Warehouse> findByKeyword(String keyword, Pageable pageable);

    @Query("SELECT w FROM Warehouse w WHERE w.warehouseManager.id = ?1 AND w.isDeleted = false")
    Optional<Warehouse> findByManagerId(Long id);

    boolean existsWarehouseByWarehouseManager(User user);

    boolean existsByWarehouseManagerId(Long id);

    @Query("SELECT DISTINCT w " +
            "FROM Warehouse w " +
            "JOIN Lot l ON w.id = l.warehouse.id " +
            "WHERE l.status = 'AVAILABLE' AND l.isDeleted = false AND w.isDeleted = false")
    List<Warehouse> findWarehousesWithAvailableLots();
}
