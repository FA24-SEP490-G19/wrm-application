package com.wrm.application.repository;

import com.wrm.application.model.Contract;
import com.wrm.application.model.ContractImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    Optional<Contract> findContractById(Long id);

}

