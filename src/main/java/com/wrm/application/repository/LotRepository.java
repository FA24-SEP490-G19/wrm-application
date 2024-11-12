package com.wrm.application.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.wrm.application.model.Lot;
import com.wrm.application.response.lot.LotListResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LotRepository extends JpaRepository<Lot, Long> {

    Optional<Lot> findLotById(Long lotId);


}


