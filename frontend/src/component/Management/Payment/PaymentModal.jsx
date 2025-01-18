import {useEffect, useState} from "react";
import {
    X
} from 'lucide-react';
const PaymentModal = ({ isOpen, onClose, onSubmit,mode,payment }) => {
    const [formData, setFormData] = useState({
        amount: '',
        orderInfo: '',
        user_id: '',
        rental_id: ''  // Add rental_id to formData
    });
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && payment) {
                // Set initial form data for edit mode
                setFormData({
                    amount: '',
                    orderInfo: '',
                    user_id: ''
                });
            } else {
                // Reset form for create mode
                fetchUsers();
                setFormData({
                    amount: '',
                    orderInfo: '',
                    user_id: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, mode, payment]);


    const fetchUsers = async () => {
        try {
            const response = await fetch('https://api.g42.biz/payment/customers', {
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
        if (amount > 100000000) {
            newErrors.amount = 'Số tiền không được vượt quá 100.000.000 VNĐ';
        }

        // Only validate these fields in create mode
        if (mode === 'create') {
            if (!formData.orderInfo?.trim()) {
                newErrors.orderInfo = 'Thông tin đơn hàng không được để trống';
            }
            if (!formData.user_id) {
                newErrors.user_id = 'Vui lòng chọn khách hàng';
            }
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
            if(mode === "create") {
                // Create URL-encoded form data for create
                const params = new URLSearchParams();
                params.append('amount', parseInt(formData.amount));
                params.append('orderInfo', formData.orderInfo);
                params.append('id', parseInt(formData.user_id));
                params.append('rentalId', formData.rental_id);  // Add rental_id to params

                const response = await fetch('https://api.g42.biz/payment/submitOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: params
                });
                const paymentUrl = await response.text();
                window.location.href = paymentUrl;
            } else {
                // Update only needs amount
                const response = await fetch(`https://api.g42.biz/payment/update/${payment.id}?amount=${parseInt(formData.amount)}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Update failed');
                }

                onSubmit({ amount: parseInt(formData.amount) });
                onClose();
            }
        } catch (error) {
            console.error('Error:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Có lỗi xảy ra khi cập nhật'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'user_id') {
            const selectedUser = users.find(user => `${user.customer_id}-${user.contract_id}` === value);

            setFormData(prev => ({
                ...prev,
                [name]: value,
                rental_id: selectedUser?.rental_id || '',
                orderInfo: selectedUser ?
                    `Thanh toán hợp đồng #${selectedUser.contract_id} của khách hàng ${selectedUser.customer_name}` :
                    ''
            }));
        } else if (name === 'amount') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
            e.target.value = numericValue ? parseInt(numericValue).toLocaleString('vi-VN') : '';
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

    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length !== 5) return "Invalid Date";
        const [year, month, day, hour, minute] = dateArray;
        const formattedDate = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
        return `${formattedDate}`;
    };


    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">{mode === 'create' ? "Tạo thanh toán VNPAY ":"Cập nhật số tiền"}</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'create' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Khách hàng</label>
                                        <select
                                            name="user_id"
                                            value={`${formData.user_id}`} // This should match exactly what we set in handleChange
                                            onChange={handleChange}
                                            className={inputClasses(errors.user_id)}
                                        >
                                            <option value="">Chọn khách hàng</option>
                                            {users.map(user => (
                                                <option
                                                    key={`${user.customer_id}-${user.contract_id}`}
                                                    value={`${user.customer_id}-${user.contract_id}`}
                                                >
                                                    {`${user.customer_name} (Mã hợp đồng: ${user.contract_id})`}
                                                    {user.start_date && user.end_date
                                                        ? ` - ${formatDate(user.start_date)} đến ${formatDate(user.end_date)}`
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.user_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                        )}
                                    </div>
                                ) : ""}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số tiền (VNĐ)</label>
                                    <div className="relative">
                                        <input
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




                                {mode === 'create' ? (

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
                                    ):""}



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
                                        {mode === 'create' ? 'Tạo thanh toán' : 'Cập nhật'}
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