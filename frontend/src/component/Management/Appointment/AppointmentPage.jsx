import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Loader, Edit2, Trash2
} from 'lucide-react';
import CRMLayout from "../Crm.jsx";
import { useToast } from "../../../context/ToastProvider.jsx";
import AppointmentModal from "./AppointmentModal.jsx";
import {
    getAllItems,
    createItem,
    updateItem,
    deleteItem, getUserById, getWarehouseById, getAppointmentBySale
} from "../../../service/Appointment.js";
import {useAuth} from "../../../context/AuthContext.jsx";
import {jwtDecode} from "jwt-decode";

const AppointmentList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [saleData, setSaleData] = useState({});
    const [customersData, setCustomersData] = useState({});
    const [warehousesData, setWarehousesData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const { customer } = useAuth();

    useEffect(() => {
        fetchItems();
    }, [currentPage]);

    useEffect(() => {
        if (items.length > 0) {
            fetchRelatedData();
        }
    }, [items]);

    const fetchRelatedData = async () => {
        setLoadingRelatedData(true);
        try {
            const saleIds = [...new Set(items.map(item => item.sales_id))];
            const customerIds = [...new Set(items.map(item => item.customer_id))];
            const warehouseIds = [...new Set(items.map(item => item.warehouse_id))];


            // Fetch sales data
            const salePromises = saleIds.map(id => getUserById(id));
            const saleResponses = await Promise.all(salePromises);
            const saleMap = saleResponses.reduce((acc, customer) => {
                acc[customer.id] = customer;
                return acc;
            }, {});
            setSaleData(saleMap);

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


    const fetchItems = async () => {
        try {
            let response ;
            const token = localStorage.getItem("access_token");
            const decodedToken = jwtDecode(token);

            setLoading(true);
            if (decodedToken.roles !== "ROLE_ADMIN" && decodedToken.roles !== "ROLE_SALES") {
                setError('Không có quyền truy cập');
                showToast('Không có quyền truy cập', 'error');
                return;
            }
            if(decodedToken.roles === "ROLE_ADMIN") {
                 response = await getAllItems(currentPage);
            }else{
                 response = await getAppointmentBySale(currentPage);

            }
            const { appointments, totalPages } = response.data;
            setItems(appointments || []);
            setTotalPages(totalPages);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách cuộc hẹn');
            showToast('Tải danh sách cuộc hẹn thất bại', 'error');
            setItems([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAppointment = () => {
        setModalMode('create');
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleEditAppointment = (appointment) => {
        setModalMode('edit');
        setSelectedItem(appointment);
        setIsModalOpen(true);
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cuộc hẹn này?')) {
            try {
                await deleteItem(appointmentId);
                showToast('Xóa cuộc hẹn thành công', 'success');
                fetchItems();
            } catch (error) {
                showToast('Xóa cuộc hẹn thất bại', 'error');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setModalMode('create');
    };

    const handleModalSubmit = async (appointmentData) => {
        try {
            if (modalMode === 'create') {
                await createItem(appointmentData);
                showToast('Thêm mới cuộc hẹn thành công', 'success');
            } else {
                await updateItem(selectedItem.id, appointmentData);
                showToast('Cập nhật cuộc hẹn thành công', 'success');
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            showToast(`Thao tác thất bại: ${error.message}`, 'error');
        }
    };

    const statusColors = {
        'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'ACCEPTED': 'bg-green-50 text-green-700 border-green-100',
        'REJECTED': 'bg-red-50 text-red-700 border-red-100',
        'COMPLETED': 'bg-blue-50 text-blue-700 border-blue-100',
        'CANCELLED': 'bg-gray-50 text-gray-700 border-gray-100'
    };

    const statusTranslations = {
        'PENDING': 'Đang chờ',
        'ACCEPTED': 'Đã duyệt',
        'REJECTED': 'Từ chối',
        'COMPLETED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy'
    };

    const filteredItems = items.filter(item => {
        if (!item) return false;
        return searchTerm === '' ||
            Object.values(item)
                .filter(value => value !== null && value !== undefined)
                .some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý cuộc hẹn</h1>
                    <p className="text-gray-600">Dành cho nhân viên sale</p>
                </div>
                {customer.role === "ROLE_SALES" ? (
                <button
                    onClick={handleAddAppointment}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                >

                    <Plus className="w-4 h-4"/>
                    Thêm mới cuộc hẹn
                </button>
                    ) : "" }
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Tìm kiếm cuộc hẹn..."
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
                                Mô giới(sale)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kho
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian
                            </th>
                            {customer.role === "ROLE_SALES" ? (
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                                ) : "" }
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[item.status]}`}>
                        {statusTranslations[item.status]}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {customersData[item.customer_id] ? (
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                {customersData[item.customer_id].fullname}
                                            </div>
                                            <div className="text-gray-500">
                                                {customersData[item.customer_id].email}
                                            </div>
                                            <div className="text-gray-500">
                                                {customersData[item.customer_id].phone_number}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {saleData[item.sales_id] ? (
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                {saleData[item.sales_id].fullname}
                                            </div>
                                            <div className="text-gray-500">
                                                {saleData[item.sales_id].email}
                                            </div>
                                            <div className="text-gray-500">
                                                {saleData[item.sales_id].phone_number}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {warehousesData[item.warehouse_id] ? (
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                {warehousesData[item.warehouse_id].name}
                                            </div>
                                            <div className="text-gray-500">
                                                {warehousesData[item.warehouse_id].address}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            {loadingRelatedData ? 'Đang tải...' : 'Không có thông tin'}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.appointment_date).toLocaleString('vi-VN')}
                                </td>
                                {customer.role === "ROLE_SALES" && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditAppointment(item)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAppointment(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Hiển thị {items.length} cuộc hẹn
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

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                mode={modalMode}
                appointmentData={selectedItem}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

const AppointmentPage = () => (
    <CRMLayout>
        <AppointmentList />
    </CRMLayout>
);

export default AppointmentPage;