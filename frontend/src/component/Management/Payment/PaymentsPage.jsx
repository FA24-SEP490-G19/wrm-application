import React, {useEffect, useState} from "react";
import axios from "axios";
import {useAuth} from "../../../context/AuthContext.jsx";
import {useToast} from "../../../context/ToastProvider.jsx";
import {
    Loader2, Plus, Search, CreditCard, Edit2, Trash2
} from 'lucide-react';
import PaymentModal from "./PaymentModal.jsx";
import CRMLayout from "../Crm.jsx";
import {jwtDecode} from "jwt-decode";
export const Payment = () => {
    const [searchField, setSearchField] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;
    const { customer } = useAuth();
    const [users, setUsers] = useState({});
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);

    const axiosInstance = axios.create({
        baseURL: 'https://api.g42.biz/payment',
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



    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const decodedToken = jwtDecode(token);
            if (decodedToken.roles === "ROLE_MANAGER") {
                setError('Không có quyền truy cập');
                showToast('Không có quyền truy cập', 'error');
                return;
            }
            if (decodedToken.roles === "ROLE_SALES") {
                const [paymentsResponse] = await Promise.all([
                    axiosInstance.get('/payment-requests/sales'),
                ]);
                setPayments(paymentsResponse.data);
                setError(null);
            }else if(decodedToken.roles === "ROLE_ADMIN"){
                const [paymentsResponse] = await Promise.all([
                    axiosInstance.get('/payment-requests'),
                ]);
                setPayments(paymentsResponse.data);
                setError(null);
            }


        } catch (err) {
            setError(err.response?.data?.message || err.message);
            showToast(err.response?.data?.message || err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleModalSubmit = async (paymentData) => {
        try {
            if(modalMode === 'create') {
                const response = await axiosInstance.post('/submitOrder', {
                    amount: parseInt(paymentData.amount),
                    orderInfo: paymentData.orderInfo,
                    userId: parseInt(paymentData.user_id)
                });
                window.location.href = response.data;
            } else {
                await axiosInstance.put(`/update/${selectedItem.id}`, null, {
                    params: {
                        amount: parseInt(paymentData.amount)
                    }
                });
                showToast('Cập nhật thành công', 'success');
                fetchPayments(); // Refresh the payments list
                setIsModalOpen(false);
            }
        } catch (error) {
            showToast(`Thao tác thất bại: ${error.response?.data?.message || error.message}`, 'error');
        }
    };
    const filteredPayments = payments.filter(payment => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();

        switch (searchField) {
            case 'id':
                return payment.id.toString().toLowerCase().includes(searchLower);
            case 'info':
                return payment.orderInfo?.toLowerCase().includes(searchLower);
            case 'amount':
                return payment.amount.toString().includes(searchLower);
            case 'customer':
                return (
                    payment.user?.fullName?.toLowerCase().includes(searchLower)
                );
            case 'status':
                const statusText = payment.status === 'SUCCESS' ? 'đã thanh toán' : 'đang đợi thanh toán';
                return statusText.includes(searchLower);
            case 'date':
                const createdDate = formatDate(payment.createdDate).toLowerCase();
                const paymentDate = formatDate(payment.paymentTime).toLowerCase();
                return createdDate.includes(searchLower) || paymentDate.includes(searchLower);
            case 'all':
            default:
                return (
                    payment.id.toString().includes(searchLower) ||
                    payment.orderInfo?.toLowerCase().includes(searchLower) ||
                    payment.amount.toString().includes(searchLower) ||
                    payment.user?.fullName?.toLowerCase().includes(searchLower) ||
                    formatDate(payment.createdDate).toLowerCase().includes(searchLower) ||
                    formatDate(payment.paymentTime).toLowerCase().includes(searchLower) ||
                    (payment.status === 'SUCCESS' ? 'đã thanh toán' : 'đang đợi thanh toán').includes(searchLower)
                );
        }
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

    const formatDate = (dateArray) => {
        // Check if dateArray exists and is an array
        if (!dateArray || !Array.isArray(dateArray)) return '';

        // Destructure the array values
        const [year, month, day, hour, minute, second] = dateArray;

        // Create a date object (note: month - 1 because JavaScript months are 0-based)
        const date = new Date(year, month - 1, day, hour, minute, second);

        // Format using Vietnamese locale
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
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
    const formatDateTime = (input) => {
        // Extract the parts of the string
        const year = input.slice(0, 4);
        const month = input.slice(4, 6);
        const day = input.slice(6, 8);
        const hour = input.slice(8, 10);
        const minute = input.slice(10, 12);
        const second = input.slice(12, 14);

        // Format the result
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
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

    function handleEditPayment(payment) {
        setModalMode("edit");
        setSelectedItem(payment);
        setIsModalOpen(true)

    }

    function handleAddPayment() {
        setModalMode("create");
        setIsModalOpen(true)
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
                        onClick={handleAddPayment}
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
                <div className="sm:w-48">
                    <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                        <option value="all">Tất cả</option>
                        <option value="info">Thông tin</option>
                        <option value="amount">Số tiền</option>
                        <option value="customer">Khách hàng</option>
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
                                    searchField === 'info' ? 'thông tin' :
                                        searchField === 'amount' ? 'số tiền' :
                                            searchField === 'customer' ? 'khách hàng' :
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

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">STT</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thông tin</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số tiền</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thời gian tạo</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thời gian thanh toán
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Khách hàng</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500"></th>

                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {currentItems.map((payment, index) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {firstItemIndex + index + 1} {/* Calculate Serial Number */}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">{payment.orderInfo}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {formatPrice(payment.amount)}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {formatDate(payment.createdDate)}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {formatDate(payment.paymentTime)}
                                </td>
                                <td className="px-6 py-4">{payment.user.fullName}</td>

                                <td className="px-6 py-4">

                                    {payment.status === 'SUCCESS' ? 'Đã Thanh Toán' : 'Đang đợi thanh toán'}
                                </td>
                                <td>
                                    <div className="flex justify-end space-x-2">
                                        {payment.status !== 'SUCCESS' && (
                                            <button
                                                onClick={() => handleEditPayment(payment)}
                                                className="p-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit2 className="w-5 h-5"/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination remains the same */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            Hiển thị {firstItemIndex + 1}-{Math.min(lastItemIndex, currentItems.length)}
                            trong tổng số {currentItems.length} lô hàng
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

                            {/* Next button */}
                            <button
                                onClick={() => setCurrentPage(prev =>
                                    Math.min(prev + 1, Math.ceil(currentItems.length / itemsPerPage))
                                )}
                                disabled={currentPage === Math.ceil(currentItems.length / itemsPerPage)}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${currentPage === Math.ceil(currentItems.length / itemsPerPage)
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
                mode={modalMode}
                payment={selectedItem}
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