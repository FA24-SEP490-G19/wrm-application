import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Loader2, Edit2, Trash2
} from 'lucide-react';

import { jwtDecode } from "jwt-decode";

import {getAllRentalDetail, updateRentalDetailStatus} from "../../../service/Rental_detail.js";
import {useToast} from "../../../context/ToastProvider.jsx";
import {useAuth} from "../../../context/AuthContext.jsx";
import {getWarehouseById} from "../../../service/Appointment.js";
import {createRental, deleteRental, updateRentalStatus} from "../../../service/Reatal.js";
import CRMLayout from "../Crm.jsx";
import RentalModal from "../../Rental/RentalModal.jsx";
import {getLotById} from "../../../service/lot.js";
import {getContractById} from "../../../service/Contract.js";

const RentalDetailList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [rentalDetail, setRentalDetail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRental, setSelectedRental] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [warehousesData, setWarehousesData] = useState({});
    const [lotData, setLotData] = useState({});
    const [contractData, setContractData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const { customer } = useAuth();

    useEffect(() => {
        fetchRentalDetail();
    }, [currentPage]);

    useEffect(() => {
        if (rentalDetail.length > 0) {
            fetchRelatedData();
        }
    }, [rentalDetail]);

    const fetchRelatedData = async () => {
        setLoadingRelatedData(true);
        try {
            // Fetch warehouses data
            const warehouseIds = [...new Set(rentalDetail.map(rental => rental.warehouse_id))];
            const warehousePromises = warehouseIds.map(id => getWarehouseById(id));
            const warehousesResponses = await Promise.all(warehousePromises);
            const warehousesMap = warehousesResponses.reduce((acc, warehouse) => {
                acc[warehouse.id] = warehouse;
                return acc;
            }, {});
            setWarehousesData(warehousesMap);

            // Fetch lot data
            const lotIds = [...new Set(rentalDetail.map(rental => rental.lot_id))];
            const lotPromises = lotIds.map(id => getLotById(id));
            const lotResponses = await Promise.all(lotPromises);
            const lotMap = lotResponses.reduce((acc, lot) => {
                acc[lot.id] = lot;
                return acc;
            }, {});
            setLotData(lotMap);

            // Fetch contract data
            const contractIds = [...new Set(rentalDetail.map(rental => rental.contract_id))];
            const contractPromises = contractIds.map(id => getContractById(id));
            const contractResponses = await Promise.all(contractPromises);
            const contractMap = contractResponses.reduce((acc, contract) => {
                acc[contract.id] = contract;
                return acc;
            }, {});
            setContractData(contractMap);
        } catch (error) {
            console.error('Error fetching related data:', error);
        } finally {
            setLoadingRelatedData(false);
        }
    };

    const ADDITIONAL_SERVICES = [
        { id: 1, name: "Lifting Service", description: "Provides lifting support for goods in the warehouse" },
        { id: 2, name: "Loading and Unloading", description: "Provides loading and unloading support for goods in the warehouse" },
        { id: 3, name: "Comprehensive Package", description: "Includes all transportation support services such as lifting and loading/unloading" }
    ];

    const fetchRentalDetail= async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const decodedToken = jwtDecode(token);
            let response;


            response = await getAllRentalDetail();


            const { rentalDetails: rentalList, totalPages } = response;
            setRentalDetail(rentalList || []);
            setTotalPages(totalPages);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách thuê kho');
            showToast('Tải danh sách thuê kho thất bại', 'error');
            setRentalDetail([]);
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



    const handleStatusChange = async (rentalId, newStatus) => {
        try {
            await updateRentalDetailStatus(rentalId, newStatus);
            showToast('Cập nhật trạng thái thành công', 'success');
            fetchRentalDetail();
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
            const errorMessage = error.response.data ;
            showToast(errorMessage, 'error');
        }
    };

    const statusColors = {
        'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
        'COMPLETED': 'bg-blue-50 text-blue-700 border-blue-100'
    };

    const statusTranslations = {
        'PENDING': 'Đang chờ',
        'COMPLETED': 'Đã thuê xong',
        'ACTIVE': 'Đang thuê'
    };

    const filteredRentals = rentalDetail.filter(rentalDetail => {
        if (!rentalDetail) return false;
        return searchTerm === '' ||
            Object.values(rentalDetail)
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
                                Dịch vụ kèm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lô
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kho
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hợp đồng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày tạo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày sửa đổi
                            </th>
                            {customer.role === "ROLE_ADMIN" || customer.role === "ROLE_MANAGER"  ? (
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
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[rental.status]}`}>
                                        {statusTranslations[rental.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {ADDITIONAL_SERVICES.find((service) => service.id === rental.additional_service_id)?.name || "No Service Found"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {lotData[rental.lot_id] ? (
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                Mã lô: {lotData[rental.lot_id].id}
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                {lotData[rental.lot_id].description}
                                            </div>
                                            <div className="text-gray-500">
                                                {lotData[rental.lot_id].size}
                                            </div>
                                            <div className="text-gray-500">
                                                {lotData[rental.lot_id].price}
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
                                                Mã kho: {warehousesData[rental.warehouse_id].id}
                                            </div>
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

                                <td className="px-6 py-4 whitespace-nowrap">
                                    {contractData[rental.contract_id] ? (
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                Mã hợp đồng: {contractData[rental.contract_id].id}
                                            </div>

                                            <div className="text-gray-500">
                                                Khách hàng: {contractData[rental.contract_id].customerFullName}
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
                                    {rental.end_date}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">

                                        {customer.role === "ROLE_MANAGER" && rental.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(rental.id, 'ACTIVE')}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Duyệt
                                                </button>

                                            </>
                                        )}

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
                            Hiển thị {rentalDetail.length} đơn thuê kho
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

const RentalDetail = () => (
    <CRMLayout>
        <RentalDetailList/>
    </CRMLayout>
);

export default RentalDetail;