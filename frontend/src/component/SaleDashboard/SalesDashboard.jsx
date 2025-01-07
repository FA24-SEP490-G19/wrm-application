import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Users } from 'lucide-react';
import {
    getMonthlyRevenueForSales,
    getQuarterlyRevenueForSales,
    getYearlyRevenueForSales,
    getPendingAppointments,
    getExpiringRentals,
    getSignedRentals,
    getUpcomingAppointments
} from './salesDashboardService.js';
import CRMLayout from "../Management/Crm.jsx";
import RevenueCharts from './RevenueCharts';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow ${className}`}>
        {children}
    </div>
);

const SalesDashboard = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [quarterlyStats, setQuarterlyStats] = useState([]);
    const [yearlyStats, setYearlyStats] = useState([]);
    const [metrics, setMetrics] = useState({
        pendingAppointments: 0,
        expiringRentals: 0,
        signedRentals: 0,
        upcomingAppointments: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, [selectedYear]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                monthlyData,
                quarterlyData,
                yearlyData,
                pendingData,
                expiringData,
                signedData,
                upcomingData
            ] = await Promise.all([
                getMonthlyRevenueForSales(selectedYear),
                getQuarterlyRevenueForSales(selectedYear),
                getYearlyRevenueForSales(),
                getPendingAppointments(),
                getExpiringRentals(),
                getSignedRentals(),
                getUpcomingAppointments()
            ]);

            setMonthlyStats(monthlyData);
            setQuarterlyStats(quarterlyData);
            setYearlyStats(yearlyData);
            setMetrics({
                pendingAppointments: pendingData,
                expiringRentals: expiringData,
                signedRentals: signedData,
                upcomingAppointments: upcomingData
            });
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const MetricCard = ({ title, value, icon: Icon, iconClassName }) => (
        <Card>
            <div className="flex items-center p-6">
                <div className={`rounded-full p-3 ${iconClassName}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                </div>
            </div>
        </Card>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Đang tải dữ liệu...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <CRMLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold mb-8">Bảng Điều Khiển Bán Hàng</h1>

                {/* Year Selector */}
                <div className="mb-6">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="border rounded-lg px-4 py-2 bg-white"
                    >
                        {Array.from({ length: 5 }, (_, i) => (
                            <option key={i} value={new Date().getFullYear() - i}>
                                Năm {new Date().getFullYear() - i}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Cuộc Hẹn Đang Chờ"
                        value={metrics.pendingAppointments}
                        icon={Calendar}
                        iconClassName="bg-blue-100 text-blue-600"
                    />
                    <MetricCard
                        title="Đơn Thuê Sắp Hết Hạn"
                        value={metrics.expiringRentals}
                        icon={Clock}
                        iconClassName="bg-red-100 text-red-600"
                    />
                    <MetricCard
                        title="Hợp Đồng Đã Ký"
                        value={metrics.signedRentals}
                        icon={Users}
                        iconClassName="bg-green-100 text-green-600"
                    />
                    <MetricCard
                        title="Cuộc Hẹn Sắp Tới"
                        value={metrics.upcomingAppointments}
                        icon={Calendar}
                        iconClassName="bg-purple-100 text-purple-600"
                    />
                </div>

                {/* Revenue Charts */}
                <RevenueCharts
                    monthlyStats={monthlyStats}
                    quarterlyStats={quarterlyStats}
                    yearlyStats={yearlyStats}
                />
            </div>
        </CRMLayout>
    );
};

export default SalesDashboard;