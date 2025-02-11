import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Loader, Edit2, Trash2, Brush, CheckCircle, XCircle
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
import axios from "axios";
import SaleAssignModal from "./SaleAssignModal.jsx";

const AppointmentList = () => {
    const [searchField, setSearchField] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [saleData, setSaleData] = useState({});
    const [customersData, setCustomersData] = useState({});
    const [warehousesData, setWarehousesData] = useState({});
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [totalItems, setTotalItems] = useState(0);

    const { customer } = useAuth();
    // Add pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items per page
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const accept = {
        customer_id: '',
        warehouse_id: '',
        appointment_date: '',
        status: 'ACCEPTED'
    };
    const reject = {
        customer_id: '',
        warehouse_id: '',
        appointment_date: '',
        status: 'REJECTED'
    };

    // Calculate pagination values

    useEffect(() => {
        fetchItems();
    }, [currentPage]); //

    useEffect(() => {
        if (items.length > 0) {
            fetchRelatedData();
        }
    }, [items]);
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
            // Filter out null or undefined IDs
            const saleIds = [...new Set(items.map(item => item.sales_id).filter(id => id != null))];
            const customerIds = [...new Set(items.map(item => item.customer_id).filter(id => id != null))];
            const warehouseIds = [...new Set(items.map(item => item.warehouse_id).filter(id => id != null))];

            // Fetch sales data
            if (saleIds.length > 0) {
                const salePromises = saleIds.map(id => getUserById(id));
                const saleResponses = await Promise.all(salePromises);
                const saleMap = saleResponses.reduce((acc, sales) => {
                    if (sales) {  // Check if response exists
                        acc[sales.id] = sales;
                    }
                    return acc;
                }, {});
                setSaleData(prev => ({ ...prev, ...saleMap }));
            }

            // Fetch customers data
            if (customerIds.length > 0) {
                const customerPromises = customerIds.map(id => getUserById(id));
                const customersResponses = await Promise.all(customerPromises);
                const customersMap = customersResponses.reduce((acc, customer) => {
                    if (customer) {  // Check if response exists
                        acc[customer.id] = customer;
                    }
                    return acc;
                }, {});
                setCustomersData(prev => ({ ...prev, ...customersMap }));
            }

            // Fetch warehouses data
            if (warehouseIds.length > 0) {
                const warehousePromises = warehouseIds.map(id => getWarehouseById(id));
                const warehousesResponses = await Promise.all(warehousePromises);
                const warehousesMap = warehousesResponses.reduce((acc, warehouse) => {
                    if (warehouse) {  // Check if response exists
                        acc[warehouse.id] = warehouse;
                    }
                    return acc;
                }, {});
                setWarehousesData(prev => ({ ...prev, ...warehousesMap }));
            }
        } catch (error) {
            console.error('Error fetching related data:', error);
        } finally {
            setLoadingRelatedData(false);
        }
    };


    const fetchItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const decodedToken = jwtDecode(token);

            if (decodedToken.roles !== "ROLE_ADMIN" && decodedToken.roles !== "ROLE_SALES") {
                setError('Không có quyền truy cập');
                showToast('Không có quyền truy cập', 'error');
                return;
            }

            let response;
            if(decodedToken.roles === "ROLE_ADMIN") {
                response = await getAllItems();
            } else {
                response = await getAppointmentBySale();
            }

            const { appointments, totalPages: totalPagesFromServer } = response.data;



            setItems(appointments || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data || 'Error fetching data');
            showToast(err.response?.data || 'Error fetching data');

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
        'CANCELLED': 'bg-gray-50 text-gray-700 border-gray-100'
    };

    const statusTranslations = {
        'PENDING': 'Đang chờ',
        'ACCEPTED': 'Đã duyệt',
        'REJECTED': 'Từ chối',
        'CANCELLED': 'Đã hủy'
    };

    const getFilteredItems = () => {
        if (!searchTerm) return items;

        const searchLower = searchTerm.toLowerCase();
        return items.filter(item => {
            const customer = customersData[item.customer_id] || {};
            const warehouse = warehousesData[item.warehouse_id] || {};
            const sale = saleData[item.sales_id] || {};

            switch (searchField) {
                case 'id':
                    return item.id.toString().toLowerCase().includes(searchLower);
                case 'customer':
                    return (
                        customer.fullname?.toLowerCase().includes(searchLower) ||
                        customer.email?.toLowerCase().includes(searchLower) ||
                        customer.phone_number?.toLowerCase().includes(searchLower)
                    );
                case 'sales':
                    return (
                        sale.fullname?.toLowerCase().includes(searchLower) ||
                        sale.email?.toLowerCase().includes(searchLower) ||
                        sale.phone_number?.toLowerCase().includes(searchLower)
                    );
                case 'warehouse':
                    return (
                        warehouse.name?.toLowerCase().includes(searchLower) ||
                        warehouse.address?.toLowerCase().includes(searchLower)
                    );
                case 'status':
                    return statusTranslations[item.status]?.toLowerCase().includes(searchLower);
                case 'date':
                    const appointmentDate = new Date(item.appointment_date)
                        .toLocaleString('vi-VN')
                        .toLowerCase();
                    return appointmentDate.includes(searchLower);
                case 'all':
                default:
                    return (
                        item.id.toString().includes(searchLower) ||
                        customer.fullname?.toLowerCase().includes(searchLower) ||
                        customer.email?.toLowerCase().includes(searchLower) ||
                        customer.phone_number?.toLowerCase().includes(searchLower) ||
                        warehouse.name?.toLowerCase().includes(searchLower) ||
                        warehouse.address?.toLowerCase().includes(searchLower) ||
                        statusTranslations[item.status]?.toLowerCase().includes(searchLower) ||
                        new Date(item.appointment_date)
                            .toLocaleString('vi-VN')
                            .toLowerCase()
                            .includes(searchLower) ||
                        sale.fullname?.toLowerCase().includes(searchLower) ||
                        sale.email?.toLowerCase().includes(searchLower) ||
                        sale.phone_number?.toLowerCase().includes(searchLower)
                    );
            }
        });
    };

    const filteredItems = getFilteredItems();

    const currentItems = filteredItems.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    // Add this function to handle sale assignment
    const handleAssignSale = async (appointmentId, salesId) => {
        try {
            await axios.put(
                ` https://api.g42.biz/appointments/assign/${appointmentId}`,
                { sales_id: salesId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            showToast('Phân công nhân viên sale thành công', 'success');
            setIsAssignModalOpen(false);
            fetchItems(); // Refresh the list
        } catch (error) {
            showToast('Phân công nhân viên sale thất bại', 'error');
        }
    };

// Update the brush icon click handler
    const handleAssignClick = (appointmentId) => {
        setSelectedAppointmentId(appointmentId);
        setIsAssignModalOpen(true);
    };

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        try {
            await axios.put(
                ` https://api.g42.biz/appointments/${appointmentId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            showToast(`Cập nhật trạng thái thành ${statusTranslations[newStatus]}`, 'success');
            fetchItems();
        } catch (error) {
            showToast('Cập nhật trạng thái thất bại', 'error');
        }
    };

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
                ) : ""}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-48">
                    <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                        <option value="all">Tất cả</option>
                        <option value="id">ID</option>
                        <option value="customer">Khách hàng</option>
                        {customer.role === "ROLE_ADMIN" && (
                            <option value="sales">Nhân viên sale</option>
                        )}
                        <option value="warehouse">Kho</option>
                        <option value="status">Trạng thái</option>
                        <option value="date">Thời gian</option>
                    </select>
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder={`Tìm kiếm theo ${
                            searchField === 'all' ? 'tất cả' :
                                searchField === 'customer' ? 'khách hàng' :
                                    searchField === 'sales' ? 'nhân viên sale' :
                                        searchField === 'warehouse' ? 'kho' :
                                            searchField === 'status' ? 'trạng thái' :
                                                searchField === 'date' ? 'thời gian' :
                                                    searchField
                        }...`}
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
                            {customer.role === "ROLE_ADMIN" && (

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sale
                                </th>
                            )}

                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kho
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian
                            </th>

                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {firstItemIndex + index + 1} {/* Calculate Serial Number */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[item.status]}`}>
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
                                {customer.role === "ROLE_ADMIN" && (
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
                                )}
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
                                {customer.role === "ROLE_SALES" && item.status === "PENDING" && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditAppointment(item)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <Edit2 className="w-5 h-5"/>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await updateItem(item.id, accept);
                                                        showToast('Duyệt cuộc hẹn thành công', 'success');
                                                        fetchItems();  // Refresh the page data
                                                    } catch (error) {
                                                        showToast('Duyệt cuộc hẹn thất bại', 'error');
                                                    }
                                                }}
                                                className="text-green-600 hover:text-green-900"
                                                title="Duyệt"
                                            >
                                                <CheckCircle className="w-5 h-5"/>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await updateItem(item.id, reject);
                                                        showToast('Duyệt cuộc hẹn thành công', 'success');
                                                        fetchItems();  // Refresh the page data
                                                    } catch (error) {
                                                        showToast('Duyệt cuộc hẹn thất bại', 'error');
                                                    }
                                                }} className="text-red-600 hover:text-red-900"
                                                title="Từ chối"
                                            >
                                                <XCircle className="w-5 h-5"/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAppointment(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                )}


                                {customer.role === "ROLE_ADMIN" && item.status !== 'ACCEPTED' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleAssignClick(item.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Phân công sale"
                                            >
                                                <Brush className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            Hiển thị {firstItemIndex + 1}-{Math.min(lastItemIndex, filteredItems.length)}
                            trong tổng số {filteredItems.length} cuộc hẹn

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

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                mode={modalMode}
                appointmentData={selectedItem}
                onSubmit={handleModalSubmit}
            />

            <SaleAssignModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                appointmentId={selectedAppointmentId}
                onAssign={handleAssignSale}
            />
        </div>
    );
};

const AppointmentPage = () => (
    <CRMLayout>
        <AppointmentList/>
    </CRMLayout>
);

export default AppointmentPage;