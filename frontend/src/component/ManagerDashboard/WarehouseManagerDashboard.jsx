import React, { useState, useEffect } from 'react';
import { Package, Calendar, Clock, Home } from 'lucide-react';
import {
    getAvailableLots,
    getRentedLots,
    getUpcomingAppointments,
    getExpiringRentals,
} from './warehouseManagerDashboardService';
import CRMLayout from "../Management/Crm.jsx";
import ProportionalWarehouseLotGrid from "../ProportionalWarehouseLotGrid.jsx";
import {getAllLots, getAllLotsByManager} from "../../service/lot.js";
import {getWareHouseById} from "../../service/WareHouse.js";
import {useNavigate} from "react-router-dom";

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow ${className}`}>
        {children}
    </div>
);

const MetricCard = ({ title, value, icon: Icon, iconClassName, description, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-lg shadow cursor-pointer transform transition-transform duration-200 hover:scale-105 ${onClick ? 'hover:shadow-lg' : ''}`}
    >
        <div className="flex items-start p-6">
            <div className={`rounded-full p-3 ${iconClassName}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
                {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
            </div>
        </div>
    </div>
);

const StatisticCard = ({ title, data, total, icon: Icon, iconClassName }) => (
    <Card>
        <div className="p-6">
            <div className="flex items-center mb-4">
                <div className={`rounded-full p-2 ${iconClassName}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="relative pt-1">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold text-gray-900">{data}</span>
                        <span className="ml-2 text-sm text-gray-600">/ {total}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                        {Math.round((data / total) * 100)}%
                    </span>
                </div>
                <div className="overflow-hidden h-2 mt-2 text-xs flex rounded bg-gray-200">
                    <div
                        style={{ width: `${(data / total) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                </div>
            </div>
        </div>
    </Card>
);

const WarehouseManagerDashboard = () => {
    const [lots, setLots] = useState([]);
    const navigate = useNavigate();  // Add this hook

    const [metrics, setMetrics] = useState({
        availableLots: 0,
        rentedLots: 0,
        upcomingAppointments: 0,
        expiringRentals: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        getLotByWarehouseManager();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                availableLotsData,
                rentedLotsData,
                upcomingApptsData,
                expiringRentalsData
            ] = await Promise.all([
                getAvailableLots(),
                getRentedLots(),
                getUpcomingAppointments(),
                getExpiringRentals()
            ]);

            setMetrics({
                availableLots: availableLotsData,
                rentedLots: rentedLotsData,
                upcomingAppointments: upcomingApptsData,
                expiringRentals: expiringRentalsData
            });
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getLotByWarehouseManager = async () => {
        setLoading(true);
        setError(null);
        const response = await getAllLotsByManager()
        setLots(response.data.lots);

        try {
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

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

    const totalLots = metrics.availableLots + metrics.rentedLots;

    return (
        <CRMLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold mb-8">Thống kê</h1>

                {/* Row containing Part 1 and Part 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Part 1 */}
                    <div className="w-full">
                        <ProportionalWarehouseLotGrid lots={lots} />
                    </div>

                    {/* Part 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MetricCard
                            title="Lot Trống (màu xanh)"
                            value={metrics.availableLots}
                            icon={Home}
                            iconClassName="bg-green-100 text-green-600"
                            description="Số lượng lot còn trống"
                        />
                        <MetricCard
                            title="Lot Đã Thuê (màu vàng)"
                            value={metrics.rentedLots}
                            icon={Package}
                            iconClassName="bg-blue-100 text-blue-600"
                            description="Số lượng lot đã cho thuê"
                        />
                        <MetricCard
                            title="Cuộc Hẹn Sắp Tới"
                            value={metrics.upcomingAppointments}
                            icon={Calendar}
                            iconClassName="bg-purple-100 text-purple-600"
                            description="Số lượng cuộc hẹn"
                            onClick={() => navigate('/upcoming')}  // Add navigation
                        />
                        <MetricCard
                            title="Hợp Đồng Sắp Hết Hạn"
                            value={metrics.expiringRentals}
                            icon={Clock}
                            iconClassName="bg-red-100 text-red-600"
                            description="Số lượng hợp đồng hết hạn"
                            onClick={() => navigate('/expired')}  // Add navigation
                        />
                    </div>
                </div>

                {/* Part 3 remains unchanged */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StatisticCard
                        title="Tình Trạng Lot"
                        data={metrics.rentedLots}
                        total={totalLots}
                        icon={Package}
                        iconClassName="bg-blue-100 text-blue-600"
                    />
                    <StatisticCard
                        title="Hiệu Suất Sử Dụng"
                        data={metrics.rentedLots}
                        total={totalLots}
                        icon={Home}
                        iconClassName="bg-green-100 text-green-600"
                    />
                </div>
            </div>
        </CRMLayout>
    );

};

export default WarehouseManagerDashboard;