package com.wrm.application.service;

public interface IWarehouseManagerDashboardService {
    int countAvailableLotsForWarehouseManager(String remoteUser) throws Exception;

    int countRentedLotsForWarehouseManager(String remoteUser) throws Exception;

    int countUpcomingAppointmentsForWarehouse(String remoteUser) throws Exception;

    int countExpiringRentalsForWarehouse(String remoteUser) throws Exception;
}
