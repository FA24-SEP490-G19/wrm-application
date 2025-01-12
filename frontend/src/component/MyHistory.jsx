import React, { useState, useEffect } from 'react';
import {Search, Loader2, ArrowLeft, LayoutDashboard, User, ChevronDown, KeyRound, LogOut, X, Menu} from 'lucide-react';
import { useToast } from "../context/ToastProvider.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getUserById, getWarehouseById } from "../service/Appointment.js";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const RentalHistory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [customersData, setCustomersData] = useState({});
    const [warehousesData, setWarehousesData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const navigate = useNavigate();
    const { customer,logOut } = useAuth();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const rentalTypeTranslations = {
        'MONTHLY': 'Thuê theo tháng',
        'FLEXIBLE': 'Thuê linh hoạt'
    };

    useEffect(() => {
        fetchRentals();
    }, [currentPage]);

    useEffect(() => {
        if (rentals.length > 0) {
            fetchRelatedData();
        }
    }, [rentals]);

    const fetchRelatedData = async () => {
        setLoadingRelatedData(true);
        try {
            const customerIds = [...new Set(rentals.map(rental => rental.customer_id))];
            const warehouseIds = [...new Set(rentals.map(rental => rental.warehouse_id))];

            // Fetch customers data
            const customerPromises = customerIds.map(id => getUserById(id));
            const customersResponses = await Promise.all(customerPromises);
            const customersMap = customersResponses.reduce((acc, customer) => {
                acc[customer.id] = customer;
                return acc;
            }, {});
            setCustomersData(customersMap);

            // Fetch warehouses data
            const warehousePromises = warehouseIds.map(id => getWarehouseById(id));
            const warehousesResponses = await Promise.all(warehousePromises);
            const warehousesMap = warehousesResponses.reduce((acc, warehouse) => {
                acc[warehouse.id] = warehouse;
                return acc;
            }, {});
            setWarehousesData(warehousesMap);
        } catch (error) {
            console.error('Error fetching related data:', error);
        } finally {
            setLoadingRelatedData(false);
        }
    };

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rentals/history?page=${currentPage}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rental history');
            }

            const data = await response.json();
            setRentals(data.rentals || []);
            setTotalPages(data.totalPages);
            setError(null);
        } catch (err) {
            setError('Không thể tải lịch sử thuê kho');
            showToast('Tải lịch sử thuê kho thất bại', 'error');
            setRentals([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
        'EXPIRED': 'bg-red-50 text-red-700 border-red-100',
        'COMPLETED': 'bg-blue-50 text-blue-700 border-blue-100'
    };

    const statusTranslations = {
        'OVERDUE': 'Quá hạn',
        'ACTIVE': 'Đã duyệt',
        'EXPIRED': 'Đã hết hạn',
        'COMPLETED': 'Hoàn thành'
    };

    const filteredRentals = rentals.filter(rental => {
        if (!rental) return false;
        return searchTerm === '' ||
            Object.values(rental)
                .filter(value => value !== null && value !== undefined)
                .some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img src={logo} alt="Logo" className="h-11 w-11"/>
                        <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
                            Warehouse Hub
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4">
                        {customer?.role !== "ROLE_USER" && (
                            <a
                                href="/kho"
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                         hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2"/>
                                DashBoard
                            </a>
                        )}

                        {customer?.role === "ROLE_USER" ? (
                            <div className="flex items-center space-x-4">
                                {/* Profile Dropdown */}
                                {/*<div><a*/}
                                {/*    href="/landing"*/}
                                {/*    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700*/}
                                {/*         hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"*/}
                                {/*>*/}
                                {/*    Landing Page*/}
                                {/*</a></div>*/}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600
                                                 to-violet-600 text-white rounded-full hover:shadow-lg
                                                 hover:scale-105 transition duration-300"
                                    >
                                        <User className="w-4 h-4 mr-2"/>
                                        Xin chào {customer?.username}
                                        <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 
                                            ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg
                                                      border border-gray-100 py-1 animate-in fade-in slide-in-from-top-5">
                                            <a
                                                href="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                Thông tin cá nhân
                                            </a>

                                            <a
                                                href="/RentalByUser"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                Đơn thuê kho
                                            </a>
                                            <a
                                                href="/history"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                Lịch sử thuê kho
                                            </a>
                                            <a
                                                href="/MyAppoinment"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                Cuộc hẹn
                                            </a>
                                            <a
                                                href="/MyRequest"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                Yêu cầu
                                            </a>
                                            <a
                                                href="/MyFeedBack"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                Đánh giá
                                            </a>
                                            <a
                                                href="/payment_user"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                Thanh toán
                                            </a>
                                            <a
                                                href="/reset"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                Đổi mật khẩu
                                            </a>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={logOut}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600
                                                         hover:bg-red-50 transition-colors"
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={logOut}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                         hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2"/>
                                Đăng xuất
                            </button>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6 text-gray-700"/>
                        ) : (
                            <Menu className="h-6 w-6 text-gray-700"/>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top">
                        <div className="space-y-2">
                            {customer?.role !== "ROLE_USER" && (
                                <a
                                    href="/kho"
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                             hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2"/>
                                    DashBoard
                                </a>
                            )}

                            {customer?.role === "ROLE_USER" && (
                                <>
                                    <a
                                        href="/profile"
                                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                                 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <User className="w-4 h-4 mr-2"/>
                                        Thông tin cá nhân
                                    </a>
                                    <a
                                        href="/reset"
                                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                                 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <KeyRound className="w-4 h-4 mr-2"/>
                                        Đổi mật khẩu
                                    </a>
                                </>
                            )}

                            <button
                                onClick={logOut}
                                className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600
                                         hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2"/>
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>

    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
            <button
                onClick={() => navigate('/home')}
                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2"/>
                Quay về trang home
            </button>
        </div>

        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Lịch sử thuê kho</h1>
                <p className="text-gray-600">Xem lại các đơn thuê kho đã hoàn thành</p>
            </div>
        </div>

        <div className="mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input
                    type="text"
                    placeholder="Tìm kiếm trong lịch sử..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            STT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kho
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hình thức thuê
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giá thuê
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày bắt đầu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày kết thúc
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRentals.map((rental, index) => (
                        <tr key={rental.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                                {index + 1} {/* Calculate Serial Number */}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {rental.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[rental.status]}`}>
                                            {statusTranslations[rental.status]}
                                        </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {warehousesData[rental.warehouse_id] ? (
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">
                                            {warehousesData[rental.warehouse_id].name}
                                        </div>
                                        <div className="text-gray-500">
                                            {warehousesData[rental.warehouse_id].address}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {rentalTypeTranslations[rental.rental_type]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(rental.price)}/{rental.rental_type === 'MONTHLY' ? 'tháng' : 'ngày'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(rental.start_date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(rental.end_date).toLocaleDateString('vi-VN')}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        Hiển thị {rentals.length} đơn thuê kho
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className={`px-4 py-2 border rounded-md text-sm font-medium
                                ${currentPage === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className={`px-4 py-2 border rounded-md text-sm font-medium
                                ${currentPage >= totalPages - 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
        </div>
)
    ;
};

export default RentalHistory;