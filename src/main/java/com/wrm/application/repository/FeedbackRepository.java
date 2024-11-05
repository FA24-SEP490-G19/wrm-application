package com.wrm.application.repository;

import com.wrm.application.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByWarehouseId(Long warehouseId);
    List<Feedback> findByCustomerId(Long customerId);
}
