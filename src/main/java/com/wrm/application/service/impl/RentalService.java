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
                .orElseThrow(() -> new DataIntegrityViolationException("Không tìm thấy người dùng"));
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
            throw new IllegalArgumentException("ID khách hàng không được để trống");
        }
        if (rentalDTO.getWarehouseId() == null) {
            throw new IllegalArgumentException("ID kho hàng không được để trống");
        }
        if (rentalDTO.getLotId() == null) {
            throw new IllegalArgumentException("ID lô không được để trống");
        }

        User customer = userRepository.findById(rentalDTO.getCustomerId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy khách hàng"));
        if (customer.getRole().getId() != 1) {
            throw new DataIntegrityViolationException("Người dùng không phải là khách hàng");
        }

        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("Người dùng không phải là nhân viên bán hàng");
        }

        Lot lot = lotRepository.findById(rentalDTO.getLotId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy lô"));
        if (!lot.getWarehouse().getId().equals(rentalDTO.getWarehouseId())) {
            throw new DataIntegrityViolationException("Lô không thuộc về kho hàng đã chỉ định");
        }
        if(rentalRepository.existsByLotId(rentalDTO.getLotId())){
            throw new DataIntegrityViolationException("Lô đã được thuê");
        }

        AdditionalService additionalService = additionalServiceRepository.findById(rentalDTO.getAdditionalServiceId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy dịch vụ bổ sung"));

        Contract contract = contractRepository.findById(rentalDTO.getContractId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy hợp đồng"));


        Warehouse warehouse = warehouseRepository.findById(rentalDTO.getWarehouseId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy quản trị viên"));
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
            throw new IllegalArgumentException("Trạng thái thuê không được để trống");
        }

        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy thông tin thuê"));
        rental.setStatus(rentalDTO.getStatus());

        rentalRepository.save(rental);

        if (rentalDTO.getStatus() == RentalStatus.ACTIVE) {
            Lot lot = rental.getLot();
            lot.setStatus(LotStatus.RESERVED);
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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy thông tin thuê"));
        rental.setDeleted(true);
        rentalRepository.save(rental);
    }

    @Override
    public Page<RentalResponse> getByCustomerId(String remoteUser, PageRequest pageRequest) throws Exception {
        User customer = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy thông tin thuê"));
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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        Warehouse warehouse = warehouseRepository.findByManagerId(warehouseManager.getId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

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
