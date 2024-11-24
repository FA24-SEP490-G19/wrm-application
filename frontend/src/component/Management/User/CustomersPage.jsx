import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Plus, MoreHorizontal, Download,
    Mail, Phone, Building2, ArrowUpDown, Loader, Edit2, Trash2
} from 'lucide-react';
import CRMLayout from "../Crm.jsx";
import {createUser, getAllProfile} from "../../../service/Authenticate.js";
import {useToast} from "../../../context/ToastProvider.jsx";
import UserModal from "./UserModal.jsx";

const CustomerList = () => {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);
// Add pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items per page

    // Calculate pagination values
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await getAllProfile();
            setCustomers(response.data);
            setError(null);
        } catch (err) {
            setError(err.response.data);
            showToast?.(err.response.data);
            console.error('Lỗi khi tải danh sách người dùng:', err);
        } finally {
            setLoading(false);
        }
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

    const statusColors = {
        'HOẠT ĐỘNG': 'bg-green-50 text-green-700 border-green-100',
        'KHÔNG HOẠT ĐỘNG': 'bg-gray-50 text-gray-700 border-gray-100',
        'CHỜ XỬ LÝ': 'bg-yellow-50 text-yellow-700 border-yellow-100'
    };

    const handleExportData = () => {
        console.log('Đang xuất dữ liệu...');
    };

    const handleAddUser = () => {
        setModalMode('create');
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await deleteUser(userId);
                showToast('Xóa người dùng thành công', 'success');
                fetchCustomers();
            } catch (error) {
                showToast(err.response.data);
            }
        }
    };

    const handleModalSubmit = async (userData) => {
        try {
            if (modalMode === 'create') {
                await createUser(userData);
                showToast('Thêm mới người dùng thành công', 'success');
            } else {
                await updateUser({ ...userData, id: selectedUser.id });
                showToast('Cập nhật người dùng thành công', 'success');
            }
            setIsModalOpen(false);
            fetchCustomers();
        } catch (error) {
            showToast(err.response.data);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone_number?.includes(searchTerm);

        const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });
    const currentItems = filteredCustomers.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="ml-2">Đang tải...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchCustomers}
                    className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
                    <p className="text-gray-600">Quản lý thông tin người dùng</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportData}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4"/>
                        Xuất file
                    </button>
                    <button
                        onClick={handleAddUser}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Thêm mới
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Người dùng</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Liên hệ</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Giới tính</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {currentItems.map((customer) => (
                            <tr key={customer.email} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-medium text-gray-900">{customer.fullname}</div>
                                        <div className="text-sm text-gray-500">{customer.address}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Mail className="w-4 h-4 mr-2"/>
                                            {customer.email}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Phone className="w-4 h-4 mr-2"/>
                                            {customer.phone_number}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                        <span className="text-sm text-gray-900">
                                            {customer.gender === 'MALE' ? 'Nam' : 'Nữ'}
                                        </span>
                                </td>
                                <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                statusColors[customer.status === 'ACTIVE' ? 'HOẠT ĐỘNG' :
                                                    customer.status === 'INACTIVE' ? 'KHÔNG HOẠT ĐỘNG' :
                                                        'CHỜ XỬ LÝ']
                                            }`}
                                        >
                                            {customer.status === 'ACTIVE' ? 'Hoạt động' :
                                                customer.status === 'INACTIVE' ? 'Không hoạt động' :
                                                    'Chờ xử lý'}
                                        </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleDeleteUser(customer.id)}
                                            className="p-1 text-red-600 hover:text-red-800"
                                            title="Xóa người dùng"
                                        >
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            Hiển thị {firstItemIndex + 1}-{Math.min(lastItemIndex, filteredCustomers.length)}
                            trong tổng số {filteredCustomers.length} người dùng
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
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                userData={selectedUser}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

const CustomersPage = () => (
    <CRMLayout>
        <CustomerList/>
    </CRMLayout>
);

export default CustomersPage;