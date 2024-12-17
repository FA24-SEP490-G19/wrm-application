package com.wrm.application.controller;

import com.wrm.application.service.IWarehouseManagerDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/manager-dashboard")
public class WarehouseManagerDashboardController {
    private final IWarehouseManagerDashboardService warehouseDashboardService;

    @GetMapping("/count/lots/available")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<Integer> countAvailableLots(HttpServletRequest req) throws Exception {
        int count = warehouseDashboardService.countAvailableLotsForWarehouseManager(req.getRemoteUser());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/lots/rented")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<Integer> countRentedLots(HttpServletRequest req) throws Exception {
        int count = warehouseDashboardService.countRentedLotsForWarehouseManager(req.getRemoteUser());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/appointments/upcoming")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<Integer> countUpcomingAppointments(HttpServletRequest req) throws Exception {
        int count = warehouseDashboardService.countUpcomingAppointmentsForWarehouse(req.getRemoteUser());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/rentals/expiring")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<Integer> countExpiringRentalsForWarehouse(HttpServletRequest req) throws Exception {
        int count = warehouseDashboardService.countExpiringRentalsForWarehouse(req.getRemoteUser());
        return ResponseEntity.ok(count);
    }
}
