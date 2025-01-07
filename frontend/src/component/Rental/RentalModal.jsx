import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import {getAllCustomers, getAllCustomersIsActive} from "../../service/Authenticate.js";
import {getAllItems} from "../../service/WareHouse.js";

const RentalModal = ({ isOpen, onClose, mode, rentalData, onSubmit }) => {
    const initialFormState = {
        customer_id: '',
        warehouse_id: '',
        lot_id: '',
        additional_service_id: '',
        contract_id: '',
        rental_type: 'MONTHLY',
        price: '', // Will store float values
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [warehouses, setWarehouses] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [availableLots, setAvailableLots] = useState([]);
    const [availableContracts, setAvailableContracts] = useState([]);
    const RENTAL_TYPES = [
        { value: 'MONTHLY', label: 'Thuê theo tháng' },
        { value: 'FLEXIBLE', label: 'Thuê linh hoạt' }
    ];
    useEffect(() => {
        if (isOpen) {
            fetchOptions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (mode === 'edit' && rentalData) {
            setFormData({
                ...rentalData,
                rental_items: rentalData.rental_items?.map(item => ({
                    ...item,
                })) || [initialFormState.rental_items[0]]
            });
        } else {
            setFormData(initialFormState);
        }
    }, [mode, rentalData, isOpen]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().slice(0, 16);
    };

    // Add new function to fetch lots
    const fetchLots = async (warehouseId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lots/${warehouseId}`);
            const data = await response.json();
            setAvailableLots(data || []);
        } catch (error) {
            console.error('Error fetching lots:', error);
        }
    };

    const fetchContracts = async () => {
        try {
            const token = localStorage.getItem('access_token'); // Get token from localStorage
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contracts/available_contract`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setAvailableContracts(data || []);
        } catch (error) {
            console.error('Error fetching contracts:', error);
        }
    };

    const fetchOptions = async () => {
        setLoading(true);
        try {
            const warehousesResponse = await getAllItems();
            const customersResponse = await getAllCustomersIsActive();
            await fetchContracts(); // Add this line

            setWarehouses(warehousesResponse.data.warehouses);
            setCustomers(customersResponse.data || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
        setLoading(false);
    };


    const ADDITIONAL_SERVICES = [
        { id: 1, name: "Dịch vụ nâng hàng", description: "Cung cấp hỗ trợ nâng hàng hóa trong kho" },
        { id: 2, name: "Dịch vụ bốc dỡ", description: "Cung cấp hỗ trợ bốc dỡ hàng hóa trong kho" },
        { id: 3, name: "Gói dịch vụ toàn diện", description: "Bao gồm tất cả các dịch vụ hỗ trợ vận chuyển như nâng và bốc/dỡ hàng" }
    ];

// Add to validateForm function
    const validateForm = () => {
        const errors = {};

        if (!formData.customer_id) errors.customer_id = 'Vui lòng chọn khách hàng';
        if (!formData.warehouse_id) errors.warehouse_id = 'Vui lòng chọn kho';
        if (!formData.lot_id) errors.lot_id = 'Vui lòng chọn lô hàng';
        if (!formData.contract_id) errors.contract_id = 'Vui lòng nhập mã hợp đồng';
        if (!formData.rental_type) errors.rental_type = 'Vui lòng chọn hình thức thuê';
        if (!formData.price) {
            errors.price = 'Vui lòng nhập giá thuê';
        } else if (parseFloat(formData.price) <= 0) {
            errors.price = 'Giá thuê phải lớn hơn 0';
        }
        return errors;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const submitData = {
            ...formData,
            price: parseFloat(formData.price) // Simply convert string to float
        };

        onSubmit(submitData);
    };

    // Modify handleChange to fetch lots when warehouse is selected
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? parseInt(value) : '') : value
        }));

        // Clear lot selection when warehouse changes
        if (name === 'warehouse_id') {
            setFormData(prev => ({
                ...prev,
                lot_id: ''  // Reset lot selection
            }));
            if (value) {
                fetchLots(value);  // Fetch lots for selected warehouse
            } else {
                setAvailableLots([]); // Clear lots if no warehouse selected
            }
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (!isOpen) return null;

    const inputClasses = (error) => `
        mt-1 block w-full rounded-xl border
        ${error ? 'border-red-300' : 'border-gray-300'}
        px-3 py-2
        focus:outline-none focus:ring-2
        ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}
        transition-colors
    `;

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity"
                style={{zIndex: 40}}
                onClick={onClose}
            />

            <div className="fixed inset-0 overflow-y-auto" style={{zIndex: 41}}>
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">
                                    {mode === 'edit' ? 'Chỉnh sửa đơn thuê kho' : 'Thêm đơn thuê kho mới'}
                                </h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {mode === 'create' && (
                                    <>
                                        {/* Customer selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Khách hàng
                                            </label>
                                            <select
                                                name="customer_id"
                                                value={formData.customer_id}
                                                onChange={handleChange}
                                                className={`${inputClasses(errors.customer_id)} ${loading ? 'cursor-wait' : ''}`}
                                                disabled={loading}
                                            >
                                                <option value="">Chọn khách hàng</option>
                                                {customers.map(customer => (
                                                    <option key={customer.id} value={customer.id}>
                                                        {customer?.fullname} - {customer.email} ({customer.phone_number})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.customer_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
                                            )}
                                        </div>

                                        {/* Warehouse selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Kho
                                            </label>
                                            <select
                                                name="warehouse_id"
                                                value={formData.warehouse_id}
                                                onChange={handleChange}
                                                className={`${inputClasses(errors.warehouse_id)} ${loading ? 'cursor-wait' : ''}`}
                                                disabled={loading}
                                            >
                                                <option value="">Chọn kho</option>
                                                {warehouses.map(warehouse => (
                                                    <option key={warehouse.id} value={warehouse.id}>
                                                        {warehouse.name} - {warehouse.address}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.warehouse_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.warehouse_id}</p>
                                            )}
                                        </div>

                                        {/* Lot selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Lô hàng
                                            </label>
                                            <select
                                                name="lot_id"
                                                value={formData.lot_id}
                                                onChange={handleChange}
                                                className={`${inputClasses(errors.lot_id)} ${loading ? 'cursor-wait' : ''}`}
                                                disabled={!formData.warehouse_id}  // Disable if no warehouse selected
                                            >
                                                <option value="">Chọn lô hàng</option>
                                                {availableLots.map(lot => (
                                                    <option key={lot.id} value={lot.id}>
                                                        {lot.description} - {lot.size}m² - {lot.price}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.lot_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.lot_id}</p>
                                            )}
                                            {!formData.warehouse_id && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Vui lòng chọn kho trước khi chọn lô hàng
                                                </p>
                                            )}
                                        </div>

                                        {/* Rental Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Hình thức thuê
                                            </label>
                                            <select
                                                name="rental_type"
                                                value={formData.rental_type}
                                                onChange={handleChange}
                                                className={inputClasses(errors.rental_type)}
                                            >
                                                {RENTAL_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.rental_type && (
                                                <p className="mt-1 text-sm text-red-600">{errors.rental_type}</p>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Giá thuê (VNĐ/{formData.rental_type === 'MONTHLY' ? 'tháng' : 'ngày'})
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className={inputClasses(errors.price)}
                                                placeholder={`Nhập giá thuê/${formData.rental_type === 'MONTHLY' ? 'tháng' : 'ngày'}`}
                                                step="0.01"
                                                min="0"
                                            />
                                            {errors.price && (
                                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                            )}
                                        </div>

                                        {/* Additional Service */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Dịch vụ bổ sung
                                            </label>
                                            <select
                                                name="additional_service_id"
                                                value={formData.additional_service_id}
                                                onChange={handleChange}
                                                className={inputClasses(errors.additional_service_id)}
                                            >
                                                <option value="">Chọn dịch vụ (tùy chọn)</option>
                                                {ADDITIONAL_SERVICES.map(service => (
                                                    <option key={service.id} value={service.id}>
                                                        {service.name} - {service.description}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>


                                        {/* Contract ID */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Mã hợp đồng
                                            </label>
                                            <select
                                                name="contract_id"
                                                value={formData.contract_id}
                                                onChange={handleChange}
                                                className={`${inputClasses(errors.contract_id)} ${loading ? 'cursor-wait' : ''}`}
                                                disabled={loading}
                                            >
                                                <option value="">Chọn hợp đồng</option>
                                                {availableContracts.map(contract => (
                                                    <option key={contract.id} value={contract.id}>
                                                        Hợp đồng #{contract.id} -
                                                        {new Date(contract.signedDate).toLocaleDateString('vi-VN')} đến
                                                        {new Date(contract.expiryDate).toLocaleDateString('vi-VN')}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.contract_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.contract_id}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Submit buttons */}
                                <div className="flex justify-end space-x-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                                    >
                                    {mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );

};

export default RentalModal;