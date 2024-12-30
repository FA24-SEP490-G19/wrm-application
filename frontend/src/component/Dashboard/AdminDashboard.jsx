// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    getExpiringRentals,
    getMonthlyRevenue, getPendingRequests,
    getQuarterlyRevenue,
    getTopCustomers, getTopSales,
    getTopWarehouses, getUnassignedAppointments,
    getYearlyRevenue
} from "./axiosInstance.js";
import DashboardHeader from "./DashboardHeader.jsx";
import {RevenueCharts} from "./RevenueCharts.jsx";
import StatsCards from "./StatsCards.jsx";
import TopPerformers from "./TopPerformers.jsx";
import CRMLayout from "../Management/Crm.jsx";

const AdminDashboard = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        monthlyRevenue: [],
        quarterlyRevenue: [],
        yearlyRevenue: [],
        topCustomers: [],
        topWarehouses: [],
        topSales: [],
        metrics: {
            pendingRequests: 0,
            expiringRentals: 0,
            unassignedAppointments: 0
        }
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [
                monthlyData,
                quarterlyData,
                yearlyData,
                customersData,
                warehousesData,
                salesData,
                pendingCount,
                expiringCount,
                unassignedCount
            ] = await Promise.all([
                getMonthlyRevenue(year),
                getQuarterlyRevenue(year),
                getYearlyRevenue(),
                getTopCustomers(),
                getTopWarehouses(),
                getTopSales(),
                getPendingRequests(),
                getExpiringRentals(),
                getUnassignedAppointments()
            ]);

            setData({
                monthlyRevenue: monthlyData || [],
                quarterlyRevenue: quarterlyData || [],
                yearlyRevenue: yearlyData || [],
                topCustomers: customersData || [],
                topWarehouses: warehousesData || [],
                topSales: salesData || [],
                metrics: {
                    pendingRequests: pendingCount || 0,
                    expiringRentals: expiringCount || 0,
                    unassignedAppointments: unassignedCount || 0
                }
            });
        } catch (err) {
            if (err.response?.status === 401) {
                window.location.href = '/login';
            } else {
                setError('Không thể tải dữ liệu bảng điều khiển');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [year]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <CRMLayout>

        <div className="p-6 space-y-6">
            <DashboardHeader
                year={year}
                onYearChange={setYear}
                title="Bảng Điều Khiển Quản Trị"
            />
            <StatsCards
                metrics={data.metrics}
                labels={{
                    pendingRequests: "Yêu Cầu Chờ Duyệt",
                    expiringRentals: "Hợp Đồng Sắp Hết Hạn",
                    unassignedAppointments: "Lịch Hẹn Chưa Phân Công"
                }}
            />
            <RevenueCharts
                monthlyRevenue={data.monthlyRevenue}
                quarterlyRevenue={data.quarterlyRevenue}
                yearlyRevenue={data.yearlyRevenue}
                labels={{
                    title: "Tổng Quan Doanh Thu",
                    monthly: "Theo Tháng",
                    quarterly: "Theo Quý",
                    yearly: "Theo Năm",
                    revenue: "Doanh Thu"
                }}
            />
            <TopPerformers
                topCustomers={data.topCustomers}
                topWarehouses={data.topWarehouses}
                topSales={data.topSales}
                labels={{
                    customers: "Khách Hàng Hàng Đầu",
                    warehouses: "Kho Hàng Hàng Đầu",
                    sales: "Doanh Số Bán Hàng Cao Nhất"
                }}
            />
        </div>
        </CRMLayout>
    );
};

export default AdminDashboard;