// Previous imports remain the same, removing shadcn Card imports
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Square, User, ArrowLeft, Package,
    Loader2, Calendar, Clock, CheckCircle,
    AlertCircle, MessageSquare
} from 'lucide-react';
import { getWareHouseById } from '../service/WareHouse';
import { getAllLots } from '../service/lot';
import { createAppointment } from '../service/Appointment';
import { useToast } from '../context/ToastProvider';
import AppointmentModal1 from './Management/Appointment/AppointmentModal1';
import FeedbackForm from './FeedbackForm';
import {useAuth} from "../context/AuthContext.jsx";

// LOT_STATUS_CONFIG remains the same...
const LOT_STATUS_CONFIG = {
    available: {
        color: 'bg-green-200 text-green-1000 border-green-500',
        label: 'Có sẵn',
        icon: CheckCircle
    },
    reserved: {
        color: 'bg-blue-200 text-blue-700 border-blue-100',
        label: 'Đã thuê',
        icon: Clock
    },
    occupied: {
        color: 'bg-yellow-200 text-yellow-700 border-yellow-100',
        label: 'Bảo trì',
        icon: AlertCircle
    }
};


const NavButton = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="group flex items-center px-4 py-2 text-gray-600 hover:text-indigo-600
                   bg-white rounded-lg shadow-sm transition-all duration-200
                   hover:shadow-md hover:-translate-y-0.5"
    >
        {children}
    </button>
);

const StatusBadge = ({ status }) => (
    <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium 
                    ${status === 'ACTIVE'
        ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
        : 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20'}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${status === 'ACTIVE' ? 'bg-green-600' : 'bg-gray-600'}`} />
        {status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
    </div>
);

const InfoCard = ({ icon: Icon, label, value, className = '' }) => (
    <div className={`bg-indigo-50/50 rounded-xl p-4 hover:bg-indigo-50/70 
                    transition-colors duration-200 ${className}`}>
        <div className="flex items-center mb-2">
            <Icon className="w-5 h-5 text-indigo-600 mr-2" />
            <span className="text-sm text-gray-600">{label}</span>
        </div>
        <p className="text-xl font-bold text-indigo-600">{value}</p>
    </div>
);

const LotCard = ({ lot, onClick }) => {
    const StatusIcon = LOT_STATUS_CONFIG[lot.status]?.icon;
    const isAvailable = lot.status === 'available';

    return (
        <div
            onClick={() => onClick(lot)}
            className={`relative p-4 rounded-xl transition-all duration-200
                ${LOT_STATUS_CONFIG[lot.status]?.color}
                ${isAvailable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 ring-1' : 'ring-1'}
                group`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">Lô {lot.id}</span>
                {StatusIcon && <StatusIcon className={`w-5 h-5 transition-transform duration-200 
                                          ${isAvailable ? 'group-hover:scale-110' : ''}`} />}
            </div>
            <div className="space-y-1.5">
                <div className="text-sm">{lot.size}m²</div>
                <div className="text-sm font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lot.price)}
                </div>
            </div>
        </div>
    );
};


// Component definitions remain the same, just update the Card usage to div...

const WarehouseDetail = () => {
    // State and hooks remain the same...
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [warehouse, setWarehouse] = useState(null);
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLot, setSelectedLot] = useState(null);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const {customer} = useAuth();
    // useEffect and handlers remain the same...
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [warehouseResponse, lotsResponse] = await Promise.all([
                    getWareHouseById(id),
                    getAllLots()
                ]);

                setWarehouse(warehouseResponse.data);
                setLots(lotsResponse.data.lots.filter(lot => lot.warehouse_id === parseInt(id)));
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

    const handleAppointmentSubmit = async (appointmentData) => {
        try {
            await createAppointment(appointmentData);
            showToast('Đặt lịch hẹn thành công, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất', 'success');
            setIsAppointmentModalOpen(false);
        } catch (error) {
            showToast('Đặt lịch hẹn thất bại: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'), 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col items-center space-y-4 bg-white p-8 rounded-2xl shadow-lg">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
                <div className="max-w-3xl mx-auto text-center bg-white p-8 rounded-2xl shadow-lg">
                    <div className="text-red-600 mb-6">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">{error}</p>
                    </div>
                    <NavButton onClick={() => window.location.reload()}>
                        <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                        Thử lại
                    </NavButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Navigation */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-indigo-600
                                     bg-gray-50 rounded-lg transition-all duration-200
                                     hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại
                        </button>
                        <span className="text-gray-400">/</span>
                        <h1 className="text-lg font-medium text-gray-900">Chi tiết kho</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Warehouse Status & Title */}
                            <div className="p-6 border-b border-gray-100">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                                    ${warehouse?.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
                                    : 'bg-gray-50 text-gray-700 ring-1 ring-gray-100'}`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 
                                        ${warehouse?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}`} />
                                    {warehouse?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mt-4">{warehouse?.name}</h2>
                                <div className="flex items-center mt-4 text-gray-600">
                                    <MapPin className="w-5 h-5 text-indigo-600 mr-2" />
                                    <span className="text-sm">{warehouse?.address}</span>
                                </div>
                            </div>

                            {/* Warehouse Stats */}
                            <div className="grid grid-cols-2 gap-px bg-gray-100">
                                <div className="bg-white p-6">
                                    <div className="flex items-center mb-2">
                                        <Square className="w-5 h-5 text-indigo-600 mr-2" />
                                        <span className="text-sm text-gray-600">Tổng diện tích</span>
                                    </div>
                                    <p className="text-xl font-bold text-indigo-600">{warehouse?.size} m²</p>
                                </div>
                                <div className="bg-white p-6">
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
                            <div className="p-6 border-t border-gray-100">
                                <div className="flex items-center mb-4">
                                    <User className="w-5 h-5 text-indigo-600 mr-2" />
                                    <h3 className="font-semibold text-gray-900">Thông tin quản lý</h3>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="font-medium text-gray-900">
                                        {warehouse?.warehouse_manager_name || 'Chưa có người quản lý'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-6 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4">Mô tả</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {warehouse?.description}
                                </p>
                            </div>
                        </div>
                        <FeedbackForm
                            warehouseId={warehouse?.id}
                            onSubmit={() => showToast('Cảm ơn bạn đã gửi đánh giá!', 'success')}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Sơ đồ lô hàng</h2>

                                {/* Status Legend */}
                                <div className="flex flex-wrap gap-6 mt-4 p-4 bg-gray-50 rounded-xl">
                                    {Object.entries(LOT_STATUS_CONFIG).map(([key, value]) => (
                                        <div key={key} className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full ${value.color} mr-2 ring-1`} />
                                            <span className="text-sm font-medium text-gray-700">{value.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lots Grid */}
                            <div className="p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {lots.map(lot => {
                                        const StatusIcon = LOT_STATUS_CONFIG[lot.status]?.icon;
                                        return (
                                            <button
                                                key={lot.id}
                                                onClick={() => setSelectedLot(lot)}
                                                className={`group p-4 rounded-xl text-left transition-all duration-200
                                                    ${LOT_STATUS_CONFIG[lot.status]?.color}
                                                    ${lot.status === 'available'
                                                    ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                                                    : 'cursor-default'}
                                                    ring-1`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="font-semibold">Lô {lot.id}</span>
                                                    {StatusIcon && <StatusIcon className="w-5 h-5" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm">{lot.size}m²</p>
                                                    <p className="text-sm font-medium">
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND'
                                                        }).format(lot.price)}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Selected Lot Details */}
                            {selectedLot && (
                                <div className="border-t border-gray-100">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Thông tin lô đã chọn
                                            </h3>
                                            {selectedLot.status === 'available' && customer.role === "ROLE_USER"&& (
                                                <button
                                                    onClick={() => setIsAppointmentModalOpen(true)}
                                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white
                                                             rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Đặt lịch hẹn
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-1">Mã lô</p>
                                                <p className="font-medium text-gray-900">Lô {selectedLot.id}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-1">Diện tích</p>
                                                <p className="font-medium text-gray-900">{selectedLot.size} m²</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-1">Giá thuê</p>
                                                <p className="font-medium text-indigo-600">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(selectedLot.price)}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full 
                                                    text-xs font-medium ${LOT_STATUS_CONFIG[selectedLot.status]?.color}`}>
                                                    {LOT_STATUS_CONFIG[selectedLot.status]?.label}
                                                </span>
                                            </div>
                                            {selectedLot.description && (
                                                <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-500 mb-1">Mô tả</p>
                                                    <p className="font-medium text-gray-900">{selectedLot.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AppointmentModal1
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                warehouseId={warehouse?.id}
                onSubmit={handleAppointmentSubmit}
            />


        </div>
    );
};

export default WarehouseDetail;