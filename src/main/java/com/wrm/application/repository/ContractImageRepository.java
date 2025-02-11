package com.wrm.application.repository;

import com.wrm.application.model.ContractImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractImageRepository extends JpaRepository<ContractImage, Long> {

    @Query("SELECT ci FROM ContractImage ci WHERE ci.contract.id = ?1")
    List<ContractImage> findAllByContractId(Long contractId);

    @Modifying
    @Query("DELETE FROM ContractImage ci WHERE ci.contract.id = :contractId")
    void deleteAllByContractId(@Param("contractId") Long contractId);
    List<ContractImage> findByContractId(Long contractId);
    Optional<ContractImage> findByContractImgLink(String imgLink);
}
