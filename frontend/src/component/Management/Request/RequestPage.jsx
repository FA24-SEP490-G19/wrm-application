// RequestPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Loader2, Edit2, Trash2, MessageCircle
} from 'lucide-react';
import CRMLayout from "../Crm.jsx";
import { useToast } from "../../../context/ToastProvider.jsx";
import RequestModal from "./RequestModal.jsx";
import {
    getAllRequests,
    getMyRequests,
    createRequest,
    updateRequest,
    deleteRequest
} from "../../../service/Request.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import {getUserById, getWarehouseById} from "../../../service/Appointment.js";

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

const RequestList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [customersData, setCustomersData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);

    const { customer } = useAuth();
    const isAdmin = customer.role === "ROLE_ADMIN";
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    useEffect(() => {
        fetchRequests();
    }, [currentPage, isAdmin]);
    useEffect(() => {
        if (requests.length > 0) {
            fetchRelatedData();
        }
    }, [requests]);
    const fetchRequests = async () => {
        try {
            setLoading(true);

            const response = isAdmin ?
                await getAllRequests() :
                await getMyRequests();

            setRequests(response.requests || []);
            // Fetch customers data

            setError(null);
        } catch (err) {
            setError(err.response.data);
            showToast(err.response.data);
            setRequests([]);

        } finally {
            setLoading(false);
        }
    };
    const fetchRelatedData = async () => {
        setLoadingRelatedData(true);
        try {

            const customerIds = [...new Set(requests.map(request => request.user_id))];

            const customerPromises = customerIds.map(id => getUserById(id));
            const customersResponses = await Promise.all(customerPromises);
            const customersMap = customersResponses.reduce((acc, customer) => {
                acc[customer.id] = customer;
                return acc;
            }, {});
            setCustomersData(customersMap);

        } catch (error) {
            console.error('Error fetching related data:', error);
        } finally {
            setLoadingRelatedData(false);
        }
    };
    const handleAddRequest = () => {
        setModalMode('create');
        setSelectedRequest(null);
        setIsModalOpen(true);
    };
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
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        const customer = customersData[request.user_id] || {};

        switch (searchField) {
            case 'id':
                return request.id.toString().toLowerCase().includes(searchLower);
            case 'type':
                return request.type?.toLowerCase().includes(searchLower);
            case 'content':
                return request.description?.toLowerCase().includes(searchLower);
            case 'response':
                return request.admin_response?.toLowerCase().includes(searchLower);
            case 'status':
                return statusTranslations[request.status]?.toLowerCase().includes(searchLower);
            case 'date':
                const createdDate = new Date(request.created_date).toLocaleString('vi-VN').toLowerCase();
                const responseDate = new Date(request.admin_response_date).toLocaleString('vi-VN').toLowerCase();
                return createdDate.includes(searchLower) || responseDate.includes(searchLower);
            case 'user':
                return (
                    customer.fullname?.toLowerCase().includes(searchLower) ||
                    customer.email?.toLowerCase().includes(searchLower) ||
                    customer.phone_number?.toLowerCase().includes(searchLower)
                );
            case 'all':
            default:
                return (
                    request.id.toString().includes(searchLower) ||
                    request.type?.toLowerCase().includes(searchLower) ||
                    request.description?.toLowerCase().includes(searchLower) ||
                    request.admin_response?.toLowerCase().includes(searchLower) ||
                    statusTranslations[request.status]?.toLowerCase().includes(searchLower) ||
                    new Date(request.created_date).toLocaleString('vi-VN').toLowerCase().includes(searchLower) ||
                    new Date(request.admin_response_date).toLocaleString('vi-VN').toLowerCase().includes(searchLower) ||
                    customer.fullname?.toLowerCase().includes(searchLower) ||
                    customer.email?.toLowerCase().includes(searchLower) ||
                    customer.phone_number?.toLowerCase().includes(searchLower)
                );
        }
    });

    const currentItems = filteredRequests.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin"/>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý yêu cầu</h1>
                    <p className="text-gray-600">
                        {isAdmin ? 'Quản lý các yêu cầu trong hệ thống' : 'Quản lý các yêu cầu của bạn'}
                    </p>
                </div>
                {!isAdmin && (
                    <button
                        onClick={handleAddRequest}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Tạo yêu cầu mới
                    </button>
                )}
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
                        <option value="type">Loại yêu cầu</option>
                        <option value="content">Nội dung</option>
                        <option value="response">Phản hồi</option>
                        <option value="status">Trạng thái</option>
                        <option value="date">Thời gian</option>
                        {isAdmin && <option value="user">Người yêu cầu</option>}
                    </select>
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder={`Tìm kiếm theo ${
                            searchField === 'all' ? 'tất cả' :
                                searchField === 'id' ? 'ID' :
                                    searchField === 'type' ? 'loại yêu cầu' :
                                        searchField === 'content' ? 'nội dung' :
                                            searchField === 'response' ? 'phản hồi' :
                                                searchField === 'status' ? 'trạng thái' :
                                                    searchField === 'date' ? 'thời gian' :
                                                        searchField === 'user' ? 'người yêu cầu' :
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
                            {isAdmin && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người yêu cầu
                                </th>
                            )}

                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>

                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems
                            .map((request, index) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {firstItemIndex + index + 1} {/* Calculate Serial Number */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {request.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {request.type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="space-y-2">
                                            <div className="max-w-md">
                                                <div className="font-medium mb-1">Nội dung:</div>
                                                <div className="whitespace-pre-wrap break-words">
                                                    {request.description}
                                                </div>
                                            </div>

                                            {request.admin_response && (
                                                <div className="max-w-md mt-3">
                                                    <div className="font-medium text-gray-700 mb-1">Phản hồi:</div>
                                                    <div className="whitespace-pre-wrap break-words text-gray-600">
                                                        {request.admin_response}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(request?.created_date).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {request?.admin_response_date
                                            ? new Date(request.admin_response_date).toLocaleString('vi-VN')
                                            : 'Chưa phản hồi'}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {customersData[request.user_id] ? (
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {customersData[request.user_id].fullname}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {customersData[request.user_id].email}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {customersData[request.user_id].phone_number}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">
                                                    {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[request.status]}`}>
                                        {statusTranslations[request.status]}
                                    </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {isAdmin ? (
                                                <>
                                                    {!['APPROVED', 'REJECTED', 'CANCELLED'].includes(request.status) && (
                                                        <button
                                                            onClick={() => handleAdminReply(request)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Phản hồi"
                                                        >
                                                            <MessageCircle className="w-5 h-5"/>
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {request.status !== 'APPROVED' && (
                                                        <button
                                                            onClick={() => handleDeleteRequest(request.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-5 h-5"/>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white px-4 py-3 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            Hiển thị {firstItemIndex + 1}-{Math.min(lastItemIndex, filteredRequests.length)}
                            trong tổng số {filteredRequests.length} yêu cầu
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Previous button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${currentPage === 1
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                Trước
                            </button>

                            {/* Page numbers */}
                            <div className="hidden sm:flex items-center gap-2">
                                {getPageNumbers().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => page !== '...' && setCurrentPage(page)}
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
                            </div>

                            {/* Mobile current page indicator */}
                            <span className="sm:hidden text-sm text-gray-700">
                Trang {currentPage} / {Math.ceil(filteredRequests.length / itemsPerPage)}
            </span>

                            {/* Next button */}
                            <button
                                onClick={() => setCurrentPage(prev =>
                                    Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage))
                                )}
                                disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${currentPage === Math.ceil(filteredRequests.length / itemsPerPage)
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <RequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                requestData={selectedRequest}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

const RequestPage = () => (
    <CRMLayout>
        <RequestList/>
    </CRMLayout>
);

export default RequestPage;




