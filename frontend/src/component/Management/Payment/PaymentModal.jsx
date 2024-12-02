import {useEffect, useState} from "react";
import {
    X
} from 'lucide-react';
const PaymentModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        amount: '',
        orderInfo: '',  // Changed from description to match VNPAY
        user_id: ''
    });
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setFormData({
                amount: '',
                orderInfo: '',
                user_id: ''
            });
            setErrors({});
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
        const amount = parseInt(formData.amount);

        if (!formData.amount || amount <= 0) {
            newErrors.amount = 'Số tiền phải lớn hơn 0';
        }
        if (amount > 100000000) { // Example maximum amount
            newErrors.amount = 'Số tiền không được vượt quá 100.000.000 VNĐ';
        }
        if (!formData.orderInfo.trim()) {
            newErrors.orderInfo = 'Thông tin đơn hàng không được để trống';
        }
        if (!formData.user_id) {
            newErrors.user_id = 'Vui lòng chọn khách hàng';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            // Create URL-encoded form data
            const params = new URLSearchParams();
            params.append('amount', parseInt(formData.amount));
            params.append('orderInfo', formData.orderInfo);
            params.append('id', parseInt(formData.user_id));

            const response = await fetch('http://localhost:8080/warehouses/submitOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                },
                body: params
            });

            if (!response.ok) {
                throw new Error('Payment request failed');
            }

            const paymentUrl = await response.text();
            window.location.href = paymentUrl;
            onClose();
        } catch (error) {
            console.error('Error creating payment:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Có lỗi xảy ra khi tạo thanh toán'
            }));
        } finally {
            setLoading(false);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'amount') {
            // Remove non-numeric characters and convert to number
            const numericValue = value.replace(/[^0-9]/g, '');
            // Format number with thousand separators
            const formattedValue = numericValue ? parseInt(numericValue).toLocaleString('vi-VN') : '';

            setFormData(prev => ({
                ...prev,
                [name]: numericValue // Store raw numeric value
            }));

            // Update the input value with formatted number
            e.target.value = formattedValue;
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
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
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Tạo thanh toán VNPAY</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số tiền (VNĐ)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount ? formData.amount.toLocaleString('vi-VN') : ''}
                                            onChange={handleChange}
                                            className={inputClasses(errors.amount)}
                                            placeholder="0"
                                            inputMode="numeric"
                                        />
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            VNĐ
        </span>
                                    </div>
                                    {errors.amount && (
                                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Thông tin đơn
                                        hàng</label>
                                    <textarea
                                        name="orderInfo"
                                        value={formData.orderInfo}
                                        onChange={handleChange}
                                        className={inputClasses(errors.orderInfo)}
                                        placeholder="Nhập thông tin đơn hàng"
                                        rows="3"
                                    />
                                    {errors.orderInfo && (
                                        <p className="mt-1 text-sm text-red-600">{errors.orderInfo}</p>
                                    )}
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
                                                {user.email} {user.phone && `- ${user.phone}`}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                    )}
                                </div>

                                {errors.submit && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                        {errors.submit}
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
                                        disabled={loading}
                                        className={`px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 
                                                  flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {loading && (
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                                                 viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                        )}
                                        {loading ? 'Đang xử lý...' : 'Tạo thanh toán'}
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