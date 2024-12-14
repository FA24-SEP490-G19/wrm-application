package com.wrm.application.service;

import com.wrm.application.dto.dashboard.RevenueStatsDTO;

import java.util.List;

public interface ISalesDashboardService {
    List<RevenueStatsDTO> getMonthlyRevenueForSales(int year, String remoteUser) throws Exception;

    List<RevenueStatsDTO> getQuarterlyRevenueForSales(int year, String remoteUser) throws Exception;

    List<RevenueStatsDTO> getYearlyRevenueForSales(String remoteUser) throws Exception;
}
