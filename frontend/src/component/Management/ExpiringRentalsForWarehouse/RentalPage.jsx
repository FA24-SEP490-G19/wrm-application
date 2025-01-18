import React, {useState, useEffect, useCallback} from 'react';
import {
    Search, Plus, Loader2, Edit2, Trash2,Eye
} from 'lucide-react';

import { jwtDecode } from "jwt-decode";

import axios from "axios";
import {useToast} from "../../../context/ToastProvider.jsx";
import {useAuth} from "../../../context/AuthContext.jsx";
import {getUserById, getWarehouseById} from "../../../service/Appointment.js";
import {
    getAllExpiringRentalsForWarehouse,
    getAllRentalByManager,
    getAllRentals,
    getLotById
} from "../../../service/Reatal.js";
import ImageViewer from "../Contract/ImageViewer.jsx";
import CRMLayout from "../Crm.jsx";

const RentalList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRental, setSelectedRental] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [customersData, setCustomersData] = useState({});
    const [warehousesData, setWarehousesData] = useState({});
    const [lotData, setLotsData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const { customer } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedContractId, setSelectedContractId] = useState(null);  // Add this line

    // Calculate pagination values
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const [contractImages, setContractImages] = useState({});
    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
    });
    const fetchContractImages = async (contractId) => {
        try {
            // First get the image IDs
            const response = await axios.get(
                `http://localhost:8080/contracts/${contractId}/images`,
                getAuthConfig()
            );
            const imageIds = response.data;

            // Keep track of image URLs with their auth config
            const imageUrls = imageIds.map(imageId => ({
                url: `http://localhost:8080/contracts/images/${imageId}`,
                config: getAuthConfig()
            }));

            setContractImages(prev => ({
                ...prev,
                [contractId]: imageUrls
            }));

            return imageUrls;
        } catch (error) {
            console.error('Error fetching contract images:', error);
            return [];
        }
    };

// Add these translations for rental types
    const rentalTypeTranslations = {
        'MONTHLY': 'Thuê theo tháng',
        'FLEXIBLE': 'Thuê linh hoạt'
    };
    useEffect(() => {
        fetchRentals();
    }, [currentPage]);

    useEffect(() => {
        if (rentals.length > 0) {
            fetchRelatedData();
        }
    }, [rentals]);
    const handleViewContractImages = async (rental) => {
        if (!rental.contract_id) {
            showToast('Không có hợp đồng cho đơn thuê này', 'info');
            return;
        }

        try {
            let images;
            if (contractImages[rental.contract_id]) {
                images = contractImages[rental.contract_id];
            } else {
                images = await fetchContractImages(rental.contract_id);
            }

            if (images && images.length > 0) {
                setSelectedImages(images);
                setSelectedContractId(rental.contract_id); // Add this state
                setIsImageViewerOpen(true);
            } else {
                showToast('Không có hình ảnh cho hợp đồng này', 'info');
            }
        } catch (error) {
            showToast('Không thể tải hình ảnh hợp đồng', 'error');
        }
    };
    // Add this function to refresh images after updates
    const handleImagesUpdate = useCallback(async () => {
        if (selectedContractId) {
            const updatedImages = await fetchContractImages(selectedContractId);
            setSelectedImages(updatedImages);

            // Update the cached images
            setContractImages(prev => ({
                ...prev,
                [selectedContractId]: updatedImages
            }));
        }
    }, [selectedContractId]);
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
            const customerIds = [...new Set(rentals.map(rental => rental.customer_id))];
            const warehouseIds = [...new Set(rentals.map(rental => rental.warehouse_id))];
            const lotIds = [...new Set(rentals.map(rental => rental.lot_id))];

            // Fetch customers data
            const customerPromises = customerIds.map(id => getUserById(id));
            const customersResponses = await Promise.all(customerPromises);
            const customersMap = customersResponses.reduce((acc, customer) => {
                acc[customer.id] = customer;
                return acc;
            }, {});
            setCustomersData(customersMap);

            // Fetch warehouses data
            const warehousePromises = warehouseIds.map(id => getWarehouseById(id));
            const warehousesResponses = await Promise.all(warehousePromises);
            const warehousesMap = warehousesResponses.reduce((acc, warehouse) => {
                acc[warehouse.id] = warehouse;
                return acc;
            }, {});
            setWarehousesData(warehousesMap);


            // Fetch lots data
            const lotPromises = lotIds.map(id => getLotById(id));
            const lotsResponses = await Promise.all(lotPromises);
            const lotsMap = lotsResponses.reduce((acc, lot) => {
                acc[lot.id] = lot;
                return acc;
            }, {});
            setLotsData(lotsMap);
        } catch (error) {
            console.error('Error fetching related data:', error);
        } finally {
            setLoadingRelatedData(false);
        }
    };

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const decodedToken = jwtDecode(token);
            let response;

            if (decodedToken.roles !== "ROLE_MANAGER") {
                setError('Không có quyền truy cập');
                showToast('Không có quyền truy cập', 'error');
                return;
            }

            // Update API calls to include pagination parameters
                response = await getAllRentalByManager();


            const { rentals: rentalList, totalPages, totalItems } = response;
            setRentals(rentalList || []);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách thuê kho');
            showToast('Tải danh sách thuê kho thất bại', 'error');
            setRentals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRental = () => {
        // Close contract modal if it's open
        if (isContractModalOpen) {
            setIsContractModalOpen(false);
        }
        setModalMode('create');
        setSelectedRental(null);
        setIsRentalModalOpen(true);
    };

    const handleAddContract = () => {
        // Close rental modal if it's open
        if (isRentalModalOpen) {
            setIsRentalModalOpen(false);
        }
        setModalMode('create');
        setSelectedContract(null);
        setIsContractModalOpen(true);
    };






    const statusColors = {
        'ACTIVE': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'EXPIRED': 'bg-green-50 text-green-700 border-green-100',
        'OVERDUE': 'bg-red-50 text-red-700 border-red-100',
        'TERMINATED': 'bg-blue-50 text-blue-700 border-blue-100'
    };

    const statusTranslations = {
        'ACTIVE': 'Đang hoạt động',
        'EXPIRED': 'Hết hạn',
        'OVERDUE': 'Quá hạn',
        'TERMINATED': 'Đã hủy'
    };

    const filteredRentals = rentals.filter(rental => {
        if (!rental) return false;
        return searchTerm === '' ||
            Object.values(rental)
                .filter(value => value !== null && value !== undefined)
                .some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
    });
    const currentItems = filteredRentals.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý hợp đồng thuê kho</h1>
                    <p className="text-gray-600">Danh sách các hợp đồng</p>
                </div>
                {customer.role === "ROLE_SALES" && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddRental}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4"/>
                            Thêm đơn thuê kho
                        </button>
                        <button
                            onClick={handleAddContract}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4"/>
                            Thêm hợp đồng
                        </button>
                    </div>
                )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn thuê kho..."
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
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Khách hàng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lot
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hình thức thuê
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giá thuê (VNĐ)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian ký hợp đồng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời hạn hợp đồng
                            </th>

                            {customer.role === "ROLE_ADMIN" ? (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            ) : ""}
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems
                            .map((rental,index) => (
                                <tr key={rental.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {firstItemIndex + index + 1} {/* Calculate Serial Number */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {rental.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[rental.status]}`}>
                                        {statusTranslations[rental.status]}
                                    </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {customersData[rental.customer_id] ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {customersData[rental.customer_id].fullname}
                                                </div>
                                                <div className="text-gray-500">
                                                    {customersData[rental.customer_id].email}
                                                </div>
                                                <div className="text-gray-500">
                                                    {customersData[rental.customer_id].phone_number}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {warehousesData[rental.warehouse_id] && lotData[rental.lot_id] ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {lotData[rental.lot_id]?.description || 'Không có mô tả'}
                                                </div>
                                                <div className="text-gray-500">
                                                    Kho: {warehousesData[rental.warehouse_id].name}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                            </div>
                                        )}
                                    </td>                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {rentalTypeTranslations[rental.rental_type]}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(rental.price)}/{rental.rental_type === 'MONTHLY' ? 'tháng' : 'ngày'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(rental.start_date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(rental.end_date).toLocaleDateString('vi-VN')}
                                    </td>


                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewContractImages(rental)}
                                                className="p-1 text-gray-600 hover:text-gray-800"
                                                title="Xem hình ảnh"
                                            >
                                                <Eye className="w-5 h-5"/>
                                            </button>


                                            <ImageViewer
                                                images={selectedImages}
                                                isOpen={isImageViewerOpen}
                                                onClose={() => {
                                                    setIsImageViewerOpen(false);
                                                    setSelectedContractId(null);  // Reset the selected contract ID
                                                }}
                                                contractId={selectedContractId}
                                                onImagesUpdate={handleImagesUpdate}
                                            />
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
                            Hiển thị {firstItemIndex + 1}-{Math.min(lastItemIndex, filteredRentals.length)}
                            trong tổng số {filteredRentals.length} đơn thuê kho
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
                Trang {currentPage} / {Math.ceil(filteredRentals.length / itemsPerPage)}
            </span>

                            {/* Next button */}
                            <button
                                onClick={() => setCurrentPage(prev =>
                                    Math.min(prev + 1, Math.ceil(filteredRentals.length / itemsPerPage))
                                )}
                                disabled={currentPage === Math.ceil(filteredRentals.length / itemsPerPage)}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${currentPage === Math.ceil(filteredRentals.length / itemsPerPage)
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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

const RentalPageForManager = () => (
    <CRMLayout>
        <RentalList/>
    </CRMLayout>
);

export default RentalPageForManager;