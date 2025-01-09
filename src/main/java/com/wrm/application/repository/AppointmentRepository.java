package com.wrm.application.repository;

import com.wrm.application.model.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findById(Long id);

    @Query("SELECT a FROM Appointment a WHERE a.isDeleted = false")
    Page<Appointment> findAll(Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.customer.id = ?1 AND a.isDeleted = false")
    Page<Appointment> findByCustomerId(Long id, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.warehouse.id = ?1 AND a.isDeleted = false")
    Page<Appointment> findByWarehouseId(Long id, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.sales.id = ?1 AND a.isDeleted = false")
    Page<Appointment> findBySalesId(Long id, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.sales.id IS NULL AND a.isDeleted = false")
    Page<Appointment> findUnassignedAppointments(Pageable pageable);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.sales.id IS NULL AND a.isDeleted = false")
    int countUnassignedAppointments();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = 'PENDING' AND a.sales.id = :salesId AND a.isDeleted = false")
    int countPendingAppointmentsForSales(Long salesId);

    @Query("SELECT a FROM Appointment a WHERE a.status = 'PENDING' AND a.sales.id = :salesId AND a.isDeleted = false")
    Page<Appointment> findPendingAppointmentsForSales(Long salesId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.sales.id = :salesId AND a.appointmentDate BETWEEN :startDate AND :endDate AND a.status = 'ACCEPTED' AND a.isDeleted = false")
    int countUpcomingAppointmentsForSales(@Param("salesId") Long salesId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM Appointment a WHERE a.warehouse.id = :warehouseId AND a.appointmentDate BETWEEN :startDate AND :endDate AND a.status = 'ACCEPTED' AND a.isDeleted = false")
    Page<Appointment> findUpcomingAppointmentsForSales(@Param("warehouseId") Long warehouseId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.warehouse.id = :warehouseId AND a.appointmentDate BETWEEN :today AND :endDate AND a.status = 'ACCEPTED' AND a.isDeleted = false")
    int countUpcomingAppointmentsForWarehouse(@Param("warehouseId") Long warehouseId, @Param("today") LocalDateTime today, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM Appointment a WHERE a.warehouse.id = :warehouseId AND a.appointmentDate BETWEEN :today AND :endDate AND a.status = 'ACCEPTED' AND a.isDeleted = false")
    Page<Appointment> findUpcomingAppointmentsForWarehouse(@Param("warehouseId") Long warehouseId, @Param("today") LocalDateTime today, @Param("endDate") LocalDateTime endDate, Pageable pageable);
}
