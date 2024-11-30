import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import CRMLayout from "../Crm.jsx";
import { useToast } from "../../../context/ToastProvider.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import PaymentModal from "./PaymentModal.jsx";
import axios from 'axios';

const PaymentList = () => {
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
    const { customer } = useAuth();
    const [users, setUsers] = useState({});

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

    const fetchUsers = async (userIds) => {
        try {
            const response = await a.get('/users/customers');
            const usersMap = {};
            response.data.forEach(user => {
                usersMap[user.id] = user;
            });
            setUsers(usersMap);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/payment-requests');
            setPayments(response.data);

            // Get unique user IDs from payments
            const userIds = [...new Set(response.data.map(payment => payment.user_id))];
            await fetchUsers(userIds);

            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            showToast?.(err.response?.data?.message || err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleModalSubmit = async (paymentData) => {
        try {
            await axiosInstance.post('/payment-requests', paymentData);
            showToast('Thêm mới thanh toán thành công', 'success');
            setIsModalOpen(false);
            fetchPayments();
        } catch (error) {
            showToast(`Thao tác thất bại: ${error.response?.data?.message || error.message}`, 'error');
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
    const getUserInfo = (userId) => {
        const user = users[userId];
        if (user) {
            return (
                <div>
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                </div>
            );
        }
        return 'Không tìm thấy thông tin';
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý thanh toán</h1>
                    <p className="text-gray-600">Quản lý các thanh toán trong hệ thống</p>
                </div>
                {customer.role === "ROLE_SALES" && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddPayment}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4"/>
                            Thêm thanh toán
                        </button>
                    </div>
                )}
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
            <div className="bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mô tả</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số tiền</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ID Người dùng</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">URL</th>

                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {currentItems.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{payment.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{payment.description}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {formatPrice(payment.amount)}
                                    <a href=""></a>
                                </td>
                                <td className="px-6 py-4">{getUserInfo(payment.user_id)}</td>
                                <td className="px-6 py-4 text-gray-500"><a > {payment.url}</a></td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            Hiển thị {firstItemIndex + 1}-{Math.min(lastItemIndex, filteredPayments.length)} trong tổng số {filteredPayments.length} thanh toán
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                                    ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                Trước
                            </button>
                            <div className="hidden sm:flex items-center gap-2">
                                {getPageNumbers().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => page !== '...' && setCurrentPage(page)}
                                        disabled={page === '...'}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                            ${page === currentPage ? 'bg-indigo-600 text-white' : page === '...' ? 'text-gray-400 cursor-default' : 'hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredPayments.length / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(filteredPayments.length / itemsPerPage)}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                                    ${currentPage === Math.ceil(filteredPayments.length / itemsPerPage) ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

// Wrap with CRMLayout
const PaymentsPage = () => (
    <CRMLayout>
        <PaymentList />
    </CRMLayout>
);

export default PaymentsPage;