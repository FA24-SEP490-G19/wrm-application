// WarehouseDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Square, User, ArrowLeft, Package,
    Loader2, Calendar, Clock, DollarSign,
    CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { getWareHouseById } from "../service/WareHouse.js";
import { getAllLots } from "../service/lot.js";
import {createAppointment} from "../service/Appointment.js";
import AppointmentModal from "./Management/Appointment/AppointmentModal.jsx";
import AppointmentModal1 from "./Management/Appointment/AppointmentModal1.jsx";
import {useToast} from "../context/ToastProvider.jsx";

const WarehouseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [warehouse, setWarehouse] = useState(null);
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLot, setSelectedLot] = useState(null);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const { showToast } = useToast();
    const LOT_STATUS_CONFIG = {
        'available': {
            color: 'bg-green-50 text-green-700 border-green-100',
            hoverColor: 'hover:bg-green-100',
            label: 'Có sẵn',
            icon: CheckCircle
        },
        'reserved': {
            color: 'bg-blue-50 text-blue-700 border-blue-100',
            hoverColor: 'hover:bg-blue-100',
            label: 'Đã thuê',
            icon: Clock
        },
        'occupied': {
            color: 'bg-yellow-50 text-yellow-700 border-yellow-100',
            hoverColor: 'hover:bg-yellow-100',
            label: 'Bảo trì',
            icon: AlertCircle
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [warehouseResponse, lotsResponse] = await Promise.all([
                    getWareHouseById(id),
                    getAllLots()
                ]);

                setWarehouse(warehouseResponse.data);
                const warehouseLots = lotsResponse.data.lots.filter(
                    lot => lot.warehouse_id === parseInt(id)
                );
                setLots(warehouseLots);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Không thể tải thông tin');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleLotClick = (lot) => {
        setSelectedLot(lot);
    };

    const handleCreateAppointment = () => {
        setIsAppointmentModalOpen(true);
    };

    // Add this new function
    const handleAppointmentSubmit = async (appointmentData) => {
        try {
            await createAppointment(appointmentData);
            showToast('Đặt lịch hẹn thành công, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất', 'success');
            setIsAppointmentModalOpen(false);
        } catch (error) {
            showToast('Đặt lịch hẹn thất bại: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'), 'error');
        }
    };

    const statusColors = {
        'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
        'INACTIVE': 'bg-gray-50 text-gray-700 border-gray-100'
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4">
                {/* Navigation and Breadcrumb */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại
                        </button>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">Chi tiết kho</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left side - Warehouse Info */}
                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all hover:shadow-xl">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[warehouse?.status]} mb-4`}>
                                {warehouse?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{warehouse?.name}</h1>

                            <div className="flex items-center text-gray-600 mb-6">
                                <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                                {warehouse?.address}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-indigo-50 rounded-xl p-4">
                                    <div className="flex items-center mb-2">
                                        <Square className="w-5 h-5 text-indigo-600 mr-2" />
                                        <span className="text-sm text-gray-600">Tổng diện tích</span>
                                    </div>
                                    <p className="text-xl font-bold text-indigo-600">{warehouse?.size} m²</p>
                                </div>
                                <div className="bg-indigo-50 rounded-xl p-4">
                                    <div className="flex items-center mb-2">
                                        <Package className="w-5 h-5 text-indigo-600 mr-2" />
                                        <span className="text-sm text-gray-600">Số lô trống</span>
                                    </div>
                                    <p className="text-xl font-bold text-indigo-600">
                                        {lots.filter(lot => lot.status === 'available').length}
                                    </p>
                                </div>
                            </div>

                            {/* Manager Info */}
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex items-center mb-4">
                                    <User className="w-5 h-5 text-indigo-600 mr-3" />
                                    <h3 className="text-lg font-semibold">Thông tin quản lý</h3>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="font-medium text-gray-900">
                                        {warehouse?.warehouse_manager_name || 'Chưa có người quản lý'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="border-t border-gray-100 mt-6 pt-6">
                                <h3 className="text-lg font-semibold mb-4">Mô tả</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {warehouse?.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Lots Grid */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all hover:shadow-xl">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Sơ đồ lô hàng</h2>

                                {/* Legend */}
                                <div className="flex gap-6 mb-6 p-4  rounded-xl">
                                    {Object.entries(LOT_STATUS_CONFIG).map(([key, value]) => (
                                        <div key={key} className="flex items-center">
                                            <div className={`w-4 h-4 rounded ${value.color} mr-2`}></div>
                                            <span className="text-sm font-medium">{value.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Lots Grid */}
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                                    {lots.map(lot => {
                                        const StatusIcon = LOT_STATUS_CONFIG[lot.status]?.icon;

                                        return (
                                            <div
                                                key={lot.id}
                                                onClick={() => handleLotClick(lot)}
                                                className={`
                                                    relative p-4 rounded-xl shadow-sm transition-all
                                                    ${LOT_STATUS_CONFIG[lot.status]?.color}
                                                    ${lot.status === 'available' ? 'cursor-pointer transform hover:scale-105' : ''}
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold">Lô {lot.id}</span>
                                                    {StatusIcon && <StatusIcon className="w-5 h-5" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-sm">{lot.size}m²</div>
                                                    <div className="text-sm font-medium">
                                                        {formatPrice(lot.price)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Selected Lot Info */}
                            {selectedLot && (
                                <div className="border-t border-gray-100 pt-6">
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">
                                                Thông tin lô đã chọn
                                            </h3>
                                            {selectedLot.status === 'available' && (
                                                <button
                                                    onClick={() => handleCreateAppointment(selectedLot)}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl
                                                             hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    Đặt lịch hẹn
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Mã lô</p>
                                                <p className="font-medium text-gray-900">
                                                    Lô {selectedLot.id}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Diện tích</p>
                                                <p className="font-medium text-gray-900">
                                                    {selectedLot.size} m²
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Giá thuê</p>
                                                <p className="font-medium text-indigo-600">
                                                    {formatPrice(selectedLot.price)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 
                                                                rounded-full text-xs font-medium
                                                                ${LOT_STATUS_CONFIG[selectedLot.status]?.color}`}>
                                                    {LOT_STATUS_CONFIG[selectedLot.status]?.label}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-500 mb-1">Mô tả</p>
                                                <p className="font-medium text-gray-900">
                                                    {selectedLot.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <AppointmentModal1
                    isOpen={isAppointmentModalOpen}
                    onClose={() => setIsAppointmentModalOpen(false)}
                    warehouseId={warehouse?.id}
                    onSubmit={handleAppointmentSubmit}
                />
            </div>
        </div>
    );
};

export default WarehouseDetail;