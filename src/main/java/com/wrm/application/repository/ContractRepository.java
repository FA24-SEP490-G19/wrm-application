package com.wrm.application.repository;

import com.wrm.application.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    Optional<Contract> findContractById(Long id);


    @Query("SELECT c FROM Contract c WHERE NOT EXISTS (SELECT r FROM Rental r WHERE r.contract = c) AND c.isDeleted = false")
    List<Contract> findAvailableContracts();
}

