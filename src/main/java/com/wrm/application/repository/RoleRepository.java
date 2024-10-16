package com.wrm.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.wrm.application.model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
