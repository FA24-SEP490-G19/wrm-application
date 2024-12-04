// Template for [Feature]Page.jsx
import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Plus, Download,
    Mail, Phone, Building2, ArrowUpDown,
    Loader, Edit2, Trash2, Image, X  // Added Image and X here
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
import {jwtDecode} from "jwt-decode";

const FeatureList = () => {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchField, setSearchField] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const { customer } = useAuth();
    const [selectedImages, setSelectedImages] = useState([]); // For image preview modal
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    // Add pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items per page

    // Calculate pagination values
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;

    const handleSearchChange = (field, value) => {
        setSearchTerms(prev => ({
            ...prev,
            [field]: value
        }));
    };
    // Generate page numbers
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
    useEffect(() => {
        fetchItems();
    }, []);


    const handleViewImages = (warehouse) => {
        setSelectedImages(warehouse.images || []);
        setIsImagePreviewOpen(true);
    };

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
            const response = await getAllItems();
            // Extract warehouses array and totalPages from the response
            const { warehouses, totalPages } = response.data;
            setItems(warehouses || []);
            setError(null);
        } catch (err) {
            setError(err.response.data);
            showToast?.(err.response.data);
            console.error('Lỗi load kho:', err);
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

    const handleDeleteWarehouse = async (warehouseId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa kho này?')) {
            try {
                await deleteItem(warehouseId);
                showToast('Xóa kho thành công', 'success');
                fetchItems();
            } catch (error) {
                showToast(err.response.data);
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
            showToast(error.response.data,'error');
        }
    };
    const statusColors = {
        'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
        'INACTIVE': 'bg-red-50 text-red-700 border-red-100',
    };

    const getStatusLabel = (status) => {
        const statusLabels = {
            'ACTIVE': 'Hoạt động',
            'INACTIVE': 'Không hoạt động'
        };
        return statusLabels[status] || status;
    };
    // Filter items based on search term and status
    const filteredItems = items.filter(item => {
        if (!item) return false;
        if (searchTerm === '') return true;

        const searchLower = searchTerm.toLowerCase();

        switch (searchField) {
            case 'id':
                return item.id.toString().toLowerCase().includes(searchLower);
            case 'name':
                return item.name.toLowerCase().includes(searchLower);
            case 'address':
                return item.address.toLowerCase().includes(searchLower);
            case 'size':
                return item.size.toString().toLowerCase().includes(searchLower);
            case 'status':
                return getStatusLabel(item.status).toLowerCase().includes(searchLower);
            case 'all':
                return (
                    item.id.toString().toLowerCase().includes(searchLower) ||
                    item.name.toLowerCase().includes(searchLower) ||
                    item.address.toLowerCase().includes(searchLower) ||
                    item.size.toString().toLowerCase().includes(searchLower) ||
                    getStatusLabel(item.status).toLowerCase().includes(searchLower)
                );
            default:
                return true;
        }
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý kho</h1>
                    <p className="text-gray-600">Dành cho Admin</p>
                </div>
                {customer.role === "ROLE_ADMIN" ? (
                <div className="flex gap-3">

                    <button
                        onClick={handleAddWarehouse}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Thêm mới kho
                    </button>
                </div>
                    ) : "" }
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-48">
                    <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                        <option value="all">Tất cả</option>
                        <option value="id">ID</option>
                        <option value="name">Tên kho</option>
                        <option value="address">Địa chỉ</option>
                        <option value="size">Kích thước</option>
                        <option value="status">Trạng thái</option>
                    </select>
                </div>


                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder={`Tìm kiếm theo ${searchField === 'all' ? 'tất cả' : searchField}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                {/* Add your custom filters here */}
                <button
                    onClick={() => setSearchTerms({
                        id: '',
                        name: '',
                        address: '',
                        size: '',
                        status: ''
                    })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                    Xóa bộ lọc
                </button>
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
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kích thước</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mô tả</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ảnh</th>

                            {/*<th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Hình ảnh</th>*/}

                            {customer.role === "ROLE_ADMIN" ? (
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
                            ) : ""}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {currentItems.map((item) => (
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
                                    {item.size.toFixed(2) } m²
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {item.description}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[item.status] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                        {getStatusLabel(item.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {item.fullThumbnailPath ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL}/warehouses/images/${item.fullThumbnailPath.split('\\').pop()}`}
                                            alt="Warehouse thumbnail"
                                            className="w-16 h-16 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = '/placeholder.jpg';
                                                e.target.classList.add('opacity-50');
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Image className="w-8 h-8 text-gray-400"/>
                                        </div>
                                    )}
                                </td>

                                {/*<td className="px-6 py-4">*/}
                                {/*    {item.images && item.images.length > 0 ? (*/}
                                {/*        <div className="flex items-center">*/}
                                {/*            <button*/}
                                {/*                onClick={() => handleViewImages(item)}*/}
                                {/*                className="flex items-center text-indigo-600 hover:text-indigo-800"*/}
                                {/*            >*/}
                                {/*                <Image className="w-5 h-5 mr-1"/>*/}
                                {/*                <span>{item.images.length} ảnh</span>*/}
                                {/*            </button>*/}
                                {/*            /!* Optional: Add a small preview of the first image *!/*/}
                                {/*            <img*/}
                                {/*                src={item.images[0]}*/}
                                {/*                alt=""*/}
                                {/*                className="w-8 h-8 ml-2 rounded object-cover"*/}
                                {/*                onError={(e) => {*/}
                                {/*                    e.target.style.display = 'none';*/}
                                {/*                    console.error('Failed to load image:', item.images[0]);*/}
                                {/*                }}*/}
                                {/*            />*/}
                                {/*        </div>*/}
                                {/*    ) : (*/}
                                {/*        <span className="text-gray-400">Không có ảnh</span>*/}
                                {/*    )}*/}
                                {/*</td>*/}

                                {customer.role === "ROLE_ADMIN" ? (

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
                                ) : ""}


                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {/* Updated Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            Hiển thị {firstItemIndex + 1}-{Math.min(lastItemIndex, filteredItems.length)}
                            trong tổng số {filteredItems.length} kho
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

            {isImagePreviewOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsImagePreviewOpen(false)} />
                        <div className="relative bg-white rounded-xl p-6 max-w-2xl w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Hình ảnh kho</h3>
                                <button
                                    onClick={() => setIsImagePreviewOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {selectedImages.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Warehouse image ${index + 1}`}
                                        className="w-full h-48 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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