package com.wrm.application.repository;

import com.wrm.application.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role.id = ?1 AND u.status = 'ACTIVE'")
    Optional<User> findByRoleId(Long roleId);
}
