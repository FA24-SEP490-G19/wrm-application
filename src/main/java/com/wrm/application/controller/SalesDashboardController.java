package com.wrm.application.controller;

import com.wrm.application.dto.dashboard.RevenueStatsDTO;
import com.wrm.application.service.ISalesDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sales-dashboard")
public class SalesDashboardController {
    private final ISalesDashboardService salesDashboardService;

    @GetMapping("/monthly")
    public ResponseEntity<List<RevenueStatsDTO>> getMonthlyRevenueForSales(
            @RequestParam int year,
            HttpServletRequest req) throws Exception {
        List<RevenueStatsDTO> stats = salesDashboardService.getMonthlyRevenueForSales(year, req.getRemoteUser());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/quarterly")
    public ResponseEntity<List<RevenueStatsDTO>> getQuarterlyRevenueForSales(
            @RequestParam int year,
            HttpServletRequest req) throws Exception {
        List<RevenueStatsDTO> stats = salesDashboardService.getQuarterlyRevenueForSales(year, req.getRemoteUser());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/yearly")
    public ResponseEntity<List<RevenueStatsDTO>> getYearlyRevenueForSales(HttpServletRequest req) throws Exception {
        List<RevenueStatsDTO> stats = salesDashboardService.getYearlyRevenueForSales(req.getRemoteUser());
        return ResponseEntity.ok(stats);
    }
}
