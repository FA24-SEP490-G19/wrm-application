package com.wrm.application.repository;

import com.wrm.application.model.Appointment;
import com.wrm.application.model.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findById(Long id);

    Page<Appointment> findAll(Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.customer.id = ?1")
    Page<Appointment> findByCustomerId(Long id, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.warehouse.id = ?1")
    Page<Appointment> findByWarehouseId(Long id, Pageable pageable);
}
