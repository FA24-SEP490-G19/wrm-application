// pages/ContractPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Download, Loader2, Edit2, Trash2, SquareStack
} from 'lucide-react';
import CRMLayout from "../Crm.jsx";
import { useToast } from "../../../context/ToastProvider.jsx";
import LotModal from "./LotModal.jsx";
import {getAllLots, createLot, deleteLot, updateLot} from '../../../service/lot.js';
import {getUserById, getWarehouseById} from "../../../service/Appointment.js";
import {getAllItems} from "../../../service/WareHouse.js";
import {getAllCustomers} from "../../../service/Authenticate.js";
import {useAuth} from "../../../context/AuthContext.jsx";

const LotList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedLot, setSelectedLot] = useState(null);
    const [customersData, setCustomersData] = useState({});
    const [warehousesData, setWarehousesData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items per page

    // Calculate pagination values
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    useEffect(() => {
        fetchLots();
    }, [currentPage]); // Add currentPage as dependency
    useEffect(() => {
        if (lots.length > 0) {
            fetchRelatedData();
        }
    }, [lots]);


    const { customer } = useAuth();
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

    const fetchRelatedData = async () => {
        setLoadingRelatedData(true);
        try {
            const warehouseIds = [...new Set(lots.map(lot => lot.warehouse_id))]


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
    const fetchLots = async () => {
        try {
            setLoading(true);
            const response = await getAllLots();
            setLots(response.data.lots);
            setError(null);
        } catch (err) {
            setError(err.response.data);
            showToast?.(err.response.data);
        } finally {
            setLoading(false);
        }
    };

    const LOT_STATUS_CONFIG = {
        'available': {
            color: 'bg-green-50 text-green-700 border-green-100',
            label: 'Có sẵn'
        },
        'reserved': {
            color: 'bg-blue-50 text-blue-700 border-blue-100',
            label: 'Đã thuê'
        },
        'occupied': {
            color: 'bg-yellow-50 text-yellow-700 border-yellow-100',
            label: 'Bảo trì'
        }
    };
    const statusConfig = LOT_STATUS_CONFIG;
    const handleAddLot = () => {
        setModalMode('create');
        setSelectedLot(null);
        setIsModalOpen(true);
    };

    const handleEditLot = (lot) => {
        setModalMode('edit');
        setSelectedLot(lot);
        setIsModalOpen(true);
    };

    const handleDeleteLot = async (lotId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lô hàng này?')) {
            try {
                await deleteLot(lotId);
                showToast('Xóa lô hàng thành công', 'success');
                fetchLots();
            } catch (error) {
                showToast('Xóa lô hàng thất bại', 'error');
            }
        }
    };

    const handleModalSubmit = async (lotData) => {
        try {
            if (modalMode === 'create') {
                await createLot(lotData);
                showToast('Thêm mới lô hàng thành công', 'success');
            } else {
                await updateLot(selectedLot.id, lotData);
                showToast('Cập nhật lô hàng thành công', 'success');
            }
            setIsModalOpen(false);
            fetchLots();
        } catch (error) {
            showToast(`Thao tác thất bại: ${error.message}`, 'error');
        }
    };

    // Filter lots based on search term
    const filteredLots = lots.filter(lot => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            lot.description?.toLowerCase().includes(searchLower) ||
            LOT_STATUS_CONFIG[lot.status]?.label.toLowerCase().includes(searchLower)
        );
    });
    const currentItems = filteredLots.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredLots.length / itemsPerPage);
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchLots}
                    className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                    Thử lại
                </button>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý lô hàng</h1>
                    <p className="text-gray-600">Quản lý các lô hàng trong kho</p>
                </div>
                {customer.role === "ROLE_ADMIN" || customer.role === "ROLE_MANAGER" ? (
                <div className="flex gap-3">
                    <button
                        onClick={handleAddLot}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Thêm lô hàng
                    </button>
                </div>
                    ) : ""}
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mô tả, trạng thái..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Lots Table */}
            <div className="bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">

                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mô tả</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kho</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kích thước (m²)</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Giá</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                            {customer.role === "ROLE_ADMIN" || customer.role === "ROLE_MANAGER" ? (

                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
                                ) :""}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {currentItems.map((lot) => (
                            <tr key={lot.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{lot.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {warehousesData[lot.warehouse_id] ? (
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                ID: {warehousesData[lot.warehouse_id].id}
                                            </div>
                                            <div className="text-gray-500">
                                                Tên kho: {warehousesData[lot.warehouse_id].name}
                                            </div>
                                            <div className="text-gray-500">
                                                Địa chỉ: {warehousesData[lot.warehouse_id].address}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {lot.size.toLocaleString()} m²
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {formatPrice(lot.price)}
                                </td>
                                <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[lot.status]?.color}`}>
                                            {statusConfig[lot.status]?.label || lot.status}
                                        </span>
                                </td>


                                    <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        {customer.role === "ROLE_ADMIN" || customer.role === "ROLE_MANAGER" ? (
                                        <button
                                            onClick={() => handleEditLot(lot)}
                                            className="p-1 text-blue-600 hover:text-blue-800"
                                            title="Sửa lô hàng"
                                        >
                                            <Edit2 className="w-5 h-5"/>
                                        </button>
                                            ) : "" }
                                        {customer.role === "ROLE_ADMIN"  ? (
                                        <button
                                            onClick={() => handleDeleteLot(lot.id)}
                                            className="p-1 text-red-600 hover:text-red-800"
                                            title="Xóa lô hàng"
                                        >
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                            ) : ""}
                                    </div>
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            Hiển thị {firstItemIndex + 1}-{Math.min(lastItemIndex, filteredLots.length)}
                            trong tổng số {filteredLots.length} lô hàng
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
                                    Math.min(prev + 1, Math.ceil(filteredLots.length / itemsPerPage))
                                )}
                                disabled={currentPage === Math.ceil(filteredLots.length / itemsPerPage)}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${currentPage === Math.ceil(filteredLots.length / itemsPerPage)
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lot Modal */}
            <LotModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                lotData={selectedLot}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

// Wrap with CRMLayout
const LotsPage = () => (
    <CRMLayout>
        <LotList />
    </CRMLayout>
);

export default LotsPage;