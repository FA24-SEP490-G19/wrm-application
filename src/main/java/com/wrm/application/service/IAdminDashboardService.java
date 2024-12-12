package com.wrm.application.service;

import com.wrm.application.dto.AdminRevenueStats;

import java.util.List;

public interface IAdminDashboardService {
    List<AdminRevenueStats> getMonthlyRevenueForYear(int year);

    List<AdminRevenueStats> getQuarterlyRevenueForYear(int year);

    List<AdminRevenueStats> getYearlyRevenue();
}
