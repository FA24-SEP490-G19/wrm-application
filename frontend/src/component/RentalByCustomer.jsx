import React, {useState, useEffect, useCallback} from 'react';
import {
    Search, Plus, Loader2, Edit2, Trash2, LayoutDashboard, User, ChevronDown, KeyRound, LogOut, X, Menu, ArrowLeft,Eye
} from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import {getAllCustomerId, getAllSaleId} from "../service/Reatal.js";
import {useToast} from "../context/ToastProvider.jsx";
import {useAuth} from "../context/AuthContext.jsx";
import {getUserById, getWarehouseById} from "../service/Appointment.js";
import logo from "../assets/logo.png";
import {useNavigate} from "react-router-dom";
import ImageViewer from "./Management/Contract/ImageViewer.jsx";
import axios from "axios";
const RentalByCustomer = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [customersData, setCustomersData] = useState({});
    const [warehousesData, setWarehousesData] = useState({});
    const [saleData, setSalesData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const { customer } = useAuth();
    const { logOut } = useAuth();
    const navigate = useNavigate();
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedContractId, setSelectedContractId] = useState(null);
    const [contractImages, setContractImages] = useState({});

// Add this function to get auth config
    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
    });

// Add this function to fetch contract images
    const fetchContractImages = async (contractId) => {
        try {
            const response = await axios.get(
                ` https://api.g42.biz/contracts/${contractId}/images`,
                getAuthConfig()
            );
            const imageIds = response.data;

            const imageUrls = imageIds.map(imageId => ({
                url: ` https://api.g42.biz/contracts/images/${imageId}`,
                config: getAuthConfig()
            }));

            setContractImages(prev => ({
                ...prev,
                [contractId]: imageUrls
            }));

            return imageUrls;
        } catch (error) {
            console.error('Error fetching contract images:', error);
            return [];
        }
    };

// Add this handler function
    const handleViewContractImages = async (rental) => {
        if (!rental.contract_id) {
            showToast('Không có hợp đồng cho đơn thuê này', 'info');
            return;
        }

        try {
            let images;
            if (contractImages[rental.contract_id]) {
                images = contractImages[rental.contract_id];
            } else {
                images = await fetchContractImages(rental.contract_id);
            }

            if (images && images.length > 0) {
                setSelectedImages(images);
                setSelectedContractId(rental.contract_id);
                setIsImageViewerOpen(true);
            } else {
                showToast('Không có hình ảnh cho hợp đồng này', 'info');
            }
        } catch (error) {
            showToast('Không thể tải hình ảnh hợp đồng', 'error');
        }
    };

// Add this callback function
    const handleImagesUpdate = useCallback(async () => {
        if (selectedContractId) {
            const updatedImages = await fetchContractImages(selectedContractId);
            setSelectedImages(updatedImages);
            setContractImages(prev => ({
                ...prev,
                [selectedContractId]: updatedImages
            }));
        }
    }, [selectedContractId]);
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
            const SaleIds = [...new Set(rentals.map(rental => rental.sales_id))];

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
            const token = localStorage.getItem("access_token");
            const decodedToken = jwtDecode(token);
            let response;
            // if (decodedToken.roles !== "ROLE_ADMIN" && decodedToken.roles !== "ROLE_SALES") {
            //     setError('Không có quyền truy cập');
            //     showToast('Không có quyền truy cập', 'error');
            //     return;
            // }
            // if(decodedToken.roles === "ROLE_ADMIN") {
            //     response = await getAllRentals();
            // }

            if(decodedToken.roles === "ROLE_USER") {
                response = await getAllCustomerId();
            }



            const { rentals: rentalList, totalPages } = response;
            setRentals(rentalList || []);
            setTotalPages(totalPages);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách thuê kho');
            showToast('Tải danh sách thuê kho thất bại', 'error');
            setRentals([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };


    const statusColors = {
        'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'APPROVED': 'bg-green-50 text-green-700 border-green-100',
        'REJECTED': 'bg-red-50 text-red-700 border-red-100',
        'COMPLETED': 'bg-blue-50 text-blue-700 border-blue-100'
    };

    const statusTranslations = {
        'PENDING': 'Đang chờ',
        'ACTIVE': 'Đã duyệt',
        'EXPIRED': 'Từ chối',
        'COMPLETED': 'Hoàn thành'
    };
    const rentalTypeTranslations = {
        'MONTHLY': 'Thuê theo tháng',
        'FLEXIBLE': 'Thuê linh hoạt'
    };
    const filteredRentals = rentals.filter(rental => {
        if (!rental) return false;
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        const warehouse = warehousesData[rental.warehouse_id] || {};

        switch (searchField) {
            case 'id':
                return rental.id.toString().toLowerCase().includes(searchLower);
            case 'warehouse':
                return (
                    warehouse.name?.toLowerCase().includes(searchLower) ||
                    warehouse.address?.toLowerCase().includes(searchLower)
                );
            case 'type':
                return rentalTypeTranslations[rental.rental_type]?.toLowerCase().includes(searchLower);
            case 'price':
                return rental.price.toString().includes(searchLower);
            case 'date':
                const startDate = new Date(rental.start_date).toLocaleDateString('vi-VN').toLowerCase();
                const endDate = new Date(rental.end_date).toLocaleDateString('vi-VN').toLowerCase();
                return startDate.includes(searchLower) || endDate.includes(searchLower);
            case 'status':
                return statusTranslations[rental.status]?.toLowerCase().includes(searchLower);
            case 'all':
            default:
                return (
                    rental.id.toString().toLowerCase().includes(searchLower) ||
                    warehouse.name?.toLowerCase().includes(searchLower) ||
                    warehouse.address?.toLowerCase().includes(searchLower) ||
                    rentalTypeTranslations[rental.rental_type]?.toLowerCase().includes(searchLower) ||
                    rental.price.toString().includes(searchLower) ||
                    new Date(rental.start_date).toLocaleDateString('vi-VN').toLowerCase().includes(searchLower) ||
                    new Date(rental.end_date).toLocaleDateString('vi-VN').toLowerCase().includes(searchLower) ||
                    statusTranslations[rental.status]?.toLowerCase().includes(searchLower)
                );
        }
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

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
                                    {/*<div><a*/}
                                    {/*    href="/landing"*/}
                                    {/*    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700*/}
                                    {/*     hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"*/}
                                    {/*>*/}
                                    {/*    Landing Page*/}
                                    {/*</a></div>*/}
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
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
                        <h1 className="text-2xl font-bold text-gray-900">Đơn thuê kho</h1>
                        <p className="text-gray-600">Danh sách các đơn thuê kho của bạn trong hệ thống</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-48">
                        <select
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            <option value="all">Tất cả</option>
                            <option value="id">ID</option>
                            <option value="warehouse">Kho</option>
                            <option value="type">Hình thức thuê</option>
                            <option value="price">Giá thuê</option>
                            <option value="date">Thời gian</option>
                            <option value="status">Trạng thái</option>
                        </select>
                    </div>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <input
                            type="text"
                            placeholder={`Tìm kiếm theo ${
                                searchField === 'all' ? 'tất cả' :
                                    searchField === 'id' ? 'ID' :
                                        searchField === 'warehouse' ? 'kho' :
                                            searchField === 'type' ? 'hình thức thuê' :
                                                searchField === 'price' ? 'giá thuê' :
                                                    searchField === 'date' ? 'thời gian' :
                                                        searchField === 'status' ? 'trạng thái' :
                                                            searchField
                            }...`}
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
                                    Giá thuê (VNĐ)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thời gian ký hợp đồng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thời hạn hợp đồng
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRentals.map((rental,index) => (
                                <tr key={rental.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {index + 1 } {/* Calculate Serial Number */}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewContractImages(rental)}
                                                className="p-1 text-gray-600 hover:text-gray-800"
                                                title="Xem hình ảnh"
                                            >
                                                <Eye className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            <ImageViewer
                                images={selectedImages}
                                isOpen={isImageViewerOpen}
                                onClose={() => {
                                    setIsImageViewerOpen(false);
                                    setSelectedContractId(null);
                                }}
                                contractId={selectedContractId}
                                onImagesUpdate={handleImagesUpdate}
                            />
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
    );
};


export default RentalByCustomer;