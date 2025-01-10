// Previous imports remain the same, removing shadcn Card imports
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Square, User, ArrowLeft, Package,
    Loader2, Calendar, Clock, CheckCircle,
    AlertCircle, MessageSquare, Image, ChevronLeft, ChevronRight
} from 'lucide-react';
import {useToast} from "../../context/ToastProvider.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import {getWareHouseById} from "../../service/WareHouse.js";
import {getAllLots} from "../../service/lot.js";
import {createAppointment} from "../../service/Appointment.js";
import AppointmentModal1 from "../Management/Appointment/AppointmentModal1.jsx";
import FeedbackForm from "../FeedbackForm.jsx";
import ProportionalWarehouseLotGrid from "../ProportionalWarehouseLotGrid.jsx";


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
const LotButton = ({ lot, onClick, isSelected }) => {
    const StatusIcon = LOT_STATUS_CONFIG[lot.status]?.icon;

    return (
        <button
            onClick={onClick}
            className={`
                w-28 h-28 p-3 rounded-xl text-left transition-all duration-200
                ${LOT_STATUS_CONFIG[lot.status]?.color}
                ${lot.status === 'available' ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                ${isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : 'ring-1'}
                relative group bg-white
            `}
        >
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">Lô {lot.id}</span>
                    {StatusIcon && <StatusIcon className="w-4 h-4"/>}
                </div>
                <div>
                    <p className="text-xs font-medium">{lot.size.toLocaleString()}m²</p>
                    <p className="text-xs font-bold mt-1 text-indigo-600">
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(lot.price)}
                    </p>
                </div>
            </div>

            {lot.status === 'available' && (
                <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"/>
            )}

            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                    Xem chi tiết
                </div>
            </div>
        </button>
    );
};

const WarehouseLotGrid = ({ lots, onLotSelect, selectedLot }) => {
    return (
        <div className="p-6">
            {/* Legend and Status */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex gap-6">
                    {Object.entries(LOT_STATUS_CONFIG).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                            <div className={`w-3 h-3 rounded-sm ${value.color} mr-2 ring-1`}/>
                            <span className="text-sm font-medium text-gray-700">{value.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Warehouse Layout Info */}
            <div className="mb-8 bg-blue-50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-blue-900 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Thông tin bố trí kho
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-yellow-700">1</span>
                        </div>
                        <p>Khu vực bốc dỡ hàng rộng rãi nằm ở cửa chính, thuận tiện cho việc vận chuyển</p>
                    </div>
                    <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-yellow-700">2</span>
                        </div>
                        <p>Lối đi chính rộng 3m, đảm bảo xe nâng di chuyển dễ dàng</p>
                    </div>
                    <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-yellow-700">3</span>
                        </div>
                        <p>Cửa thoát hiểm được bố trí ở hai đầu kho, đảm bảo an toàn</p>
                    </div>
                    <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-yellow-700">4</span>
                        </div>
                        <p>Mỗi lô có lối tiếp cận riêng, tối ưu cho việc xuất nhập hàng</p>
                    </div>
                </div>
            </div>

            {/* Layout Visualization */}
            <div className="relative max-w-4xl mx-auto bg-white p-6 rounded-xl border border-gray-200">
                {/* Entry/Exit Points */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
                    Cửa chính / Khu vực bốc dỡ hàng
                </div>

                {/* Emergency Exits */}
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 rotate-90">
                    Lối thoát hiểm
                </div>
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 rotate-90">
                    Lối thoát hiểm
                </div>



                {/* Lots Grid */}
                <div className="grid grid-cols-1 gap-6 relative py-8">
                    {chunks(lots, 4).map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-12">
                            <div className="flex gap-4">
                                {row.slice(0, 2).map(lot => (
                                    <LotButton
                                        key={lot.id}
                                        lot={lot}
                                        onClick={() => onLotSelect(lot)}
                                        isSelected={selectedLot?.id === lot.id}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-4">
                                {row.slice(2, 4).map(lot => (
                                    <LotButton
                                        key={lot.id}
                                        lot={lot}
                                        onClick={() => onLotSelect(lot)}
                                        isSelected={selectedLot?.id === lot.id}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading Area Indicator */}
            <div className="flex justify-center mt-8">
                <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium border border-yellow-200">
                    Khu vực bốc dỡ hàng
                </div>
            </div>
        </div>
    );
};
const chunks = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );
};

// Component definitions remain the same, just update the Card usage to div...

const WarehouseDetailForGuess = () => {
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
    const [warehouseImages, setWarehouseImages] = useState([]);

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

                // Set warehouse images if they exist
                if (warehouseResponse.data.images) {
                    setWarehouseImages(warehouseResponse.data.images);
                }

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
    const ImageGallery = ({ images }) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [isLoading, setIsLoading] = useState(true);

        const nextImage = () => {
            setIsLoading(true);
            setCurrentIndex((prev) => (prev + 1) % images.length);
        };

        const previousImage = () => {
            setIsLoading(true);
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        };

        const handleImageLoad = () => {
            setIsLoading(false);
        };

        if (!images || images.length === 0) {
            return (
                <div className="w-full h-[500px] bg-gray-50 rounded-lg flex flex-col items-center justify-center">
                    <Image className="w-16 h-16 text-gray-300 mb-4"/>
                    <p className="text-gray-500">Chưa có hình ảnh</p>
                </div>
            );
        }

        return (
            <div className="relative w-full h-[500px] rounded-lg overflow-hidden group">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="animate-pulse flex flex-col items-center">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
                        </div>
                    </div>
                )}
                <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/warehouses/images/${images[currentIndex].split('\\').pop()}`}
                    alt={`Warehouse image ${currentIndex + 1}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 
                           ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                        e.target.classList.add('opacity-50');
                        setIsLoading(false);
                    }}
                />

                {images.length > 1 && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <button
                            onClick={previousImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full
                                 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full
                                 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setIsLoading(true);
                                        setCurrentIndex(idx);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 
                                          ${idx === currentIndex
                                        ? 'bg-white w-8'
                                        : 'bg-white/50 hover:bg-white/80'}`}
                                />
                            ))}
                        </div>

                        <div className="absolute bottom-6 right-6 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>
        );
    };    const handleAppointmentSubmit = async (appointmentData) => {
        try {
            await createAppointment(appointmentData);
            showToast('Đặt lịch hẹn thành công, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất', 'success');
            setIsAppointmentModalOpen(false);
        } catch (error) {
            showToast('Đặt lịch hẹn thất bại: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'), 'error');
        }
    };
    const formatNumber = (number) => {
        if (number == null) return "0";
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-lg bg-opacity-80">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-indigo-600
                                bg-gray-50 rounded-lg transition-all duration-200
                                hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2"/>
                            Quay lại
                        </button>
                        <nav className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-600">Kho</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-900 font-medium">{warehouse?.name}</span>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Top Section - Images and Key Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left - Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <ImageGallery images={warehouseImages}/>
                        </div>

                        {/* Right - Key Information */}
                        <div className="space-y-6">
                            {/* Status and Title */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4
                                ${warehouse?.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
                                    : 'bg-gray-50 text-gray-700 ring-1 ring-gray-100'}`}>
                                <span className={`w-2 h-2 rounded-full mr-2 
                                    ${warehouse?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}`}/>
                                    {warehouse?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">{warehouse?.name}</h1>
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="w-5 h-5 text-indigo-600 mr-2"/>
                                    <span className="text-sm">{warehouse?.address}</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center mb-2">
                                        <Square className="w-5 h-5 text-indigo-600 mr-2"/>
                                        <span className="text-sm text-gray-600">Tổng diện tích</span>
                                    </div>
                                    <p className="text-xl font-bold text-indigo-600">{warehouse?.size.toLocaleString()} m²</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center mb-2">
                                        <Package className="w-5 h-5 text-indigo-600 mr-2"/>
                                        <span className="text-sm text-gray-600">Số lô trống</span>
                                    </div>
                                    <p className="text-xl font-bold text-indigo-600">
                                        {lots.filter(lot => lot.status === 'available').length}
                                    </p>
                                </div>
                            </div>

                            {/* Manager Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center mb-4">
                                    <User className="w-5 h-5 text-indigo-600 mr-2"/>
                                    <h3 className="font-semibold text-gray-900">Thông tin quản lý</h3>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="font-medium text-gray-900">
                                        {warehouse?.warehouse_manager_name || 'Chưa có người quản lý'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Mô tả</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {warehouse?.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section - Lots */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Sơ đồ lô hàng</h2>
                        </div>

                        <ProportionalWarehouseLotGrid
                            lots={lots}
                            onLotSelect={setSelectedLot}
                            selectedLot={selectedLot}
                        />

                        {/* Selected Lot Details */}
                        {selectedLot && (
                            <div className="border-t border-gray-100">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Thông tin lô đã chọn
                                        </h3>
                                        {selectedLot.status === 'available' && customer?.role === "ROLE_USER" && (
                                            <button
                                                onClick={() => setIsAppointmentModalOpen(true)}
                                                className="flex items-center px-4 py-2 bg-indigo-600 text-white
                                                     rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                <Calendar className="w-4 h-4 mr-2"/>
                                                Đặt lịch hẹn
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-sm text-gray-500 mb-1">Mã lô</p>
                                            <p className="font-medium text-gray-900">Lô {selectedLot.id}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-sm text-gray-500 mb-1">Diện tích</p>
                                            <p className="font-medium text-gray-900">{selectedLot.size.toLocaleString()} m²</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-sm text-gray-500 mb-1">Giá thuê</p>
                                            <p className="font-medium text-indigo-600">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(selectedLot.price)}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full 
                                            text-xs font-medium ${LOT_STATUS_CONFIG[selectedLot.status]?.color}`}>
                                                {LOT_STATUS_CONFIG[selectedLot.status]?.label}
                                            </div>
                                        </div>
                                        {selectedLot.description && (
                                            <div className="md:col-span-2 bg-gray-50 rounded-xl p-4">
                                                <p className="text-sm text-gray-500 mb-1">Mô tả</p>
                                                <p className="font-medium text-gray-900">{selectedLot.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <FeedbackForm
                            warehouseId={warehouse?.id}
                            onSubmit={() => showToast('Cảm ơn bạn đã gửi đánh giá!', 'success')}
                        />
                    </div>
                </div>
            </div>

            {/* Appointment Modal */}
            <AppointmentModal1
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                warehouseId={warehouse?.id}
                onSubmit={handleAppointmentSubmit}
            />
        </div>
    );
};

export default WarehouseDetailForGuess;