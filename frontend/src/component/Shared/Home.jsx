import React, { useState, useEffect } from 'react';
import { 
    Building2, Square, Timer, Truck, Package, 
    MapPin, Phone, Mail, Search, Menu, Loader2
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext.jsx";
import logo from "../../assets/logo.png";
import {getAllItems} from "../../service/WareHouse.js";
import WarehouseDetailModal from "./WarehouseDetailModal.jsx";
import { useNavigate } from 'react-router-dom';

const WarehouseRental = () => {
    // State Management
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const { customer, logOut } = useAuth();
    const navigate = useNavigate();

    // Fetch warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                setLoading(true);
                const response = await getAllItems();
                setWarehouses(response.data.warehouses || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching warehouses:', err);
                setError('Failed to load warehouses');
            } finally {
                setLoading(false);
            }
        };

        fetchWarehouses();
    }, []);

    const handleWarehouseClick = (warehouseId) => {
        navigate(`/warehouse/${warehouseId}`);
    };

    // Filter warehouses based on search
    const filteredWarehouses = warehouses.filter(warehouse => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            warehouse.name?.toLowerCase().includes(searchLower) ||
            warehouse.address?.toLowerCase().includes(searchLower) ||
            warehouse.description?.toLowerCase().includes(searchLower) ||
            warehouse.warehouse_manager_name?.toLowerCase().includes(searchLower)
        );
    });

    // Status badge colors
    const statusColors = {
        'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
        'INACTIVE': 'bg-gray-50 text-gray-700 border-gray-100'
    };

    // Features for statistics section
    const features = [
        {
            icon: Building2,
            title: 'Tổng số kho',
            value: warehouses.length || 0
        },
        {
            icon: Square,
            title: 'Kho đang hoạt động',
            value: warehouses.filter(w => w.status === 'ACTIVE').length || 0
        },
        {
            icon: Timer,
            title: 'Kho không hoạt động',
            value: warehouses.filter(w => w.status === 'INACTIVE').length || 0
        },
        {
            icon: Package,
            title: 'Tổng diện tích',
            value: `${warehouses.reduce((acc, w) => acc + (w.size || 0), 0)} m²`
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <img src={logo} alt="Logo" className="h-11 w-11"/>
                            <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
                                Warehouse Hub
                            </h1>
                        </div>
                        <div className="hidden md:flex space-x-6">
                            {(customer.role === 'ROLE_ADMIN' || customer.role === 'ROLE_SALES')&& (
                            <a href="/kho"
                               className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                DashBoard
                            </a>
                                )}
                            <a href="/reset"
                               className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                Đổi mật khẩu
                            </a>
                            <a href="/profile"
                               className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition duration-300">
                                Xin chào {customer?.username}
                            </a>
                            <button
                                onClick={logOut}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                Đăng xuất
                            </button>
                        </div>
                        <button className="md:hidden">
                            <Menu className="h-6 w-6 text-gray-700" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 opacity-90" />
                <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center mix-blend-overlay" />
                <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Hệ Thống Quản Lý Kho<br className="hidden sm:block" />
                        Thông Minh
                    </h2>
                    <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                        Tìm kiếm và quản lý kho của bạn một cách hiệu quả
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, địa chỉ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 rounded-full w-full shadow-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} 
                             className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                            <div className="bg-indigo-50 rounded-xl p-3 inline-block mb-4">
                                <feature.icon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Warehouse Listings */}
            <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-8 text-center">Danh Sách Kho</h2>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-600 py-8">
                        {error}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-800 block mx-auto"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : filteredWarehouses.length === 0 ? (
                    <div className="text-center text-gray-600 py-8">
                        Không tìm thấy kho phù hợp với tìm kiếm của bạn.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {filteredWarehouses.map((warehouse) => (
                            <div key={warehouse.id} 
                                 className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1"

                                 onClick={() => handleWarehouseClick(warehouse.id)}>


                                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                                    <img 
                                        src="/api/placeholder/400/320" 
                                        alt={warehouse.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-medium border ${statusColors[warehouse.status]}`}>
                                        {warehouse.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{warehouse.name}</h3>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
                                        {warehouse.address}
                                    </div>
                                    <p className="text-gray-600 mb-4">{warehouse.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                                            Quản lý: {warehouse.warehouse_manager_name || 'Chưa có'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <div className="flex items-center">
                                            <Square className="h-5 w-5 text-indigo-600 mr-2" />
                                            <span className="text-xl font-bold">{warehouse.size}</span>
                                            <span className="text-gray-600 text-sm ml-1">m²</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Cần hỗ trợ?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
                        <div className="flex items-center bg-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
                            <Phone className="h-6 w-6 text-indigo-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Hotline</p>
                                <span className="font-semibold">1800-6868</span>
                            </div>
                        </div>
                        <div className="flex items-center bg-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
                            <Mail className="h-6 w-6 text-indigo-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <span className="font-semibold">support@warehousehub.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );

};

export default WarehouseRental;
