package com.wrm.application.repository;

import com.wrm.application.model.Payment;
import org.springframework.data.domain.Pageable;
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

    @Query("SELECT MONTH(p.paymentTime) AS month, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p " +
            "JOIN Rental r ON r.id = p.rental.id " +
            "WHERE YEAR(p.paymentTime) = :year AND p.paymentStatus = 'SUCCESS' AND r.sales.id = :salesId " +
            "GROUP BY MONTH(p.paymentTime) " +
            "ORDER BY MONTH(p.paymentTime)")
    List<Object[]> findMonthlyRevenueForSales(@Param("year") int year, @Param("salesId") Long salesId);

    @Query("SELECT QUARTER(p.paymentTime) AS quarter, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p " +
            "JOIN Rental r ON r.id = p.rental.id " +
            "WHERE YEAR(p.paymentTime) = :year AND p.paymentStatus = 'SUCCESS' AND r.sales.id = :salesId " +
            "GROUP BY QUARTER(p.paymentTime) " +
            "ORDER BY QUARTER(p.paymentTime)")
    List<Object[]> findQuarterlyRevenueForSales(@Param("year") int year, @Param("salesId") Long salesId);

    @Query("SELECT YEAR(p.paymentTime) AS year, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p " +
            "JOIN Rental r ON r.id = p.rental.id " +
            "WHERE p.paymentStatus = 'SUCCESS' AND r.sales.id = :salesId " +
            "GROUP BY YEAR(p.paymentTime) " +
            "ORDER BY YEAR(p.paymentTime)")
    List<Object[]> findYearlyRevenueForSales(@Param("salesId") Long salesId);

    @Query("SELECT p.user.id, p.user.fullName, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p " +
            "WHERE p.paymentStatus = 'SUCCESS' " +
            "GROUP BY p.user.id " +
            "ORDER BY totalRevenue DESC")
    List<Object[]> findTopCustomersByRevenue(Pageable pageable);

    @Query("SELECT r.warehouse.id, r.warehouse.name, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p " +
            "JOIN Rental r ON r.customer.id = p.user.id " +
            "WHERE p.paymentStatus = 'SUCCESS' " +
            "GROUP BY r.warehouse.id " +
            "ORDER BY totalRevenue DESC")
    List<Object[]> findTopWarehousesByRevenue(Pageable pageable);

    @Query("SELECT r.sales.id, r.sales.fullName, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p " +
            "JOIN Rental r ON r.customer.id = p.user.id " +
            "WHERE p.paymentStatus = 'SUCCESS' " +
            "GROUP BY r.sales.id " +
            "ORDER BY totalRevenue DESC")
    List<Object[]> findTopSalesByRevenue(Pageable pageable);

    @Query("SELECT MONTH(p.paymentTime) AS month, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p WHERE YEAR(p.paymentTime) = :year AND p.paymentStatus = 'SUCCESS' AND p.user.id = :userId " +
            "GROUP BY MONTH(p.paymentTime) ORDER BY MONTH(p.paymentTime)")
    List<Object[]> findMonthlyRevenueByCustomer(@Param("year") int year, @Param("userId") Long userId);

    @Query("SELECT QUARTER(p.paymentTime) AS quarter, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p WHERE YEAR(p.paymentTime) = :year AND p.paymentStatus = 'SUCCESS' AND p.user.id = :userId " +
            "GROUP BY QUARTER(p.paymentTime) ORDER BY QUARTER(p.paymentTime)")
    List<Object[]> findQuarterlyRevenueByCustomer(@Param("year") int year, @Param("userId") Long userId);

    @Query("SELECT YEAR(p.paymentTime) AS year, SUM(p.amount) AS totalRevenue " +
            "FROM Payment p WHERE p.paymentStatus = 'SUCCESS' AND p.user.id = :userId " +
            "GROUP BY YEAR(p.paymentTime) ORDER BY YEAR(p.paymentTime)")
    List<Object[]> findYearlyRevenueByCustomer(@Param("userId") Long userId);

    Payment findByOrderInfo(String orderInfo);

    @Query("SELECT p FROM Payment p WHERE p.rental.id = :rentalId ORDER BY p.createdDate DESC LIMIT 1")
    Payment findLatestPaymentByRentalId(@Param("rentalId") Long rentalId);

    @Query("SELECT p FROM Payment p WHERE p.rental.sales.id = :saleId ORDER BY p.createdDate DESC")
    List<Payment> findAllBySales(@Param("saleId") Long saleId);
}