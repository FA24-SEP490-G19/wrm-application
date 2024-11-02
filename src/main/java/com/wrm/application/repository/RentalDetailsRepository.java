package com.wrm.application.repository;

import com.wrm.application.model.RentalDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RentalDetailsRepository extends JpaRepository<RentalDetails, Long> {

    Optional<RentalDetails> findByRentalId(Long rentalId);

}
