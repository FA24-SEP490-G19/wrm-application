// Template for [Feature]Page.jsx
import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Plus, Download,
    Mail, Phone, Building2, ArrowUpDown,
    Loader, Edit2, Trash2
} from 'lucide-react';
import CRMLayout from "../Crm.jsx";
import { useToast } from "../../../context/ToastProvider.jsx";
// Import your API functions
import {
    getAllItems,
    createItem,
    updateItem,
    deleteItem
} from "../../../service/WareHouse.js";
import {useAuth} from "../../../context/AuthContext.jsx";
import {jwtDecode} from "jwt-decode";
import {getAllFeedback} from "../../../service/Feedback.js";
import {useNavigate} from "react-router-dom";

const FeatureList = () => {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const { customer } = useAuth();
    const navigate = useNavigate();
    // Add pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items per page

    // Calculate pagination values
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const decodedToken = jwtDecode(token);
            setLoading(true);
            // if (decodedToken.roles !== "ROLE_ADMIN" && decodedToken.roles !== "ROLE_SALES") {
            //     setError('Không có quyền truy cập');
            //     showToast('Không có quyền truy cập', 'error');
            //     return;
            // }
            const response = await getAllFeedback();
            // Extract warehouses array and totalPages from the response
            setItems(response.data);
            setError(null);
        } catch (err) {
            setError(err.response.data);
            showToast?.(err.response.data);
            console.error('Lỗi phản hồi kho:', err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // 2. Update the handler functions
    const handleAddWarehouse = () => {
        setModalMode('create');
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleEditWarehouse = (warehouse) => {
        setModalMode('edit');
        setSelectedItem(warehouse);
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


    // Filter items based on search term and status
    const filteredItems = items.filter(item => {
        if (!item) return false;

        const matchesSearch = searchTerm === '' ||
            Object.values(item)
                .filter(value => value !== null && value !== undefined)
                .some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );

        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const currentItems = filteredItems.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchItems}
                    className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                    Try Again
                </button>
            </div>
        );
    }


    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Phản hồi từ khách hàng</h1>
                    <p className="text-gray-600">Dành cho Admin</p>
                </div>

            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                {/* Add your custom filters here */}
            </div>

            {/* Item List */}
            {/* Item List */}
            <div className="bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Khách hàng</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kho đánh giá</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Đánh giá</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Phản hồi</th>


                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">

                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="text-sm">
                                        <div className="text-gray-500">Tên: {item.customerName}</div>
                                        <div className="text-gray-500">Email: {item.customerEmail}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="text-sm">
                                        <div className="text-gray-500">Mã kho: {item.warehouseId}</div>
                                        <div className="text-gray-500">Tên: {item.warehouseName}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {item.rating} ❤️
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {item.comment}
                                </td>


                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Số lượng {items.length} phản hồi đang được hiển thị
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

// Wrap with CRMLayout
const FeedBackPage = () => (
    <CRMLayout>
        <FeatureList/>
    </CRMLayout>
);

export default FeedBackPage;