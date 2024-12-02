import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Loader2,
    Edit2,
    Trash2,
    LayoutDashboard,
    User,
    ChevronDown,
    KeyRound,
    LogOut,
    X, Menu, CreditCard, ArrowLeft
} from 'lucide-react';

import axios from 'axios';
import logo from "../assets/logo.png";
import {useAuth} from "../context/AuthContext.jsx";
import {useToast} from "../context/ToastProvider.jsx";
import {useNavigate} from "react-router-dom";

const MyPaymentPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { customer,logOut } = useAuth();
    const [users, setUsers] = useState({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const navigate = useNavigate();

    // Axios instance with default config
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:8080/warehouses',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
            'Content-Type': 'application/json'
        }
    });

    const a = axios.create({
        baseURL: 'http://localhost:8080',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
            'Content-Type': 'application/json'
        }
    });

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const handleStatusChange = async (paymentId, currentStatus) => {
        if (window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái thanh toán?')) {
            try {
                await axiosInstance.put(`/payment-requests/${paymentId}`, {
                    is_payment: !currentStatus
                });
                showToast('Cập nhật trạng thái thành công', 'success');
                fetchPayments();
            } catch (error) {
                showToast(`Cập nhật thất bại: ${error.response?.data?.message || error.message}`, 'error');
            }
        }
    };
    useEffect(() => {
        fetchPayments();
    }, [currentPage]);


    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/payment-requests');
            setPayments(response.data);



            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            showToast?.(err.response?.data?.message || err.message, 'error');
        } finally {
            setLoading(false);
        }
    };



    const filteredPayments = payments.filter(payment => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const user = users[payment.user_id];
        return (
            payment.description?.toLowerCase().includes(searchLower) ||
            user?.username?.toLowerCase().includes(searchLower) ||
            user?.email?.toLowerCase().includes(searchLower)
        );
    });


    const currentItems = filteredPayments.slice(firstItemIndex, lastItemIndex);

    const getPageNumbers = () => {
        const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const handleAddPayment = () => {
        setModalMode('create');
        setSelectedPayment(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };



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
                                                <User className="w-4 h-4 mr-2 text-gray-400"/>
                                                Thông tin cá nhân
                                            </a>

                                            <a
                                                href="/RentalByUser"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                <User className="w-4 h-4 mr-2 text-gray-400"/>
                                                Quản lý thuê kho
                                            </a>
                                            <a
                                                href="/MyAppoinment"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                <User className="w-4 h-4 mr-2 text-gray-400"/>
                                                Quản lý cuộc hẹn
                                            </a>
                                            <a
                                                href="/MyRequest"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                <User className="w-4 h-4 mr-2 text-gray-400"/>
                                                Quản lý yêu cầu
                                            </a>
                                            <a
                                                href="/MyFeedBack"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                <User className="w-4 h-4 mr-2 text-gray-400"/>
                                                Quản lý đánh giá
                                            </a>
                                            <a
                                                href="/reset"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                            >
                                                <KeyRound className="w-4 h-4 mr-2 text-gray-400"/>
                                                Đổi mật khẩu
                                            </a>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={logOut}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600
                                                         hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-2 text-red-500"/>
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
            <div className="max-w-7xl mx-auto px-4 py-5 ">
                <div className="text-left flex items-center space-x-2">
                    {/* Optional content on the left */}
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2"/>
                        Quay về trang home
                    </button>
                </div>
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý thanh toán</h1>
                        <p className="text-gray-600">Quản lý các thanh toán của bạn trong hệ thống</p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mô tả, ID người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thông tin</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số tiền</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">url thanh toán
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {currentItems.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">{payment.orderInfo}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {formatPrice(payment.amount)}
                                    </td>
                                    <td className="px-6 py-4">{payment.user.fullName}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => window.location.href = payment.url}
                                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700
                             transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <CreditCard className="w-4 h-4"/>
                                            Thanh toán
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination remains the same */}
                </div>

            </div>
        </div>
    );
};


export default MyPaymentPage;