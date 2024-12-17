package com.wrm.application.service.impl;

import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.*;
import com.wrm.application.service.IWarehouseManagerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WarehouseManagerDashboardService implements IWarehouseManagerDashboardService {
    private final LotRepository lotRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final AppointmentRepository appointmentRepository;
    private final RentalRepository rentalRepository;

    @Override
    public int countAvailableLotsForWarehouseManager(String remoteUser) throws Exception {
        User manager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        Warehouse warehouse = warehouseRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        return lotRepository.countAvailableLots(warehouse.getId());
    }

    @Override
    public int countRentedLotsForWarehouseManager(String remoteUser) throws Exception {
        User manager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        Warehouse warehouse = warehouseRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        return lotRepository.countRentedLots(warehouse.getId());
    }

    @Override
    public int countUpcomingAppointmentsForWarehouse(String remoteUser) throws Exception {
        User manager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        Warehouse warehouse = warehouseRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime endDate = today.plusDays(10);

        return appointmentRepository.countUpcomingAppointmentsForWarehouse(warehouse.getId(), today, endDate);
    }

    @Override
    public int countExpiringRentalsForWarehouse(String remoteUser) throws Exception {
        User manager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        Warehouse warehouse = warehouseRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime endDate = today.plusDays(10);

        return rentalRepository.countExpiringRentalsForWarehouse(today, endDate, warehouse.getId());
    }
}
