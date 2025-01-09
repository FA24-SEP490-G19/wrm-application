// Template for [Feature]Page.jsx
import React, {useState, useEffect} from 'react';
import {
    Search, Filter, Plus, Download,
    Mail, Phone, Building2, ArrowUpDown,
    Loader, Edit2, Trash2, Lock, CheckCircle, EyeOff, Eye, Check, X
} from 'lucide-react';


import {changePassword} from "../../service/Authenticate.js";
import CRMLayout from "./Crm.jsx";

const FeatureList = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });


    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const passwordRequirements = [
        { id: 'length', label: 'Ít nhất 8 ký tự', test: (pass) => pass.length >= 8 },
        { id: 'uppercase', label: 'Một chữ cái viết hoa', test: (pass) => /[A-Z]/.test(pass) },
        { id: 'lowercase', label: 'Một chữ cái viết thường', test: (pass) => /[a-z]/.test(pass) },
        { id: 'number', label: 'Một chữ số', test: (pass) => /\d/.test(pass) },
        { id: 'special', label: 'Một ký tự đặc biệt', test: (pass) => /[!@#$%^&*]/.test(pass) }
    ];
    const validatePassword = (password) => {
        // Check all requirements are met
        const isValid = passwordRequirements.every(req => req.test(password));
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear previous errors
        setError('');
        setSuccess('');

        // If it's the new password field, validate in real-time
        if (name === 'newPassword') {
            if (value === formData.oldPassword) {
                setErrors(prev => ({
                    ...prev,
                    newPassword: 'Mật khẩu mới phải khác mật khẩu hiện tại'
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    newPassword: ''
                }));
            }
        }

        // If it's the confirm password field, check matching
        if (name === 'confirmPassword') {
            if (value !== formData.newPassword) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Mật khẩu xác nhận không khớp'
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: ''
                }));
            }
        }
    };
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate all required fields
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        // Validate new password meets requirements
        if (!validatePassword(formData.newPassword)) {
            setError('Mật khẩu mới không đáp ứng các yêu cầu bảo mật');
            return;
        }

        // Validate confirm password matches
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        // Validate new password is different from old password
        if (formData.oldPassword === formData.newPassword) {
            setError('Mật khẩu mới phải khác mật khẩu hiện tại');
            return;
        }

        try {
            setIsLoading(true);
            const { oldPassword, newPassword, confirmPassword } = formData;
            await changePassword({ oldPassword, newPassword, confirmPassword });
            setSuccess("Đổi mật khẩu thành công");

            // Clear form after successful change
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || 'Mật khẩu không đúng');
            } else if (err.request) {
                setError('Máy chủ không có phản hồi, vui lòng thử lại');
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại.');
            }
            console.error('Password change error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition duration-300">
                            <div className="flex items-center mb-6">
                                <div className="bg-indigo-50 rounded-xl p-3">
                                    <Lock className="h-6 w-6 text-indigo-600"/>
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Đổi Mật Khẩu</h2>
                                    <p className="text-gray-600 mt-1">Cập nhật mật khẩu tài khoản của bạn</p>
                                </div>
                            </div>

                            {error && <p className="text-red-500 mb-4">{error}</p>}
                            {success && (
                                <div
                                    className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center"
                                    role="alert">
                                    <CheckCircle className="w-5 h-5 mr-2"/>
                                    <span>{success}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mật khẩu hiện tại
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.oldPassword ? 'text' : 'password'}
                                            name="oldPassword"
                                            value={formData.oldPassword}
                                            onChange={handleChange}
                                            placeholder="Nhập mật khẩu hiện tại"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('oldPassword')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.oldPassword ? <EyeOff className="w-5 h-5"/> :
                                                <Eye className="w-5 h-5"/>}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.newPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Nhập mật khẩu mới"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.newPassword ? <EyeOff className="w-5 h-5"/> :
                                                <Eye className="w-5 h-5"/>}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Xác nhận mật khẩu mới"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5"/> :
                                                <Eye className="w-5 h-5"/>}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition duration-300"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"/>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Đổi mật khẩu'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Requirements */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition duration-300">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu mật khẩu</h3>
                            <div className="space-y-3">
                                {passwordRequirements.map(requirement => (
                                    <div key={requirement.id}
                                         className={`flex items-center p-3 rounded-xl ${
                                             requirement.test(formData.newPassword)
                                                 ? 'bg-green-50'
                                                 : 'bg-gray-50'
                                         }`}>
                                        {requirement.test(formData.newPassword) ? (
                                            <Check className="w-5 h-5 text-green-500 mr-3"/>
                                        ) : (
                                            <X className="w-5 h-5 text-gray-400 mr-3"/>
                                        )}
                                        <span className={`text-sm ${
                                            requirement.test(formData.newPassword)
                                                ? 'text-green-700'
                                                : 'text-gray-600'
                                        }`}>
                                            {requirement.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Wrap with CRMLayout
const ChangePassForNotUser = () => (
    <CRMLayout>
        <FeatureList/>
    </CRMLayout>
);

export default ChangePassForNotUser;