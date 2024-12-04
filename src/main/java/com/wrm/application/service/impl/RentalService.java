package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.LotStatus;
import com.wrm.application.constant.enums.RentalStatus;
import com.wrm.application.dto.RentalDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.*;
import com.wrm.application.repository.*;
import com.wrm.application.response.rental.RentalDetailResponse;
import com.wrm.application.response.rental.RentalResponse;
import com.wrm.application.service.IMailService;
import com.wrm.application.service.IRentalService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class RentalService implements IRentalService {
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final AdditionalServiceRepository additionalServiceRepository;
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
                    .lotId(rental.getLot().getId())
                    .additionalServiceId(rental.getAdditionalService().getId())
                    .contractId(rental.getContract().getId())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
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
                    .lotId(rental.getLot().getId())
                    .additionalServiceId(rental.getAdditionalService().getId())
                    .contractId(rental.getContract().getId())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
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
        if (rentalDTO.getLotId() == null) {
            throw new IllegalArgumentException("Lot ID cannot be empty");
        }

        User customer = userRepository.findById(rentalDTO.getCustomerId())
                .orElseThrow(() -> new DataNotFoundException("Customer not found"));
        if (customer.getRole().getId() != 1) {
            throw new DataIntegrityViolationException("User is not a customer");
        }

        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("User is not a salesman");
        }

        Lot lot = lotRepository.findById(rentalDTO.getLotId())
                .orElseThrow(() -> new DataNotFoundException("Lot not found"));
        if (!lot.getWarehouse().getId().equals(rentalDTO.getWarehouseId())) {
            throw new DataIntegrityViolationException("Lot does not belong to the specified warehouse");
        }
        if(rentalRepository.existsByLotId(rentalDTO.getLotId())){
            throw new DataIntegrityViolationException("Lot already used");
        }

        AdditionalService additionalService = additionalServiceRepository.findById(rentalDTO.getAdditionalServiceId())
                .orElseThrow(() -> new DataNotFoundException("Additional service not found"));

        Contract contract = contractRepository.findById(rentalDTO.getContractId())
                .orElseThrow(() -> new DataNotFoundException("Contract not found"));


        Warehouse warehouse = warehouseRepository.findById(rentalDTO.getWarehouseId())
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));

        Rental newRental = Rental.builder()
                .warehouse(warehouse)
                .lot(lot)
                .sales(sales)
                .customer(customer)
                .contract(contract)
                .startDate(contract.getSignedDate())
                .endDate(contract.getExpiryDate())
                .additionalService(additionalService)
                .status(RentalStatus.PENDING)
                .build();

        rentalRepository.save(newRental);

        User admin = userRepository.findByRoleId(2L)
                .orElseThrow(() -> new DataNotFoundException("Admin not found"));
        String adminEmail = admin.getEmail();
        mailService.sendRentalCreationNotification(adminEmail, newRental);

        return RentalResponse.builder()
                .id(newRental.getId())
                .customerId(newRental.getCustomer().getId())
                .salesId(newRental.getSales().getId())
                .warehouseId(newRental.getWarehouse().getId())
                .lotId(newRental.getLot().getId())
                .additionalServiceId(newRental.getAdditionalService().getId())
                .contractId(newRental.getContract().getId())
                .startDate(newRental.getStartDate())
                .endDate(newRental.getEndDate())
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

        if (rentalDTO.getStatus() == RentalStatus.ACTIVE) {
            Lot lot = rental.getLot();
            lot.setStatus(LotStatus.OCCUPIED);
            lotRepository.save(lot);

            Warehouse warehouse = rental.getWarehouse();
            User manager = warehouse.getWarehouseManager();
            String managerEmail = manager.getEmail();
            mailService.sendRentalStatusUpdateNotification(managerEmail, rental);
        }
        if (rentalDTO.getStatus() == RentalStatus.EXPIRED || rentalDTO.getStatus() == RentalStatus.TERMINATED) {
            Lot lot = rental.getLot();
            lot.setStatus(LotStatus.AVAILABLE);
            lotRepository.save(lot);
        }

        return RentalResponse.builder()
                .id(rental.getId())
                .salesId(rental.getSales().getId())
                .customerId(rental.getCustomer().getId())
                .warehouseId(rental.getWarehouse().getId())
                .lotId(rental.getLot().getId())
                .additionalServiceId(rental.getAdditionalService().getId())
                .contractId(rental.getContract().getId())
                .startDate(rental.getStartDate())
                .endDate(rental.getEndDate())
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
    public Page<RentalResponse> getByCustomerId(String remoteUser, PageRequest pageRequest) throws Exception {
        User customer = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        return rentalRepository.findByCustomerId(customer.getId(), pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .lotId(rental.getLot().getId())
                    .additionalServiceId(rental.getAdditionalService().getId())
                    .contractId(rental.getContract().getId())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
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
                .salesId(rental.getSales().getId())
                .customerId(rental.getCustomer().getId())
                .warehouseId(rental.getWarehouse().getId())
                .lotId(rental.getLot().getId())
                .additionalServiceId(rental.getAdditionalService().getId())
                .contractId(rental.getContract().getId())
                .startDate(rental.getStartDate())
                .endDate(rental.getEndDate())
                .status(rental.getStatus())
                .build();
    }

    @Override
    public Page<RentalResponse> getByWarehouseId(String remoteUser, PageRequest pageRequest) throws Exception {
        User warehouseManager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        Warehouse warehouse = warehouseRepository.findByManagerId(warehouseManager.getId())
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));

        return rentalRepository.findByWarehouseId(warehouse.getId(), pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .lotId(rental.getLot().getId())
                    .additionalServiceId(rental.getAdditionalService().getId())
                    .contractId(rental.getContract().getId())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
                    .status(rental.getStatus())
                    .build();
        });
    }

    public Page<RentalResponse> getHistoryByCustomerId(String remoteUser, PageRequest pageRequest) throws Exception {
        User customer = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        return rentalRepository.findCompletedByCustomerId(customer.getId(), pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .lotId(rental.getLot().getId())
                    .additionalServiceId(rental.getAdditionalService().getId())
                    .contractId(rental.getContract().getId())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Scheduled(cron = "0 0 0 * * ?") // Chạy vào lúc 00:00 hàng ngày
    public void autoUpdateExpiredRentals() {
        rentalRepository.findExpiredRentals(LocalDateTime.now()).forEach(rental -> {
            rental.setStatus(RentalStatus.EXPIRED);
            rentalRepository.save(rental);
        });
    }
}
