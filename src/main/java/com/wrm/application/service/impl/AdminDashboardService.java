package com.wrm.application.service.impl;

import com.wrm.application.dto.AdminRevenueStats;
import com.wrm.application.repository.PaymentRepository;
import com.wrm.application.service.IAdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService implements IAdminDashboardService {
    private final PaymentRepository paymentRepository;

    @Override
    public List<AdminRevenueStats> getMonthlyRevenueForYear(int year) {
        List<Object[]> results = paymentRepository.findMonthlyRevenueForYear(year);
        return results.stream()
                .map(row -> new AdminRevenueStats((Integer) row[0], year, (Double) row[1]))
                .collect(Collectors.toList());
    }

    @Override
    public List<AdminRevenueStats> getQuarterlyRevenueForYear(int year) {
        List<Object[]> results = paymentRepository.findQuarterlyRevenueForYear(year);
        return results.stream()
                .map(row -> new AdminRevenueStats((Integer) row[0], year, (Double) row[1]))
                .collect(Collectors.toList());
    }

    @Override
    public List<AdminRevenueStats> getYearlyRevenue() {
        List<Object[]> results = paymentRepository.findYearlyRevenue();
        return results.stream()
                .map(row -> new AdminRevenueStats(null, (Integer) row[0], (Double) row[1]))
                .collect(Collectors.toList());
    }
}
