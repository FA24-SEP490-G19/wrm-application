import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Loader2, Edit2, Trash2
} from 'lucide-react';
import RentalModal from "./RentalModal.jsx";

import { jwtDecode } from "jwt-decode";
import {useToast} from "../../context/ToastProvider.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import {getUserById, getWarehouseById} from "../../service/Appointment.js";
import {createRental, deleteRental, getAllRentals, updateRentalStatus} from "../../service/Reatal.js";
import CRMLayout from "../Management/Crm.jsx";

const RentalList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRental, setSelectedRental] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [customersData, setCustomersData] = useState({});
    const [warehousesData, setWarehousesData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const { customer } = useAuth();

    useEffect(() => {
        fetchRentals();
    }, [currentPage]);

    useEffect(() => {
        if (rentals.length > 0) {
            fetchRelatedData();
        }
    }, [rentals]);

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

            if (decodedToken.roles !== "ROLE_ADMIN" && decodedToken.roles !== "ROLE_SALES") {
                setError('Không có quyền truy cập');
                showToast('Không có quyền truy cập', 'error');
                return;
            }

            const response = await getAllRentals();
            const { rentals: rentalList, totalPages } = response;
            setRentals(rentalList || []);
            setTotalPages(totalPages);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách thuê kho');
            showToast('Tải danh sách thuê kho thất bại', 'error');
            setRentals([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRental = () => {
        setModalMode('create');
        setSelectedRental(null);
        setIsModalOpen(true);
    };

    const handleEditRental = (rental) => {
        setModalMode('edit');
        setSelectedRental(rental);
        setIsModalOpen(true);
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
            setIsModalOpen(false);
            fetchRentals();
        } catch (error) {
            showToast(`Thao tác thất bại: ${error.message}`, 'error');
        }
    };

    const statusColors = {
        'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'APPROVED': 'bg-green-50 text-green-700 border-green-100',
        'REJECTED': 'bg-red-50 text-red-700 border-red-100',
        'COMPLETED': 'bg-blue-50 text-blue-700 border-blue-100'
    };

    const statusTranslations = {
        'PENDING': 'Đang chờ',
        'APPROVED': 'Đã duyệt',
        'REJECTED': 'Từ chối',
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
                    <button
                        onClick={handleAddRental}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Thêm đơn thuê kho
                    </button>
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
                            {customer.role === "ROLE_ADMIN" ? (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                                ) : ""}
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRentals.map((rental) => (
                            <tr key={rental.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {rental.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[rental.status]}`}>
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

                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">

                                        {customer.role === "ROLE_ADMIN" && rental.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(rental.id, 'APPROVED')}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(rental.id, 'REJECTED')}
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

                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Hiển thị {rentals.length} đơn thuê kho
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className={`px-4 py-2 border rounded-md text-sm font-medium
                                    ${currentPage === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className={`px-4 py-2 border rounded-md text-sm font-medium
                                    ${currentPage >= totalPages - 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <RentalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                rentalData={selectedRental}
                onSubmit={handleModalSubmit}
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