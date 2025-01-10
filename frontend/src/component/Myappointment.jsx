import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Loader, Edit2, Trash2, Brush, LayoutDashboard, User, ChevronDown, KeyRound, LogOut, X, Menu, ArrowLeft
} from 'lucide-react';


import {jwtDecode} from "jwt-decode";
import axios from "axios";

import {getMyAppointment, getUserById, getWarehouseById} from "../service/Appointment.js";
import {useToast} from "../context/ToastProvider.jsx";
import {useAuth} from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";
import {useNavigate} from "react-router-dom";

const MyAppointment = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [saleData, setSaleData] = useState({});
    const [customersData, setCustomersData] = useState({});
    const [warehousesData, setWarehousesData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const { customer,logOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, [currentPage]);

    useEffect(() => {
        if (items.length > 0) {
            fetchRelatedData();
        }
    }, [items]);

    const fetchRelatedData = async () => {
        setLoadingRelatedData(true);
        try {
            // Filter out null or undefined IDs
            const saleIds = [...new Set(items.map(item => item.sales_id).filter(id => id != null))];
            const customerIds = [...new Set(items.map(item => item.customer_id).filter(id => id != null))];
            const warehouseIds = [...new Set(items.map(item => item.warehouse_id).filter(id => id != null))];

            // Fetch sales data
            if (saleIds.length > 0) {
                const salePromises = saleIds.map(id => getUserById(id));
                const saleResponses = await Promise.all(salePromises);
                const saleMap = saleResponses.reduce((acc, sales) => {
                    if (sales) {  // Check if response exists
                        acc[sales.id] = sales;
                    }
                    return acc;
                }, {});
                setSaleData(prev => ({ ...prev, ...saleMap }));
            }

            // Fetch customers data
            if (customerIds.length > 0) {
                const customerPromises = customerIds.map(id => getUserById(id));
                const customersResponses = await Promise.all(customerPromises);
                const customersMap = customersResponses.reduce((acc, customer) => {
                    if (customer) {  // Check if response exists
                        acc[customer.id] = customer;
                    }
                    return acc;
                }, {});
                setCustomersData(prev => ({ ...prev, ...customersMap }));
            }

            // Fetch warehouses data
            if (warehouseIds.length > 0) {
                const warehousePromises = warehouseIds.map(id => getWarehouseById(id));
                const warehousesResponses = await Promise.all(warehousePromises);
                const warehousesMap = warehousesResponses.reduce((acc, warehouse) => {
                    if (warehouse) {  // Check if response exists
                        acc[warehouse.id] = warehouse;
                    }
                    return acc;
                }, {});
                setWarehousesData(prev => ({ ...prev, ...warehousesMap }));
            }
        } catch (error) {
            console.error('Error fetching related data:', error);
        } finally {
            setLoadingRelatedData(false);
        }
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const fetchItems = async () => {
        try {
            let response ;
            const token = localStorage.getItem("access_token");
            const decodedToken = jwtDecode(token);

            setLoading(true);
            // if (decodedToken.roles !== "ROLE_ADMIN" && decodedToken.roles !== "ROLE_SALES") {
            //     setError('Không có quyền truy cập');
            //     showToast('Không có quyền truy cập', 'error');
            //     return;
            // }
            // if(decodedToken.roles === "ROLE_ADMIN") {
            //     response = await getAllItems(currentPage);
            // }else{
            //     response = await getAppointmentBySale(currentPage);
            //
            // }

            if(decodedToken.roles === "ROLE_USER") {
                response = await getMyAppointment(currentPage);
             }

            const { appointments, totalPages } = response;
            setItems(appointments || []);
            setTotalPages(totalPages);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách cuộc hẹn');
            showToast('Tải danh sách cuộc hẹn thất bại', 'error');
            setItems([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };




    const statusColors = {
        'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'ACCEPTED': 'bg-green-50 text-green-700 border-green-100',
        'REJECTED': 'bg-red-50 text-red-700 border-red-100',
        'COMPLETED': 'bg-blue-50 text-blue-700 border-blue-100',
        'CANCELLED': 'bg-gray-50 text-gray-700 border-gray-100'
    };

    const statusTranslations = {
        'PENDING': 'Đang chờ',
        'ACCEPTED': 'Đã duyệt',
        'REJECTED': 'Từ chối',
        'COMPLETED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy'
    };

    const filteredItems = items.filter(item => {
        if (!item) return false;
        return searchTerm === '' ||
            Object.values(item)
                .filter(value => value !== null && value !== undefined)
                .some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
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
                                  {/*  <div><a
                                        href="/landing"
                                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                         hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        Landing Page
                                    </a></div>*/}
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

            <div className="max-w-7xl mx-auto px-4 py-5  ">
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý cuộc hẹn của bạn</h1>
                        <p className="text-gray-600">Dành cho người dùng</p>
                    </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <input
                            type="text"
                            placeholder="Tìm kiếm cuộc hẹn..."
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
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    sale
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kho
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thời gian
                                </th>
                                {customer.role === "ROLE_SALES" ? (
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                ) : ""}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[item.status]}`}>
                        {statusTranslations[item.status]}
                    </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {saleData[item.sales_id] ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {saleData[item.sales_id].fullname}
                                                </div>
                                                <div className="text-gray-500">
                                                    {saleData[item.sales_id].email}
                                                </div>
                                                <div className="text-gray-500">
                                                    {saleData[item.sales_id].phone_number}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {warehousesData[item.warehouse_id] ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {warehousesData[item.warehouse_id].name}
                                                </div>
                                                <div className="text-gray-500">
                                                    {warehousesData[item.warehouse_id].address}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(item.appointment_date).toLocaleString('vi-VN')}
                                    </td>


                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                Hiển thị {items.length} cuộc hẹn
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
    );
};


export default MyAppointment;