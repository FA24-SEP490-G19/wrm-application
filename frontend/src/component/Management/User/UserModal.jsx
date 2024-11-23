
// components/Users/Modal/ContractModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

const UserModal = ({ isOpen, onClose, mode, userData, onSubmit }) => {
    const [formData, setFormData] = useState(userData || {
        fullname: '',
        email: '',
        password: '',
        retype_password: '',
        address: '',
        gender: '',
        roleId: '',
        phone_number: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setErrors({});
            if (!userData) {
                setFormData({
                    fullname: '',
                    email: '',
                    password: '',
                    retype_password: '',
                    address: '',
                    gender: '',
                    roleId: '',
                    phone_number: ''
                });
            }
        }
    }, [isOpen, userData]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullname) newErrors.fullname = 'Họ tên không được để trống';
        if (!formData.email) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (mode === 'create' && !formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        }
        if (mode === 'create' && formData.password !== formData.retype_password) {
            newErrors.retype_password = 'Mật khẩu không khớp';
        }
        if (!formData.phone_number) newErrors.phone_number = 'Số điện thoại không được để trống';
        if (!formData.roleId) newErrors.roleId = 'Vui lòng chọn vai trò';
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
        const { name, value } = e.target;
        // Convert roleId to number
        if (name === 'roleId') {
            setFormData(prev => ({
                ...prev,
                [name]: value ? parseInt(value) : '' // Convert to number if value exists
            }));
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
            {/* Backdrop */}
            <div 
                className="fixed inset-0  backdrop-blur-sm transition-opacity z-40"
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Modal */}
            <div 
                className="fixed inset-0 z-50 overflow-y-auto"
                aria-labelledby="modal-title"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all animate-modal">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                                    {mode === 'create' ? 'Thêm mới người dùng' : 'Sửa thông tin người dùng'}
                                </h2>
                                <button 
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Đóng"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Họ tên
                                    </label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleChange}
                                        className={inputClasses(errors.fullname)}
                                        placeholder="Nhập họ tên"
                                    />
                                    {errors.fullname && (
                                        <p className="mt-1 text-sm text-red-600">{errors.fullname}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={inputClasses(errors.email)}
                                        placeholder="example@email.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password Fields - Only for Create Mode */}
                                {mode === 'create' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Mật khẩu
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={inputClasses(errors.password)}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Xác nhận mật khẩu
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showRetypePassword ? "text" : "password"}
                                                    name="retype_password"
                                                    value={formData.retype_password}
                                                    onChange={handleChange}
                                                    className={inputClasses(errors.retype_password)}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setShowRetypePassword(!showRetypePassword)}
                                                >
                                                    {showRetypePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.retype_password && (
                                                <p className="mt-1 text-sm text-red-600">{errors.retype_password}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className={inputClasses(errors.phone_number)}
                                        placeholder="0123456789"
                                    />
                                    {errors.phone_number && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                                    )}
                                </div>

                                {/* Address */}
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
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Giới tính
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={inputClasses(errors.gender)}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                    </select>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Vai trò
                                    </label>
                                    <select
                                        name="roleId"
                                        value={formData.roleId}
                                        onChange={handleChange}
                                        className={inputClasses(errors.roleId)}
                                    >
                                        <option value="">Chọn vai trò</option>
                                        <option value={1}>User</option>
                                        <option value={2}>Admin</option>
                                        <option value={3}>Sales</option>
                                        <option value={4}>Manager</option>
                                    </select>
                                    {errors.roleId && (
                                        <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 
                                                 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                                 focus:ring-indigo-500 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl 
                                                 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                                                 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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

export default UserModal;




