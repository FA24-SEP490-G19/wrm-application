package com.wrm.application.service.impl;

import com.wrm.application.dto.dashboard.RevenueStatsDTO;
import com.wrm.application.dto.dashboard.TopEntityByRevenueDTO;
import com.wrm.application.repository.AppointmentRepository;
import com.wrm.application.repository.PaymentRepository;
import com.wrm.application.repository.RentalRepository;
import com.wrm.application.repository.RequestRepository;
import com.wrm.application.service.IAdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService implements IAdminDashboardService {
    private final PaymentRepository paymentRepository;
    private final RequestRepository requestRepository;
    private final RentalRepository rentalRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public List<RevenueStatsDTO> getMonthlyRevenueForYear(int year) {
        List<Object[]> results = paymentRepository.findMonthlyRevenueForYear(year);
        return results.stream()
                .map(row -> new RevenueStatsDTO((Integer) row[0], year, (Double) row[1]))
                .collect(Collectors.toList());
    }

    @Override
    public List<RevenueStatsDTO> getQuarterlyRevenueForYear(int year) {
        List<Object[]> results = paymentRepository.findQuarterlyRevenueForYear(year);
        return results.stream()
                .map(row -> new RevenueStatsDTO((Integer) row[0], year, (Double) row[1]))
                .collect(Collectors.toList());
    }

    @Override
    public List<RevenueStatsDTO> getYearlyRevenue() {
        List<Object[]> results = paymentRepository.findYearlyRevenue();
        return results.stream()
                .map(row -> new RevenueStatsDTO(null, (Integer) row[0], (Double) row[1]))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopEntityByRevenueDTO> getTopCustomersByRevenue() {
        Pageable top3 = PageRequest.of(0, 3);
        List<Object[]> results = paymentRepository.findTopCustomersByRevenue(top3);
        return results.stream()
                .map(result -> new TopEntityByRevenueDTO((Long) result[0], (String) result[1], (Double) result[2]))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopEntityByRevenueDTO> getTopWarehousesByRevenue() {
        Pageable top3 = PageRequest.of(0, 3);
        List<Object[]> results = paymentRepository.findTopWarehousesByRevenue(top3);
        return results.stream()
                .map(result -> new TopEntityByRevenueDTO((Long) result[0], (String) result[1], (Double) result[2]))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopEntityByRevenueDTO> getTopSalesByRevenue() {
        Pageable top3 = PageRequest.of(0, 3);
        List<Object[]> results = paymentRepository.findTopSalesByRevenue(top3);
        return results.stream()
                .map(result -> new TopEntityByRevenueDTO((Long) result[0], (String) result[1], (Double) result[2]))
                .collect(Collectors.toList());
    }

    @Override
    public int countPendingRequests() {
        return requestRepository.countPendingRequests();
    }

    @Override
    public int countExpiringRentals() {
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime endDate = today.plusDays(10);
        return rentalRepository.countRentalsByDateRange(today, endDate);
    }

    @Override
    public int countUnassignedAppointments() {
        return appointmentRepository.countUnassignedAppointments();
    }
}
