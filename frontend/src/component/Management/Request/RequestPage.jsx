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

const REQUEST_TYPES = [
    { id: 1, content: "Service Feedback Request", role_id: 1 },
    { id: 2, content: "Create New Customer Account Request", role_id: 3 },
    { id: 3, content: "Revenue Report Request", role_id: 3 },
    { id: 4, content: "Promotional Material Request", role_id: 3 },
    { id: 5, content: "Maintenance Request", role_id: 4 },
    { id: 6, content: "Incident Report", role_id: 4 },
    { id: 7, content: "Inventory Audit Request", role_id: 4 },
    { id: 8, content: "Improvement/Upgrade Request", role_id: 4 }
];

const RequestList = () => {
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
    const { customer } = useAuth();
    const isAdmin = customer.role === "ROLE_ADMIN";

    useEffect(() => {
        fetchRequests();
    }, [currentPage, isAdmin]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = isAdmin ?
                await getAllRequests(currentPage, 10) :
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
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Loại yêu cầu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nội dung
                            </th>
                            {isAdmin && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người yêu cầu
                                </th>
                            )}

                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50">
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
                                {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ID: {request.user_id}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[request.status]}`}>
                                        {statusTranslations[request.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        {isAdmin ? (
                                            <button
                                                onClick={() => handleAdminReply(request)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Phản hồi"
                                                disabled={request.status === 'CANCELLED'}
                                            >
                                                <MessageCircle className="w-5 h-5"/>
                                            </button>
                                        ) : (
                                            <>
                                                {request.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleEditRequest(request)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 className="w-5 h-5"/>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteRequest(request.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            </>
                                        )}
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




