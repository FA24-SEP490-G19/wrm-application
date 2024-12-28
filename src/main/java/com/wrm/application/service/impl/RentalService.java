package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.LotStatus;
import com.wrm.application.constant.enums.RentalStatus;
import com.wrm.application.constant.enums.RentalType;
import com.wrm.application.dto.RentalDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.*;
import com.wrm.application.repository.*;
import com.wrm.application.response.rental.RentalResponse;
import com.wrm.application.service.IMailService;
import com.wrm.application.service.IRentalService;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

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
    private final PaymentService paymentService;

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
                    .rentalType(rental.getRentalType())
                    .price(rental.getPrice())
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
                    .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                    .contractId(rental.getContract().getId())
                    .rentalType(rental.getRentalType())
                    .price(rental.getPrice())
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
        if (rentalRepository.existsByLotId(rentalDTO.getLotId())) {
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
                .rentalType(rentalDTO.getRentalType())
                .price(rentalDTO.getPrice())
                .startDate(contract.getSignedDate())
                .endDate(contract.getExpiryDate())
                .additionalService(additionalService)
                .status(RentalStatus.ACTIVE)
                .build();

        rentalRepository.save(newRental);

        User admin = userRepository.findByRoleId(3L)
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
                .rentalType(newRental.getRentalType())
                .price(newRental.getPrice())
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
        if (rentalDTO.getStatus() == RentalStatus.TERMINATED) {
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
                .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                .contractId(rental.getContract().getId())
                .rentalType(rental.getRentalType())
                .price(rental.getPrice())
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
        rental.setStatus(RentalStatus.TERMINATED);
        rentalRepository.save(rental);

        Contract contract = rental.getContract();
        contract.setDeleted(true);
        contractRepository.save(contract);
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
                    .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                    .contractId(rental.getContract().getId())
                    .rentalType(rental.getRentalType())
                    .price(rental.getPrice())
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
                .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                .contractId(rental.getContract().getId())
                .rentalType(rental.getRentalType())
                .price(rental.getPrice())
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
                    .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                    .contractId(rental.getContract().getId())
                    .rentalType(rental.getRentalType())
                    .price(rental.getPrice())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Override
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
                    .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                    .contractId(rental.getContract().getId())
                    .rentalType(rental.getRentalType())
                    .price(rental.getPrice())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void autoUpdateExpiredRentals() {
        rentalRepository.findExpiredRentals(LocalDateTime.now()).forEach(rental -> {
            rental.setStatus(RentalStatus.EXPIRED);
            rentalRepository.save(rental);

            Lot lot = rental.getLot();
            lot.setStatus(LotStatus.AVAILABLE);
            lotRepository.save(lot);
        });
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduleRentalPayments() throws MessagingException {
        RestTemplate restTemplate = new RestTemplate();
        // Lặp qua danh sách rentals để tạo thanh toán
        List<Rental> rentals = rentalRepository.findAll();
        for (Rental rental : rentals) {
            if (shouldCreatePaymentForRental(rental, LocalDate.now())) {
                int amount = (int) rental.getPrice();
                String orderInfo = "Hóa đơn thanh toán cho lô hàng " + rental.getLot().getDescription() + " tại kho hàng " + rental.getWarehouse().getName();
                Long userId = rental.getCustomer().getId();

                // Gửi request đến endpoint auto-create-payment
                restTemplate.postForEntity(
                        "http://localhost:8080/warehouses/auto-create-payment?amount=" + amount + "&orderInfo=" + orderInfo + "&id=" + userId,
                        null,
                        Void.class
                );

                String customerEmail = rental.getCustomer().getEmail();
                mailService.sendPaymentDueNotification(customerEmail, rental);
            }
        }
    }

    private boolean shouldCreatePaymentForRental(Rental rental, LocalDate today) {
        LocalDate startDate = rental.getStartDate().toLocalDate();
        LocalDate endDate = rental.getEndDate().toLocalDate();

        if (rental.getRentalType() == RentalType.MONTHLY) {
            // Kiểm tra nếu là thuê theo tháng và đến hạn thanh toán
            if (today.isBefore(startDate)) {
                return false; // Chưa đến ngày bắt đầu thuê
            }
            if (today.equals(startDate.plusDays(20))) {
                return true;
            }

            // Các chu kỳ sau: Tạo thanh toán trước 10 ngày của mỗi chu kỳ
            long monthsElapsed = ChronoUnit.MONTHS.between(startDate.withDayOfMonth(1), today.withDayOfMonth(1));
            if (monthsElapsed > 0) {
                LocalDate dueDate = startDate.plusMonths(monthsElapsed).minusDays(10);
                return today.equals(dueDate);
            }
        } else if (rental.getRentalType() == RentalType.FLEXIBLE) {
            // Kiểm tra nếu là thuê linh hoạt và đến hạn thanh toán
            return today.isEqual(endDate);
        }
        return false;
    }

    @Scheduled(cron = "0 0 0 * * ?") // Chạy hàng ngày lúc 00:00
    public void updateAndNotifyOverdueRentals() throws MessagingException {
        List<Rental> rentals = rentalRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Rental rental : rentals) {
            if (rental.getStatus() == RentalStatus.ACTIVE && isOverdue(rental, today)) {
                // Chuyển trạng thái thành "QUA_HAN_THANH_TOAN"
                rental.setStatus(RentalStatus.OVERDUE);
                rentalRepository.save(rental);

                // Gửi email thông báo quá hạn
                mailService.sendOverdueNotification(rental);
            }
        }
    }

    private boolean isOverdue(Rental rental, LocalDate today) {
        LocalDate startDate = rental.getStartDate().toLocalDate();
        LocalDate endDate = rental.getEndDate().toLocalDate();

        if (rental.getRentalType() == RentalType.FLEXIBLE) {
            // Quá hạn nếu hôm nay > endDate
            return today.isAfter(endDate.plusDays(3));
        } else if (rental.getRentalType() == RentalType.MONTHLY) {
            // Quá hạn nếu hôm nay > deadline thanh toán + 7 ngày
            long monthsElapsed = ChronoUnit.MONTHS.between(startDate.withDayOfMonth(1), today.withDayOfMonth(1));
            if (monthsElapsed >= 0) {
                LocalDate monthlyPaymentDeadline = startDate.plusMonths(monthsElapsed).plusDays(5);
                return today.isAfter(monthlyPaymentDeadline);
            }
        }

        return false;
    }

    @Override
    public Page<RentalResponse> getAllExpiringRentals(PageRequest pageRequest) {
        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime endDate = today.plusDays(10);
        return rentalRepository.findExpiringRentals(today, endDate, pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .lotId(rental.getLot().getId())
                    .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                    .contractId(rental.getContract().getId())
                    .rentalType(rental.getRentalType())
                    .price(rental.getPrice())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Override
    public Page<RentalResponse> getAllExpiringRentalsForSales(String remoteUser, PageRequest pageRequest) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime endDate = today.plusDays(10);
        return rentalRepository.findRentalsByDateRangeForSales(today, endDate, sales.getId(), pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .lotId(rental.getLot().getId())
                    .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                    .contractId(rental.getContract().getId())
                    .rentalType(rental.getRentalType())
                    .price(rental.getPrice())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Override
    public Page<RentalResponse> getSignedRentalsInAMonthForSales(String remoteUser, PageRequest pageRequest) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()).atTime(23, 59, 59);
        return rentalRepository.findRentalsByDateRangeForSales(startOfMonth, endOfMonth, sales.getId(), pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .lotId(rental.getLot().getId())
                    .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                    .contractId(rental.getContract().getId())
                    .rentalType(rental.getRentalType())
                    .price(rental.getPrice())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
                    .status(rental.getStatus())
                    .build();
        });
    }

    @Override
    public Page<RentalResponse> getAllExpiringRentalsForWarehouse(String remoteUser, PageRequest pageRequest) throws Exception {
        User manager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        Warehouse warehouse = warehouseRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));
        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime endDate = today.plusDays(10);
        return rentalRepository.findExpiringRentalsForWarehouse(today, endDate, warehouse.getId(), pageRequest).map(rental -> {
            return RentalResponse.builder()
                    .id(rental.getId())
                    .salesId(rental.getSales().getId())
                    .customerId(rental.getCustomer().getId())
                    .warehouseId(rental.getWarehouse().getId())
                    .lotId(rental.getLot().getId())
                    .additionalServiceId(rental.getAdditionalService() != null ? rental.getAdditionalService().getId() : null)
                    .contractId(rental.getContract().getId())
                    .rentalType(rental.getRentalType())
                    .price(rental.getPrice())
                    .startDate(rental.getStartDate())
                    .endDate(rental.getEndDate())
                    .status(rental.getStatus())
                    .build();
        });
    }
}
