package com.wrm.application.repository;

import com.wrm.application.model.ContractImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractImageRepository extends JpaRepository<ContractImage, Long> {

    Optional<ContractImage> findImgByContractId(Long contractId);

    List<ContractImage> findAllByContractId(Long contractId);


}
