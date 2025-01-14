package com.wrm.application.repository;

import com.wrm.application.model.Request;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RequestRepository extends JpaRepository<Request, Long> {
    @Query("SELECT r FROM Request r WHERE r.isDeleted = false AND r.user.id = ?1")
    Page<Request> findAllByUserId(Long id, Pageable pageable);

    @Query("SELECT r FROM Request r WHERE r.id = ?1 AND r.isDeleted = false")
    Optional<Request> findById(Long id);

    @Query("SELECT r FROM Request r WHERE r.isDeleted = false")
    Page<Request> findAll(Pageable pageable);

    @Query("SELECT COUNT(r) FROM Request r WHERE r.status = 'PENDING'")
    int countPendingRequests();

    @Query("SELECT r FROM Request r WHERE r.status = 'PENDING'")
    Page<Request> findAllPendingRequests(Pageable pageable);

    @Query("SELECT r FROM Request r WHERE r.status = 'APPROVED' OR r.status = 'REJECTED'")
    Page<Request> findAllProcessedRequests(Pageable pageable);
}
