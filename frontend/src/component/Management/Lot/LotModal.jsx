// components/Lots/LotModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {getAllItems} from "../../../service/WareHouse.js";

const LotModal = ({ isOpen, onClose, mode, lotData, onSubmit, warehouseId }) => {
    const initialFormState = {
        id:'',
        size: '',
        description: '',
        price: '',
        status: 'available',
        warehouse_id: warehouseId || ''
    };
    const LOT_STATUS_CONFIG = {
        'available': {
            color: 'bg-green-50 text-green-700 border-green-100',
            label: 'Có sẵn'
        },
        'reserved': {
            color: 'bg-blue-50 text-blue-700 border-blue-100',
            label: 'Đã thuê'
        },
        'occupied': {
            color: 'bg-yellow-50 text-yellow-700 border-yellow-100',
            label: 'Bảo trì'
        }
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormState);
            setErrors({});
        } else if (mode === 'edit' && lotData) {
            setFormData(lotData);
        } else {
            setFormData({
                ...initialFormState,
                warehouse_id: warehouseId
            });
        }
    }, [isOpen, mode, lotData, warehouseId]);

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
        }
    }, [isOpen]);

    const fetchOptions = async () => {
        setLoading(true);
        try {

            const warehousesResponse = await getAllItems();

            setWarehouses(warehousesResponse.data.warehouses);

        } catch (error) {
            console.error('Error fetching options:', error);
        }
        setLoading(false);
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.size || formData.size <= 0)
            newErrors.size = 'Kích thước phải lớn hơn 0';
        if (!formData.description)
            newErrors.description = 'Mô tả không được để trống';
        if (!formData.price || parseFloat(formData.price) <= 0)
            newErrors.price = 'Giá phải lớn hơn 0';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
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
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40"
                 onClick={onClose} />

            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {mode === 'create' ? 'Thêm mới lô hàng' : 'Sửa thông tin lô hàng'}
                                </h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">


                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Kích thước (m²)
                                    </label>
                                    <input
                                        type="number"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleChange}
                                        className={inputClasses(errors.size)}
                                        placeholder="Nhập kích thước"
                                        step="0.01"
                                    />
                                    {errors.size && (
                                        <p className="mt-1 text-sm text-red-600">{errors.size}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Giá (VNĐ)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className={inputClasses(errors.price)}
                                        placeholder="Nhập giá"
                                        step="0.01"
                                    />
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                    )}
                                </div>

                                {mode === 'edit' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Trạng thái
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className={inputClasses(errors.status)}
                                    >
                                        {Object.entries(LOT_STATUS_CONFIG).map(([value, { label }]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                    )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Mô tả
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={inputClasses(errors.description)}
                                        placeholder="Nhập mô tả"
                                        rows="3"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {mode === 'create' && (
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
                                )}

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
                                        {mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
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

export default LotModal;