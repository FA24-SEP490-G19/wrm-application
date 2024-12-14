package com.wrm.application.controller;

import com.wrm.application.dto.dashboard.RevenueStatsDTO;
import com.wrm.application.dto.dashboard.TopEntityByRevenueDTO;
import com.wrm.application.service.IAdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin-dashboard")
public class AdminDashboardController {
    private final IAdminDashboardService adminDashboardService;

    @GetMapping("/revenue/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RevenueStatsDTO>> getMonthlyRevenueForYear(@RequestParam int year) {
        List<RevenueStatsDTO> stats = adminDashboardService.getMonthlyRevenueForYear(year);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue/quarterly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RevenueStatsDTO>> getQuarterlyRevenueForYear(@RequestParam int year) {
        List<RevenueStatsDTO> stats = adminDashboardService.getQuarterlyRevenueForYear(year);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue/yearly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RevenueStatsDTO>> getYearlyRevenue() {
        List<RevenueStatsDTO> stats = adminDashboardService.getYearlyRevenue();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/top-customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopEntityByRevenueDTO>> getTopCustomersByRevenue() {
        List<TopEntityByRevenueDTO> results = adminDashboardService.getTopCustomersByRevenue();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/top-warehouses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopEntityByRevenueDTO>> getTopWarehousesByRevenue() {
        List<TopEntityByRevenueDTO> results = adminDashboardService.getTopWarehousesByRevenue();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/top-sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopEntityByRevenueDTO>> getTopSalesByRevenue() {
        List<TopEntityByRevenueDTO> results = adminDashboardService.getTopSalesByRevenue();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/count/pending-requests")
    public ResponseEntity<Integer> countPendingRequests() {
        int count = adminDashboardService.countPendingRequests();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/expiring-rentals")
    public ResponseEntity<Integer> countExpiringRentals() {
        int count = adminDashboardService.countExpiringRentals();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/unassigned-appointments")
    public ResponseEntity<Integer> countUnassignedAppointments() {
        int count = adminDashboardService.countUnassignedAppointments();
        return ResponseEntity.ok(count);
    }
}
