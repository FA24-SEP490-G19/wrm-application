package com.wrm.application.repository;

import com.wrm.application.model.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LotRepository extends JpaRepository<Lot, Long> {

    Optional<Lot> findLotById(Long lotId);


}


