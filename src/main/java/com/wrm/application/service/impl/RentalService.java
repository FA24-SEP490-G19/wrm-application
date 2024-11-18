package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.RentalDetailStatus;
import com.wrm.application.constant.enums.RentalStatus;
import com.wrm.application.dto.ContractDTO;
import com.wrm.application.dto.RentalDTO;
import com.wrm.application.dto.RentalDetailDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.*;
import com.wrm.application.repository.*;
import com.wrm.application.response.rental.RentalResponse;
import com.wrm.application.service.IMailService;
import com.wrm.application.service.IRentalService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class RentalService implements IRentalService {
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final AdditionalServiceRepository additionalServiceRepository;
    private final RentalDetailRepository rentalDetailRepository;
    private final LotRepository lotRepository;
    private final ContractRepository contractRepository;
    private final IMailService mailService;

    @Override
    public Page<RentalResponse> getAllRentals(PageRequest pageRequest) {
        return rentalRepository.findAll(pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Override
    public Page<RentalResponse> getBySalesId(String remoteUser, PageRequest pageRequest) {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataIntegrityViolationException("User not found"));
        return rentalRepository.findBySalesId(sales.getId(), pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Override
    @Transactional
    public RentalResponse createRental(RentalDTO rentalDTO, String remoteUser) throws Exception {
        if (rentalDTO.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID cannot be empty");
        }
        if (rentalDTO.getWarehouseId() == null) {
            throw new IllegalArgumentException("Warehouse ID cannot be empty");
        }
        if (rentalDTO.getRentalItems() == null || rentalDTO.getRentalItems().isEmpty()) {
            throw new IllegalArgumentException("Rental items cannot be empty");
        }

        Rental newRental = Rental.builder()
                .status(RentalStatus.PENDING)
                .build();

        User customer = userRepository.findById(rentalDTO.getCustomerId())
                .orElseThrow(() -> new DataNotFoundException("Customer not found"));
        if (customer.getRole().getId() != 1) {
            throw new DataIntegrityViolationException("User is not a customer");
        }
        newRental.setCustomer(customer);

        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("User is not a salesman");
        }
        newRental.setSales(sales);

        Warehouse warehouse = warehouseRepository.findById(rentalDTO.getWarehouseId())
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
        newRental.setWarehouse(warehouse);

        rentalRepository.save(newRental);

        List<RentalDetail> rentalDetails = new ArrayList<>();

        for (RentalDetailDTO rentalDetailDTO : rentalDTO.getRentalItems()) {
            if (rentalDetailDTO.getLotId() == null) {
                throw new IllegalArgumentException("Lot ID cannot be empty");
            }
            if (rentalDetailDTO.getStartDate() == null) {
                throw new IllegalArgumentException("Start date cannot be empty");
            }
            if (rentalDetailDTO.getEndDate() == null) {
                throw new IllegalArgumentException("End date cannot be empty");
            }
            if (rentalDetailDTO.getStartDate().toLocalDate().isBefore(LocalDate.now().plusDays(1))) {
                throw new IllegalArgumentException("Start date must be in the future");
            }
            if (rentalDetailDTO.getEndDate().isBefore(rentalDetailDTO.getStartDate().plusDays(1))) {
                throw new IllegalArgumentException("End date must be after start date");
            }

            RentalDetail rentalDetail = RentalDetail.builder()
                    .rental(newRental)
                    .startDate(rentalDetailDTO.getStartDate())
                    .endDate(rentalDetailDTO.getEndDate())
                    .status(RentalDetailStatus.PENDING)
                    .build();

            AdditionalService additionalService = additionalServiceRepository.findById(rentalDetailDTO.getAdditionalServiceId())
                    .orElseThrow(() -> new DataNotFoundException("Additional service not found"));
            rentalDetail.setAdditionalService(additionalService);

            Lot lot = lotRepository.findById(rentalDetailDTO.getLotId())
                    .orElseThrow(() -> new DataNotFoundException("Lot not found"));
            rentalDetail.setLot(lot);

            Contract contract = contractRepository.findById(rentalDetailDTO.getContractId())
                    .orElseThrow(() -> new DataNotFoundException("Contract not found"));
            rentalDetail.setContract(contract);

            rentalDetails.add(rentalDetail);
        }

        newRental.setRentalDetails(rentalDetails);

        rentalDetailRepository.saveAll(rentalDetails);


        User admin = userRepository.findByRoleId(2L)
                .orElseThrow(() -> new DataNotFoundException("Admin not found"));
        String adminEmail = admin.getEmail();
        mailService.sendRentalCreationNotification(adminEmail, newRental);

        return RentalResponse.builder()
                .id(newRental.getId())
                .customerId(newRental.getCustomer().getId())
                .salesId(newRental.getSales().getId())
                .warehouseId(newRental.getWarehouse().getId())
                .status(newRental.getStatus())
                .build();
    }

    @Override
    @Transactional
    public RentalResponse updateRentalStatus(Long id, RentalDTO rentalDTO) throws Exception {
        if (rentalDTO.getStatus() == null) {
            throw new IllegalArgumentException("Rental status cannot be empty");
        }

        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Rental not found"));
        rental.setStatus(rentalDTO.getStatus());

        rentalRepository.save(rental);

        if (rentalDTO.getStatus() == RentalStatus.APPROVED) {
            Warehouse warehouse = rental.getWarehouse();
            User manager = warehouse.getWarehouseManager();
            String managerEmail = manager.getEmail();
            mailService.sendRentalStatusUpdateNotification(managerEmail, rental);
        }

        return RentalResponse.builder()
                .id(rental.getId())
                .customerId(rental.getCustomer().getId())
                .salesId(rental.getSales().getId())
                .warehouseId(rental.getWarehouse().getId())
                .status(rental.getStatus())
                .build();
    }

    @Override
    public void deleteRental(Long id) throws Exception {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Rental not found"));
        rental.setDeleted(true);
        rentalRepository.save(rental);
    }

    @Override
    public Page<RentalResponse> getByCustomerId(Long customerId, PageRequest pageRequest) throws Exception {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        return rentalRepository.findByCustomerId(customer.getId(), pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Override
    public Page<RentalResponse> getByWarehouseId(Long warehouseId, PageRequest pageRequest) throws Exception {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
        return rentalRepository.findByWarehouseId(warehouse.getId(), pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Override
    public RentalResponse getRentalById(Long id) throws Exception {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Rental not found"));
        return RentalResponse.builder()
                .id(rental.getId())
                .customerId(rental.getCustomer().getId())
                .salesId(rental.getSales().getId())
                .warehouseId(rental.getWarehouse().getId())
                .status(rental.getStatus())
                .build();
    }
}
