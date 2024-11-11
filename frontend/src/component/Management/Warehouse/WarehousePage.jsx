// Template for [Feature]Page.jsx
import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Plus, Download,
    Mail, Phone, Building2, ArrowUpDown,
    Loader, Edit2, Trash2
} from 'lucide-react';
import CRMLayout from "../Crm.jsx";
import { useToast } from "../../../context/ToastProvider.jsx";
import WarehouseModal from "./WarehouseModal.jsx";
// Import your API functions
import {
    getAllItems,
    createItem,
    updateItem,
    deleteItem
} from "../../../service/WareHouse.js";
import {useAuth} from "../../../context/AuthContext.jsx";

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
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await getAllItems();
            // Extract warehouses array and totalPages from the response
            const { warehouses, totalPages } = response.data;
            setItems(warehouses || []);
            setTotalPages(totalPages);
            setError(null);
        } catch (err) {
            setError('Load kho thất bại');
            showToast?.('Load kho thất bại', 'error');
            console.error('Lỗi load kho:', err);
            setItems([]);
            setTotalPages(0);
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

    const handleDeleteWarehouse = async (warehouseId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa kho này?')) {
            try {
                await deleteItem(warehouseId);
                showToast('Xóa kho thành công', 'success');
                fetchItems();
            } catch (error) {
                showToast('Xóa kho thất bại', 'error');
            }
        }
    };

// Update modal closing handler
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setModalMode('create');
    };
    const handleModalSubmit = async (warehouseData) => {
        try {
            if (modalMode === 'create') {
                await createItem(warehouseData);
                showToast('Thêm mới kho thành công', 'success');
            } else {
                await updateItem(selectedItem.id, warehouseData);
                showToast('Cập nhật kho thành công', 'success');
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            showToast(`Thao tác thất bại: ${error.message}`, 'error');
        }
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

    const statusColors = {
        'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
        'INACTIVE': 'bg-gray-50 text-gray-700 border-gray-100',
        // Add other status colors as needed
    };

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lí kho</h1>
                    <p className="text-gray-600">dành cho admin</p>
                </div>
                <div className="flex gap-3">

                    <button
                        onClick={handleAddWarehouse}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Thêm mới kho
                    </button>
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
            <div className="bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Id</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tên</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Địa chỉ</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">kích thước</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Quản lí</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Miêu tả</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {item.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {item.address}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {item.size.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[item.status] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                {item.status}
                            </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {item.warehouse_manager_name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {item.description}
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleEditWarehouse(item)}
                                            className="p-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit2 className="w-5 h-5"/>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWarehouse(item.id)}
                                            className="p-1 text-red-600 hover:text-red-800"
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

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Số lượng {items.length} kho đang được hiển thị
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

            {/* Feature Modal */}
            <WarehouseModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}  // Use the new handler
                mode={modalMode}
                warehouseData={selectedItem}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

// Wrap with CRMLayout
const FeaturePage = () => (
    <CRMLayout>
        <FeatureList />
    </CRMLayout>
);

export default FeaturePage;