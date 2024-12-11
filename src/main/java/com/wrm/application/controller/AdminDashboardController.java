//package com.wrm.application.controller;
//
//import com.wrm.application.dto.AdminRevenueStats;
//import com.wrm.application.service.IAdminDashboardService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequiredArgsConstructor
//@RequestMapping("/admin-dashboard")
//public class AdminDashboardController {
//    private final IAdminDashboardService adminDashboardService;
//
//    @GetMapping("/revenue/monthly")
//    public ResponseEntity<List<AdminRevenueStats>> getMonthlyRevenueForYear(@RequestParam int year) {
//        List<AdminRevenueStats> stats = adminDashboardService.getMonthlyRevenueForYear(year);
//        return ResponseEntity.ok(stats);
//    }
//
//    @GetMapping("/revenue/quarterly")
//    public ResponseEntity<List<AdminRevenueStats>> getQuarterlyRevenueForYear(@RequestParam int year) {
//        List<AdminRevenueStats> stats = adminDashboardService.getQuarterlyRevenueForYear(year);
//        return ResponseEntity.ok(stats);
//    }
//
//    @GetMapping("/revenue/yearly")
//    public ResponseEntity<List<AdminRevenueStats>> getYearlyRevenue() {
//        List<AdminRevenueStats> stats = adminDashboardService.getYearlyRevenue();
//        return ResponseEntity.ok(stats);
//    }
//}
