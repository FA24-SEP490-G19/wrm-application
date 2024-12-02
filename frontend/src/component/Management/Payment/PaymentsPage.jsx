import React, {useEffect, useState} from "react";
import axios from "axios";
import {useAuth} from "../../../context/AuthContext.jsx";
import {useToast} from "../../../context/ToastProvider.jsx";
import {
   Loader2,Plus,Search,CreditCard
} from 'lucide-react';
import PaymentModal from "./PaymentModal.jsx";
import CRMLayout from "../Crm.jsx";
export const Payment = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { customer } = useAuth();
    const [users, setUsers] = useState({});

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:8080/warehouses',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
            'Content-Type': 'application/json'
        }
    });

    const usersInstance = axios.create({
        baseURL: 'http://localhost:8080',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
            'Content-Type': 'application/json'
        }
    });

    // Calculate pagination
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;

    useEffect(() => {
        fetchPayments();
    }, [currentPage]);

    const fetchUsers = async () => {
        try {
            const response = await usersInstance.get('/users/customers');
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
            const [paymentsResponse] = await Promise.all([
                axiosInstance.get('/payment-requests'),
                fetchUsers()
            ]);
            setPayments(paymentsResponse.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            showToast(err.response?.data?.message || err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleModalSubmit = async (paymentData) => {
        try {
            const response = await axiosInstance.post('/submitOrder', {
                amount: parseInt(paymentData.amount),
                orderInfo: paymentData.orderInfo,
                userId: parseInt(paymentData.user_id)
            });

            // Redirect to VNPAY payment page
            window.location.href = response.data;
            setIsModalOpen(false);
            fetchPayments();
        } catch (error) {
            showToast(`Tạo thanh toán thất bại: ${error.response?.data?.message || error.message}`, 'error');
        }
    };

    const filteredPayments = payments.filter(payment => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const user = users[payment.user_id];
        return (
            payment.orderInfo?.toLowerCase().includes(searchLower) ||
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

    const getUserInfo = (userId) => {
        const user = users[userId];
        if (user) {
            return (
                <div>
                    <div className="font-medium text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
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

    const getPaymentStatus = (status) => {
        const statusMap = {
            'SUCCESS': { label: 'Thành công', class: 'bg-green-100 text-green-800' },
            'FAILED': { label: 'Thất bại', class: 'bg-red-100 text-red-800' },
            'PENDING': { label: 'Đang xử lý', class: 'bg-yellow-100 text-yellow-800' }
        };
        const statusInfo = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
                {statusInfo.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý thanh toán VNPAY</h1>
                    <p className="text-gray-600">Quản lý các giao dịch thanh toán qua VNPAY</p>
                </div>
                {customer.role === "ROLE_SALES" && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700
                                 flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4"/>
                        Tạo thanh toán mới
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mô tả, email khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2
                                 focus:ring-indigo-500 focus:border-indigo-500"
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
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">url thanh toán</th>
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

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

export const PaymentList = () => (
    <CRMLayout>
        <Payment/>
    </CRMLayout>
);