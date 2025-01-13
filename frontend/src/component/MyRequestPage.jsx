// RequestPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Loader2,
    Edit2,
    Trash2,
    MessageCircle,
    LayoutDashboard,
    User,
    ChevronDown,
    KeyRound,
    LogOut,
    X,
    Menu,
    ArrowLeft
} from 'lucide-react';
import {useToast} from "../context/ToastProvider.jsx";
import {useAuth} from "../context/AuthContext.jsx";
import {createRequest, deleteRequest, getAllRequests, getMyRequests, updateRequest} from "../service/Request.js";
import MyRequestModal from "./MyRequestModal.jsx";
import logo from "../assets/logo.png";
import {useNavigate} from "react-router-dom";


const REQUEST_TYPES = [
    { id: 1, content: "Yêu cầu phản hồi dịch vụ", role_id: 1 },
    { id: 2, content: "Yêu cầu tạo tài khoản khách hàng mới", role_id: 3 },
    { id: 3, content: "Yêu cầu báo cáo doanh thu", role_id: 3 },
    { id: 4, content: "Yêu cầu tài liệu quảng cáo", role_id: 3 },
    { id: 5, content: "Yêu cầu bảo trì", role_id: 4 },
    { id: 6, content: "Báo cáo sự cố", role_id: 4 },
    { id: 7, content: "Yêu cầu kiểm toán hàng tồn kho", role_id: 4 },
    { id: 8, content: "Yêu cầu cải thiện/nâng cấp", role_id: 4 }
];

const MyRequestPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const { customer,logOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, [currentPage]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response =
                await getMyRequests(currentPage, 10);

            setRequests(response.requests || []);
            setTotalPages(response.totalPages);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách yêu cầu');
            showToast('Tải danh sách yêu cầu thất bại', 'error');
            setRequests([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRequest = () => {
        setModalMode('create');
        setSelectedRequest(null);
        setIsModalOpen(true);
    };

    const handleEditRequest = (request) => {
        setModalMode('edit');
        setSelectedRequest({
            ...request,
            type_id: REQUEST_TYPES.find(t => t.content === request.type)?.id
        });
        setIsModalOpen(true);
    };

    const handleAdminReply = (request) => {
        setModalMode('admin-reply');
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = async (requestId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
            try {
                await deleteRequest(requestId);
                showToast('Xóa yêu cầu thành công', 'success');
                fetchRequests();
            } catch (error) {
                showToast('Xóa yêu cầu thất bại', 'error');
            }
        }
    };
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const handleModalSubmit = async (requestData) => {
        try {
            if (modalMode === 'create') {
                await createRequest({
                    type_id: requestData.type_id,
                    description: requestData.description
                });
                showToast('Tạo yêu cầu mới thành công', 'success');
            } else if (modalMode === 'admin-reply') {
                await updateRequest(selectedRequest.id, {
                    status: requestData.status,
                    adminResponse: requestData.adminResponse
                });
                showToast('Phản hồi yêu cầu thành công', 'success');
            } else {
                await updateRequest(selectedRequest.id, {
                    type_id: requestData.type_id,
                    description: requestData.description
                });
                showToast('Cập nhật yêu cầu thành công', 'success');
            }
            setIsModalOpen(false);
            fetchRequests();
        } catch (error) {
            showToast(`Thao tác thất bại: ${error.message}`, 'error');
        }
    };

    const statusColors = {
        'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'APPROVED': 'bg-green-50 text-green-700 border-green-100',
        'REJECTED': 'bg-red-50 text-red-700 border-red-100',
        'CANCELLED': 'bg-gray-50 text-gray-700 border-gray-100'
    };

    const statusTranslations = {
        'PENDING': 'Đang chờ',
        'APPROVED': 'Đã duyệt',
        'REJECTED': 'Từ chối',
        'CANCELLED': 'Đã hủy'
    };

    const filteredRequests = requests.filter(request => {
        if (!request) return false;
        return searchTerm === '' ||
            Object.values(request)
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
                <div className="flex justify-between items-center">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu của bạn</h1>
                        <p className="text-gray-600">
                            {'Danh sách các yêu cầu của bạn'}
                        </p>
                    </div>

                    <button
                        onClick={handleAddRequest}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Tạo yêu cầu mới
                    </button>

                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <input
                            type="text"
                            placeholder="Tìm kiếm yêu cầu..."
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
                                    Loại yêu cầu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nội dung
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày phản hồi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.map((request,index) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {index + 1} {/* Calculate Serial Number */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {request.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {request.type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="max-w-xs overflow-hidden text-ellipsis">
                                            {request.description}
                                        </div>

                                        <div className="mt-1 text-sm text-gray-500">
                                            <strong>Phản hồi:</strong> {request.admin_response}
                                        </div>

                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(request?.created_date).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(request?.admin_response_date).toLocaleString('vi-VN')}

                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {request.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[request.status]}`}>
                                        {statusTranslations[request.status]}
                                    </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">


                                            <>

                                                <button
                                                    onClick={() => handleDeleteRequest(request.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            </>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                Hiển thị {requests.length} yêu cầu
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

                <MyRequestModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode={modalMode}
                    requestData={selectedRequest}
                    onSubmit={handleModalSubmit}
                />
            </div>
        </div>
    );
};


export default MyRequestPage;




