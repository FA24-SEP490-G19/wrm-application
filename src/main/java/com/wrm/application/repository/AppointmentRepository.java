package com.wrm.application.repository;

import com.wrm.application.model.Appointment;
import com.wrm.application.model.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findById(Long id);

    Page<Appointment> findAll(Pageable pageable);
}
