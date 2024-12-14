package com.wrm.application.repository;

import com.wrm.application.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    @Query("SELECT f FROM Feedback f WHERE f.warehouse.id = :warehouseId AND f.isDeleted = false")
    List<Feedback> findByWarehouseId(Long warehouseId);

    @Query("SELECT f FROM Feedback f WHERE f.customer.id = :customerId AND f.isDeleted = false")
    List<Feedback> findByCustomerId(Long customerId);

    @Query("SELECT f FROM Feedback f WHERE f.id = :id AND f.isDeleted = false")
    Optional<Feedback> findById(Long id);
}
