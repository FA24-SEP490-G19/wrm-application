import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import {getAllCustomers} from "../../service/Authenticate.js";
import {getAllItems} from "../../service/WareHouse.js";

const RentalModal = ({ isOpen, onClose, mode, rentalData, onSubmit }) => {
    const initialFormState = {
        customer_id: '',
        warehouse_id: '',
        rental_items: [{
            lot_id: '',
            additional_service_id: '',
            contract_id: '',
            start_date: '',
            end_date: ''
        }]
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [warehouses, setWarehouses] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

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
                    start_date: formatDateForInput(item.start_date),
                    end_date: formatDateForInput(item.end_date)
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

    const fetchOptions = async () => {
        setLoading(true);
        try {
            const warehousesResponse = await getAllItems();
            const customersResponse = await getAllCustomers();

            setWarehouses(warehousesResponse.data.warehouses);
            setCustomers(customersResponse.data || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
        setLoading(false);
    };

    const ADDITIONAL_SERVICES = [
        { id: 1, name: "Lifting Service", description: "Provides lifting support for goods in the warehouse" },
        { id: 2, name: "Loading and Unloading", description: "Provides loading and unloading support for goods in the warehouse" },
        { id: 3, name: "Comprehensive Package", description: "Includes all transportation support services such as lifting and loading/unloading" }
    ];

    const validateForm = () => {
        const errors = {};

        if (!formData.customer_id) {
            errors.customer_id = 'Vui lòng chọn khách hàng';
        }

        if (!formData.warehouse_id) {
            errors.warehouse_id = 'Vui lòng chọn kho';
        }

        const itemErrors = formData.rental_items.map(item => {
            const itemError = {};
            if (!item.lot_id) {
                itemError.lot_id = 'Vui lòng chọn lô hàng';
            }
            if (!item.start_date) {
                itemError.start_date = 'Vui lòng chọn ngày bắt đầu';
            }
            if (!item.end_date) {
                itemError.end_date = 'Vui lòng chọn ngày kết thúc';
            }
            if (item.start_date && item.end_date && new Date(item.end_date) <= new Date(item.start_date)) {
                itemError.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
            }
            return itemError;
        });

        if (itemErrors.some(error => Object.keys(error).length > 0)) {
            errors.rental_items = itemErrors;
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
            rental_items: formData.rental_items.map(item => ({
                ...item,
                start_date: new Date(item.start_date).toISOString(),
                end_date: new Date(item.end_date).toISOString()
            }))
        };

        onSubmit(submitData);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? parseInt(value) : '') : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleRentalItemChange = (index, field, value) => {
        const updatedItems = [...formData.rental_items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };
        setFormData(prevState => ({
            ...prevState,
            rental_items: updatedItems
        }));

        // Clear errors for the changed field
        if (errors.rental_items?.[index]?.[field]) {
            const newErrors = { ...errors };
            newErrors.rental_items[index][field] = '';
            setErrors(newErrors);
        }
    };

    const addRentalItem = () => {
        setFormData(prevState => ({
            ...prevState,
            rental_items: [...prevState.rental_items, {
                lot_id: '',
                additional_service_id: '',
                contract_id: '',
                start_date: '',
                end_date: ''
            }]
        }));
    };

    const removeRentalItem = (index) => {
        if (formData.rental_items.length > 1) {
            setFormData(prevState => ({
                ...prevState,
                rental_items: prevState.rental_items.filter((_, i) => i !== index)
            }));
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
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
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
                                    </>
                                )}

                                {/* Rental Items */}
                                {formData.rental_items.map((item, index) => (
                                    <div key={index} className="space-y-4 p-4 border rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-medium">Thông tin thuê #{index + 1}</h3>
                                            {formData.rental_items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRentalItem(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Mã lô hàng
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.lot_id}
                                                    onChange={(e) => handleRentalItemChange(index, 'lot_id', e.target.value)}
                                                    className={inputClasses(errors.rental_items?.[index]?.lot_id)}
                                                />
                                                {errors.rental_items?.[index]?.lot_id && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.rental_items[index].lot_id}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Dịch vụ bổ sung
                                                </label>
                                                <select
                                                    value={item.additional_service_id}
                                                    onChange={(e) => handleRentalItemChange(index, 'additional_service_id', e.target.value)}
                                                    className={inputClasses(errors.rental_items?.[index]?.additional_service_id)}
                                                >
                                                    <option value="">Chọn dịch vụ (tùy chọn)</option>
                                                    {ADDITIONAL_SERVICES.map(service => (
                                                        <option key={service.id} value={service.id}>
                                                            {service.name} - {service.description}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Thời gian bắt đầu
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={item.start_date}
                                                    onChange={(e) => handleRentalItemChange(index, 'start_date', e.target.value)}
                                                    className={inputClasses(errors.rental_items?.[index]?.start_date)}
                                                />
                                                {errors.rental_items?.[index]?.start_date && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.rental_items[index].start_date}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Thời gian kết thúc
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={item.end_date}
                                                    onChange={(e) => handleRentalItemChange(index, 'end_date', e.target.value)}
                                                    className={inputClasses(errors.rental_items?.[index]?.end_date)}
                                                />
                                                {errors.rental_items?.[index]?.end_date && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.rental_items[index].end_date}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Mã hợp đồng
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.contract_id}
                                                    onChange={(e) => handleRentalItemChange(index, 'contract_id', e.target.value)}
                                                    className={inputClasses(errors.rental_items?.[index]?.contract_id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addRentalItem}
                                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-400 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5"/>
                                    Thêm thông tin thuê
                                </button>

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