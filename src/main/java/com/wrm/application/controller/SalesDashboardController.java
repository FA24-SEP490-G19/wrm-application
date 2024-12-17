package com.wrm.application.controller;

import com.wrm.application.dto.dashboard.RevenueStatsDTO;
import com.wrm.application.service.IAppointmentService;
import com.wrm.application.service.ISalesDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sales-dashboard")
public class SalesDashboardController {
    private final ISalesDashboardService salesDashboardService;

    @GetMapping("/monthly")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<List<RevenueStatsDTO>> getMonthlyRevenueForSales(
            @RequestParam int year,
            HttpServletRequest req) throws Exception {
        List<RevenueStatsDTO> stats = salesDashboardService.getMonthlyRevenueForSales(year, req.getRemoteUser());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/quarterly")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<List<RevenueStatsDTO>> getQuarterlyRevenueForSales(
            @RequestParam int year,
            HttpServletRequest req) throws Exception {
        List<RevenueStatsDTO> stats = salesDashboardService.getQuarterlyRevenueForSales(year, req.getRemoteUser());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/yearly")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<List<RevenueStatsDTO>> getYearlyRevenueForSales(HttpServletRequest req) throws Exception {
        List<RevenueStatsDTO> stats = salesDashboardService.getYearlyRevenueForSales(req.getRemoteUser());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/count/appointments/pending")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<Integer> countPendingAppointments(HttpServletRequest req) throws Exception {
        int count = salesDashboardService.countPendingAppointmentsForSales(req.getRemoteUser());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/expiring-rentals")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<Integer> countExpiringRentals(HttpServletRequest req) throws Exception {
        int count = salesDashboardService.countExpiringRentals(req.getRemoteUser());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/signed-rentals")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<Integer> countSignedRentalsInAMonth(HttpServletRequest req) throws Exception {
        int count = salesDashboardService.countSignedRentalsInAMonth(req.getRemoteUser());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/upcoming-appointments")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<Integer> countUpcomingAppointments(HttpServletRequest req) throws Exception {
        int count = salesDashboardService.countUpcomingAppointmentsForSales(req.getRemoteUser());
        return ResponseEntity.ok(count);
    }
}
