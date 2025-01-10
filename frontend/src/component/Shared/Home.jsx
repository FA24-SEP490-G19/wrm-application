import React, {useState, useEffect} from 'react';
import {
    Building2, Square, Timer, Truck, Package,
    MapPin, Phone, Mail, Search, Menu, Loader2, User, LayoutDashboard, LogOut, ChevronDown, X, KeyRound, Image
} from 'lucide-react';
import logo from "../../assets/logo.png";
import {getAllItems} from "../../service/WareHouse.js";
import WarehouseDetailModal from "./WarehouseDetailModal.jsx";
import {useNavigate} from 'react-router-dom';
import {useAuth} from "../../context/AuthContext.jsx";

const WarehouseRental = () => {
    // State Management
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const {customer, logOut} = useAuth();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Number of warehouses per page
    // Calculate pagination values
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;


    // Handle page changes
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to warehouse listings
        document.querySelector('#warehouse-listings')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Generate page numbers
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5; // Maximum number of visible page buttons

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };
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
    const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage);
    const currentItems = filteredWarehouses.slice(firstItemIndex, lastItemIndex);
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
            value: `${warehouses.reduce((acc, w) => acc + (w.size || 0), 0).toLocaleString()} m²`
        }
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
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
                            {/*<a*/}
                            {/*    href="/landing"*/}
                            {/*    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700*/}
                            {/*             hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"*/}
                            {/*>*/}
                            {/*    Landing Page*/}
                            {/*</a>*/}


                            {customer?.role === "ROLE_SALES" && (
                                <a
                                    href="/SaleDashboard"
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                         hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2"/>
                                    Màn hình quản lý
                                </a>
                            )}

                            {customer?.role === "ROLE_ADMIN" && (
                                <a
                                    href="/statistical"
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                         hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2"/>
                                    Màn hình quản lý

                                </a>
                            )}

                            {customer?.role === "ROLE_MANAGER" && (
                                <a
                                    href="/ManagerDashboard"
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                         hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2"/>
                                    Màn hình quản lý

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

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 opacity-90"/>
                <div
                    className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center mix-blend-overlay"/>
                <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Hệ Thống Quản Lý Kho<br className="hidden sm:block"/>
                        Thông Minh
                    </h2>
                    <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                        Tìm kiếm và quản lý kho của bạn một cách hiệu quả
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                        <div className="relative w-full max-w-md">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
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
                                <feature.icon className="h-6 w-6 text-indigo-600"/>
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
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin"/>
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
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {  currentItems.filter((warehouse) => warehouse.status === 'ACTIVE').map((warehouse) => (
                            <div key={warehouse.id}
                                 className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
                                 onClick={() => handleWarehouseClick(warehouse.id)}>

                                <div
                                    className="bg-gradient-to-br from-gray-200 to-gray-300 relative aspect-[16/9]"> {/* Added aspect ratio */}
                                    {warehouse.fullThumbnailPath ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL}/warehouses/images/${warehouse.fullThumbnailPath.split('\\').pop()}`}
                                            alt="Warehouse thumbnail"
                                            className="w-full h-full object-cover" // Modified image classes
                                            onError={(e) => {
                                                e.target.src = '/placeholder.jpg';
                                                e.target.classList.add('opacity-50');
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full bg-gray-100 flex items-center justify-center"> {/* Modified placeholder */}
                                            <Image className="w-8 h-8 text-gray-400"/>
                                        </div>
                                    )}
                                    <div
                                        className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-medium border ${statusColors[warehouse.status]}`}>
                                        {warehouse.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{warehouse.name}</h3>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <MapPin className="h-4 w-4 mr-2 text-indigo-600"/>
                                        {warehouse.address}
                                    </div>
                                    <p className="text-gray-600 mb-4">{warehouse.description}</p>
                                    {/*<div className="flex flex-wrap gap-2 mb-4">*/}
                                    {/*    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">*/}
                                    {/*        Quản lý: {warehouse.warehouse_manager_name || 'Chưa có'}*/}
                                    {/*    </span>*/}
                                    {/*</div>*/}
                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <div className="flex items-center">
                                            <Square className="h-5 w-5 text-indigo-600 mr-2"/>
                                            <span className="text-xl font-bold">{warehouse.size.toLocaleString()}</span>
                                            <span className="text-gray-600 text-sm ml-1">m²</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <div className="flex items-center gap-2">
                                    {/* Previous button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                                            ${currentPage === 1
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Trước
                                    </button>

                                    {/* Page numbers */}
                                    {getPageNumbers().map((page, index) => (
                                        <button
                                            key={index}
                                            onClick={() => page !== '...' && handlePageChange(page)}
                                            disabled={page === '...'}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${page === currentPage
                                                ? 'bg-indigo-600 text-white'
                                                : page === '...'
                                                    ? 'text-gray-400 cursor-default'
                                                    : 'hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    {/* Next button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                                            ${currentPage === totalPages
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Results count */}
                        <div className="mt-4 text-center text-sm text-gray-600">
                            Hiển thị {firstItemIndex + 1}-{Math.min(lastItemIndex, filteredWarehouses.length)}
                            của {filteredWarehouses.length} kết quả
                        </div>
                    </>

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
                        <div
                            className="flex items-center bg-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
                            <Phone className="h-6 w-6 text-indigo-600 mr-3"/>
                            <div>
                                <p className="text-sm text-gray-600">Hotline</p>
                                <span className="font-semibold">1800-6868</span>
                            </div>
                        </div>
                        <div
                            className="flex items-center bg-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
                            <Mail className="h-6 w-6 text-indigo-600 mr-3"/>
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
