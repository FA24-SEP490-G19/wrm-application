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

//    @Query("SELECT FUNCTION('MONTH', FUNCTION('STR_TO_DATE', p.paymentTime, '%Y-%m-%d %H:%i:%s')) AS month, " +
//            "SUM(p.amount) AS totalRevenue " +
//            "FROM Payment p " +
//            "WHERE FUNCTION('YEAR', FUNCTION('STR_TO_DATE', p.paymentTime, '%Y-%m-%d %H:%i:%s')) = :year " +
//            "AND p.paymentStatus = 'SUCCESS' " +
//            "GROUP BY FUNCTION('MONTH', FUNCTION('STR_TO_DATE', p.paymentTime, '%Y-%m-%d %H:%i:%s')) " +
//            "ORDER BY FUNCTION('MONTH', FUNCTION('STR_TO_DATE', p.paymentTime, '%Y-%m-%d %H:%i:%s'))")
//    List<Object[]> findMonthlyRevenueForYear(@Param("year") int year);
//
//    @Query("SELECT FUNCTION('QUARTER', FUNCTION('STR_TO_DATE', p.paymentTime, '%Y-%m-%d %H:%i:%s')) AS quarter, " +
//            "SUM(p.amount) AS totalRevenue " +
//            "FROM Payment p " +
//            "WHERE FUNCTION('YEAR', FUNCTION('STR_TO_DATE', p.paymentTime, '%Y-%m-%d %H:%i:%s')) = :year " +
//            "AND p.paymentStatus = 'SUCCESS' " +
//            "GROUP BY FUNCTION('QUARTER', FUNCTION('STR_TO_DATE', p.paymentTime, '%Y-%m-%d %H:%i:%s')) " +
//            "ORDER BY FUNCTION('QUARTER', FUNCTION('STR_TO_DATE', p.paymentTime, '%Y-%m-%d %H:%i:%s'))")
//    List<Object[]> findQuarterlyRevenueForYear(@Param("year") int year);
//
//    @Query("SELECT FUNCTION('YEAR', STR_TO_DATE(p.paymentTime, '%Y-%m-%d %H:%i:%s')) AS year, " +
//            "SUM(p.amount) AS totalRevenue " +
//            "FROM Payment p WHERE p.paymentStatus = 'SUCCESS' " +
//            "GROUP BY FUNCTION('YEAR', STR_TO_DATE(p.paymentTime, '%Y-%m-%d %H:%i:%s')) " +
//            "ORDER BY FUNCTION('YEAR', STR_TO_DATE(p.paymentTime, '%Y-%m-%d %H:%i:%s'))")
//    List<Object[]> findYearlyRevenue();
}