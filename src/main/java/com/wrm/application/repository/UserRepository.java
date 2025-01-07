package com.wrm.application.repository;

import com.wrm.application.constant.enums.UserStatus;
import com.wrm.application.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role.id = ?1 AND u.status = 'ACTIVE'")
    Optional<User> findByRoleId(Long roleId);

    @Query("SELECT DISTINCT u " +
            "FROM User u " +
            "LEFT JOIN Rental r ON u.id = r.customer.id AND r.sales.id = :salesId AND r.isDeleted = false " +
            "LEFT JOIN Appointment a ON u.id = a.customer.id AND a.sales.id = :salesId AND a.isDeleted = false " +
            "WHERE (r.sales.id = :salesId OR a.sales.id = :salesId)")
    List<User> findCustomersBySalesId(@Param("salesId") Long salesId);


    List<User> findCustomersByStatus(UserStatus status);
}
