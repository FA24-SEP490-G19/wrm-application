package com.wrm.application.repository;

import com.wrm.application.model.Contract;
import com.wrm.application.model.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {

    Optional<Rental> findRentalById(Long id);
}
