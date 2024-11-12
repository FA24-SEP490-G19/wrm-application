// AppointmentModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {ManagerNotHaveWarehouse} from "../../../service/WareHouse.js";

const WarehouseModal = ({ isOpen, onClose, mode, warehouseData, onSubmit }) => {
    const initialFormState = {
        name: '',
        address: '',
        size: '',
        status: 'ACTIVE',
        description: '',
        warehouse_manager_id: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [managers, setManagers] = useState([]); // State for managers
    const [loadingManagers, setLoadingManagers] = useState(false); // Loading state

    // Existing useEffect for form data...

    // New useEffect to fetch managers
    useEffect(() => {
        const fetchManagers = async () => {
            if (mode === 'create' && isOpen) {
                try {
                    setLoadingManagers(true);
                    const response = await ManagerNotHaveWarehouse();
                    setManagers(response.data || []);
                } catch (error) {
                    console.error('Error fetching managers:', error);
                    // Optionally show error toast
                } finally {
                    setLoadingManagers(false);
                }
            }

            if (mode === 'edit' && isOpen) {
                setFormData(warehouseData);
            }
        };

        fetchManagers();
    }, [isOpen, mode,warehouseData]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Tên kho không được để trống';
        if (!formData.address) newErrors.address = 'Địa chỉ không được để trống';
        if (!formData.size || formData.size <= 0) newErrors.size = 'Kích thước phải lớn hơn 0';
        if (!formData.description) newErrors.description = 'Mô tả không được để trống';
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
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {mode === 'create' ? 'Thêm mới kho' : 'Sửa thông tin kho'}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tên kho
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={inputClasses(errors.name)}
                                        placeholder="Nhập tên kho"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>
                                {mode === 'create' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Người quản lý
                                        </label>
                                        <select
                                            name="warehouse_manager_id"
                                            value={formData.warehouse_manager_id}
                                            onChange={handleChange}
                                            className={`${inputClasses(errors.warehouse_manager_id)} ${loadingManagers ? 'cursor-wait' : ''}`}
                                            disabled={loadingManagers}
                                        >
                                            <option value="">Chọn người quản lý</option>
                                            {loadingManagers ? (
                                                <option value="" disabled>Đang tải...</option>
                                            ) : (
                                                managers.map(manager => (
                                                    <option key={manager.id} value={manager.id}>
                                                        {manager.fullname} {/* Adjust the property name based on your API response */}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        {errors.warehouse_manager_id && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.warehouse_manager_id}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Địa chỉ
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={inputClasses(errors.address)}
                                        placeholder="Nhập địa chỉ"
                                    />
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                    )}
                                </div>

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
                                        Trạng thái
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className={inputClasses(errors.status)}
                                    >
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="INACTIVE">Không hoạt động</option>
                                    </select>
                                </div>


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

export default WarehouseModal;