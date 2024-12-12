package com.wrm.application.repository;

import com.wrm.application.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionRef(String transactionRef);

    List<Payment> findAllByOrderByCreatedDateDesc();

    List<Payment> findByUserId(Long userId);

    @Query("SELECT MONTH(p.paymentTime) AS month, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p WHERE YEAR(p.paymentTime) = :year AND p.paymentStatus = 'SUCCESS' " +
            "GROUP BY MONTH(p.paymentTime) ORDER BY MONTH(p.paymentTime)")
    List<Object[]> findMonthlyRevenueForYear(@Param("year") int year);

    @Query("SELECT QUARTER(p.paymentTime) AS quarter, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p WHERE YEAR(p.paymentTime) = :year AND p.paymentStatus = 'SUCCESS' " +
            "GROUP BY QUARTER(p.paymentTime) ORDER BY QUARTER(p.paymentTime)")
    List<Object[]> findQuarterlyRevenueForYear(@Param("year") int year);

    @Query("SELECT YEAR(p.paymentTime) AS year, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p WHERE p.paymentStatus = 'SUCCESS' " +
            "GROUP BY YEAR(p.paymentTime) ORDER BY YEAR(p.paymentTime)")
    List<Object[]> findYearlyRevenue();
}