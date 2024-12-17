package com.wrm.application.service.impl;

import com.wrm.application.dto.dashboard.RevenueStatsDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.User;
import com.wrm.application.repository.AppointmentRepository;
import com.wrm.application.repository.PaymentRepository;
import com.wrm.application.repository.RentalRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.service.ISalesDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesDashboardService implements ISalesDashboardService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final RentalRepository rentalRepository;

    @Override
    public List<RevenueStatsDTO> getMonthlyRevenueForSales(int year, String remoteUser) throws Exception{
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("Người dùng không phải là nhân viên bán hàng");
        }
        List<Object[]> results = paymentRepository.findMonthlyRevenueForSales(year, sales.getId());
        return results.stream()
                .map(result -> new RevenueStatsDTO((Integer) result[0], year, (Double) result[1]))
                .collect(Collectors.toList());
    }

    @Override
    public List<RevenueStatsDTO> getQuarterlyRevenueForSales(int year, String remoteUser) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("Người dùng không phải là nhân viên bán hàng");
        }
        List<Object[]> results = paymentRepository.findQuarterlyRevenueForSales(year, sales.getId());
        return results.stream()
                .map(result -> new RevenueStatsDTO((Integer) result[0], year, (Double) result[1]))
                .collect(Collectors.toList());
    }

    @Override
    public List<RevenueStatsDTO> getYearlyRevenueForSales(String remoteUser) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("Người dùng không phải là nhân viên bán hàng");
        }
        List<Object[]> results = paymentRepository.findYearlyRevenueForSales(sales.getId());
        return results.stream()
                .map(result -> new RevenueStatsDTO((Integer) result[0], (Integer) result[0], (Double) result[1]))
                .collect(Collectors.toList());
    }

    @Override
    public int countPendingAppointmentsForSales(String remoteUser) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        return appointmentRepository.countPendingAppointmentsForSales(sales.getId());
    }

    @Override
    public int countExpiringRentals(String remoteUser) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime endDate = today.plusDays(10);
        return rentalRepository.countRentalsByDateRangeForSales(today, endDate, sales.getId());
    }

    @Override
    public int countSignedRentalsInAMonth(String remoteUser) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()).atTime(23, 59, 59);
        return rentalRepository.countRentalsByDateRangeForSales(startOfMonth, endOfMonth, sales.getId());
    }

    @Override
    public int countUpcomingAppointmentsForSales(String remoteUser) throws Exception {
        User salesUser = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime tenDaysLater = today.plusDays(10);
        return appointmentRepository.countUpcomingAppointmentsForSales(salesUser.getId(), today, tenDaysLater);
    }
}
