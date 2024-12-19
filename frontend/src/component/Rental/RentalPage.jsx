import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Loader2, Edit2, Trash2,Eye
} from 'lucide-react';
import RentalModal from "./RentalModal.jsx";

import { jwtDecode } from "jwt-decode";
import {useToast} from "../../context/ToastProvider.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import {getUserById, getWarehouseById} from "../../service/Appointment.js";
import {
    createRental,
    deleteRental,
    getAllCustomerId, getAllManagerId,
    getAllRentals,
    getAllSaleId,
    updateRentalStatus
} from "../../service/Reatal.js";
import CRMLayout from "../Management/Crm.jsx";
import ContractModal from "../Management/Contract/ContractModal.jsx";
import {createContract, updateContract} from "../../service/Contract.js";

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
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const { customer } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Calculate pagination values
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;

    useEffect(() => {
        fetchRentals();
    }, [currentPage]);

    useEffect(() => {
        if (rentals.length > 0) {
            fetchRelatedData();
        }
    }, [rentals]);
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

            if (decodedToken.roles !== "ROLE_ADMIN" && decodedToken.roles !== "ROLE_SALES") {
                setError('Không có quyền truy cập');
                showToast('Không có quyền truy cập', 'error');
                return;
            }

            // Update API calls to include pagination parameters
            if(decodedToken.roles === "ROLE_ADMIN") {
                response = await getAllRentals();
            } else if(decodedToken.roles === "ROLE_SALES") {
                response = await getAllSaleId();
            } else if(decodedToken.roles === "ROLE_MANAGER") {
                response = await getAllManaegerId();
            }

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

    const handleViewContract = (rental) => {
        // Close rental modal if it's open
        if (isRentalModalOpen) {
            setIsRentalModalOpen(false);
        }
        setModalMode('view');
        setSelectedContract(rental);
        setIsContractModalOpen(true);
    };

    const handleContractModalSubmit = async (contractData) => {
        try {
            let response;
            if (modalMode === 'create') {
                response = await createContract(contractData);
                setIsContractModalOpen(false);  // Close modal before showing toast
                showToast('Thêm mới hợp đồng thành công', 'success');
            } else {
                response = await updateContract(selectedContract.id, contractData);
                setIsContractModalOpen(false);  // Close modal before showing toast
                showToast('Cập nhật hợp đồng thành công', 'success');
            }
            fetchRentals();
        } catch (error) {
            showToast(`Thao tác thất bại: ${error.message}`, 'error');
        }
    };
    const toastCustomStyle = {
        position: 'fixed',
        zIndex: 9999,  // Higher than modal z-index
        top: '1rem',
        right: '1rem',
    };

    const handleDeleteRental = async (rentalId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đơn thuê kho này?')) {
            try {
                await deleteRental(rentalId);
                showToast('Xóa đơn thuê kho thành công', 'success');
                fetchRentals();
            } catch (error) {
                showToast('Xóa đơn thuê kho thất bại', 'error');
            }
        }
    };

    const handleStatusChange = async (rentalId, newStatus) => {
        try {
            await updateRentalStatus(rentalId, newStatus);
            showToast('Cập nhật trạng thái thành công', 'success');
            fetchRentals();
        } catch (error) {
            showToast('Cập nhật trạng thái thất bại', 'error');
        }
    };

    const handleModalSubmit = async (rentalData) => {
        try {
            if (modalMode === 'create') {
                await createRental(rentalData);
                showToast('Thêm mới đơn thuê kho thành công', 'success');
            } else {
                await updateRentalStatus(selectedRental.id, rentalData.status);
                showToast('Cập nhật đơn thuê kho thành công', 'success');
            }
            setIsRentalModalOpen(false);
            fetchRentals();
        } catch (error) {
            const errorMessage = error.response.data ;
            showToast(errorMessage, 'error');
        }
    };
    const handleRentalModalClose = () => {
        setIsRentalModalOpen(false);
        setSelectedRental(null);
    };

    const handleContractModalClose = () => {
        setIsContractModalOpen(false);
        setSelectedContract(null);
    };

    const statusColors = {
        'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
        'EXPIRED': 'bg-red-50 text-red-700 border-red-100',
        'COMPLETED': 'bg-blue-50 text-blue-700 border-blue-100'
    };

    const statusTranslations = {
        'PENDING': 'Đang chờ',
        'ACTIVE': 'Đã duyệt',
        'EXPIRED': 'Từ chối',
        'COMPLETED': 'Hoàn thành'
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý thuê kho</h1>
                    <p className="text-gray-600">Quản lý các đơn thuê kho trong hệ thống</p>
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
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Khách hàng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kho
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
                            .map((rental) => (
                                <tr key={rental.id} className="hover:bg-gray-50">
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
                                        {warehousesData[rental.warehouse_id] ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {warehousesData[rental.warehouse_id].name}
                                                </div>
                                                <div className="text-gray-500">
                                                    {warehousesData[rental.warehouse_id].address}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {rental.start_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {rental.start_date}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">

                                            {customer.role === "ROLE_ADMIN" && rental.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(rental.id, 'ACTIVE')}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(rental.id, 'EXPIRED')}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </>
                                            )}
                                            {customer.role === "ROLE_ADMIN" ? (
                                                <button
                                                    onClick={() => handleDeleteRental(rental.id)}
                                                    className="text-red-600 hover:text-red-900"
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

            <RentalModal
                isOpen={isRentalModalOpen}
                onClose={() => setIsRentalModalOpen(false)}
                mode={modalMode}
                rentalData={selectedRental}
                onSubmit={handleModalSubmit}
            />

            <ContractModal
                isOpen={isContractModalOpen}
                onClose={() => setIsContractModalOpen(false)}
                mode={modalMode}
                contractData={selectedContract}
                onSubmit={handleContractModalSubmit}
            />

        </div>
    );
};

const RentalPage = () => (
    <CRMLayout>
        <RentalList/>
    </CRMLayout>
);

export default RentalPage;