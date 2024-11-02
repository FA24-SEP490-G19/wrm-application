package com.wrm.application.repository;

import com.wrm.application.model.RequestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RequestTypeRepository extends JpaRepository<RequestType, Long> {

    @Query("SELECT rt FROM RequestType rt WHERE rt.id = ?1 AND rt.role.id = ?2 AND rt.isDeleted = false")
    Optional<RequestType> findByIdAndRoleId(Long id, Long roleId);
}
