package com.wrm.application.service;

import com.wrm.application.dto.dashboard.RevenueStatsDTO;
import com.wrm.application.dto.dashboard.TopEntityByRevenueDTO;

import java.util.List;

public interface IAdminDashboardService {
    List<RevenueStatsDTO> getMonthlyRevenueForYear(int year);

    List<RevenueStatsDTO> getQuarterlyRevenueForYear(int year);

    List<RevenueStatsDTO> getYearlyRevenue();

    List<TopEntityByRevenueDTO> getTopCustomersByRevenue();

    List<TopEntityByRevenueDTO> getTopWarehousesByRevenue();

    List<TopEntityByRevenueDTO> getTopSalesByRevenue();

    int countPendingRequests();

    int countExpiringRentals();

    int countUnassignedAppointments();
}
