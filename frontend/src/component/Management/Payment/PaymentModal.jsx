import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        orderCode: '',
        amount: '',
        description: '',
        returnUrl: 'google.com', // Default value
        cancelUrl: 'google.com', // Default value
        expiredAt: 1, // Default value
        user_id: ''
    });
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/users/customers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                }
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.orderCode) newErrors.orderCode = 'Mã đơn hàng không được để trống';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Số tiền phải lớn hơn 0';
        if (!formData.description) newErrors.description = 'Mô tả không được để trống';
        if (!formData.user_id) newErrors.user_id = 'Vui lòng chọn khách hàng';
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
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Tạo thanh toán mới</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mã đơn hàng</label>
                                    <input
                                        type="number"
                                        name="orderCode"
                                        value={formData.orderCode}
                                        onChange={handleChange}
                                        className={inputClasses(errors.orderCode)}
                                        placeholder="Nhập mã đơn hàng"
                                    />
                                    {errors.orderCode && <p className="mt-1 text-sm text-red-600">{errors.orderCode}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số tiền (VNĐ)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className={inputClasses(errors.amount)}
                                        placeholder="Nhập số tiền"
                                    />
                                    {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={inputClasses(errors.description)}
                                        placeholder="Nhập mô tả"
                                        rows="3"
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Khách hàng</label>
                                    <select
                                        name="user_id"
                                        value={formData.user_id}
                                        onChange={handleChange}
                                        className={inputClasses(errors.user_id)}
                                    >
                                        <option value="">Chọn khách hàng</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.username} - {user.email}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>}
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
                                        Tạo thanh toán
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

export default PaymentModal;