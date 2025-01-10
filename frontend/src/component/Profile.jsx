// components/Profile/ProfileCRUD.jsx
import React, { useState, useEffect } from 'react';
import {
    User, Building2, Menu, Phone, Mail, MapPin,
    Edit2, Save, X, Eye, EyeOff, AlertCircle, Loader, ArrowLeft, LayoutDashboard, ChevronDown, KeyRound, LogOut
} from 'lucide-react';
import {useAuth} from "../context/AuthContext.jsx";
import {getProfile, updateProfile} from "../service/Authenticate.js";
import {Toast} from "./Shared/Toast.jsx";
import {useToast} from "../context/ToastProvider.jsx";
import {Link, useNavigate} from 'react-router-dom';
import logo from "../assets/logo.png";


const ProfileCRUD = () => {
    const { showToast } = useToast();
    const [editMode, setEditMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const { customer,logOut } = useAuth();
    const navigate = useNavigate();

    const initialFormState = {
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        gender: '',
        status: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [originalData, setOriginalData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const email = customer?.username

    const genderOptions = [
        { value: 'MALE', label: 'Nam' },
        { value: 'FEMALE', label: 'Nữ' },
    ];

    const statusOptions = [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' },
        { value: 'PENDING', label: 'Đang chờ duyệt' }
    ];

    useEffect(() => {
        if (email) {
            fetchProfileData();
        }
    }, [email]);

    const fetchProfileData = async () => {
        if (!email) return; // Return early if no email

        try {
            setLoading(true);
            const response = await getProfile(email);
            const profileData = response.data;

            const formattedData = {
                fullName: profileData.fullName || '',
                email: profileData.email || '',
                phoneNumber: profileData.phoneNumber || '',
                address: profileData.address || '',
                gender: profileData.gender || '',
                status: profileData.status || ''
            };

            setFormData(formattedData);
            setOriginalData(formattedData);
            setError(null);
        } catch (err) {
            setError('Error loading profile data. Please try again.');
            showToast('Failed to load profile data', 'error');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }


        if (!formData.fullName) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast('Vui lòng nhập đầy đủ các trường thông tin', 'error');
            return;
        }

        try {
            setSaving(true);
            const apiData = {
                ...formData,
                fullname: formData.fullName,
                phone_number: formData.phoneNumber,// Transform back to snake_case
            };
            await updateProfile(apiData);
            setOriginalData(formData);
            setEditMode(false);
            showToast('Profile updated successfully');
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            showToast('Failed to update profile', 'error');
            console.error('Error updating profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const handleCancel = () => {
        setFormData(originalData);
        setEditMode(false);
        setErrors({});
    };

    const renderField = (label, name, value, type = 'text', options = null) => {
        const commonClasses = "w-full px-4 py-3 rounded-xl border transition-colors";
        const inputClasses = `${commonClasses} ${
            errors[name]
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-indigo-500'
        } focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`;

        if (!editMode) {
            return (
                <div className="bg-gray-50 px-4 py-3 rounded-xl">
                    {type === 'select' ? options.find(opt => opt.value === value)?.label : value }
                </div>
            );
        }

        if (type === 'select') {
            return (
                <select
                    name={name}
                    value={value}
                    onChange={handleChange}
                    className={inputClasses}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }



        return (
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                className={inputClasses}
                placeholder={`Enter ${label}`}
            />
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="mt-2 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Toast Notification */}
            {toast.show && <Toast message={toast.message} type={toast.type}/>}

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center">
                            <img src={logo} alt="Logo" className="h-11 w-11"/>
                            <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
                                Warehouse Hub
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-4">
                            {customer?.role !== "ROLE_USER" && (
                                <a
                                    href="/kho"
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                         hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2"/>
                                    DashBoard
                                </a>
                            )}

                            {customer?.role === "ROLE_USER" ? (
                                <div className="flex items-center space-x-4">
                                    {/* Profile Dropdown */}
                                    {/*<div><a*/}
                                    {/*    href="/landing"*/}
                                    {/*    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700*/}
                                    {/*     hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"*/}
                                    {/*>*/}
                                    {/*    Landing Page*/}
                                    {/*</a></div>*/}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                            className="flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600
                                                 to-violet-600 text-white rounded-full hover:shadow-lg
                                                 hover:scale-105 transition duration-300"
                                        >
                                            <User className="w-4 h-4 mr-2"/>
                                            Xin chào {customer?.username}
                                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 
                                            ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isProfileDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg
                                                      border border-gray-100 py-1 animate-in fade-in slide-in-from-top-5">
                                                <a
                                                    href="/profile"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                                >
                                                    Thông tin cá nhân
                                                </a>

                                                <a
                                                    href="/RentalByUser"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                                >
                                                    Đơn thuê kho
                                                </a>
                                                <a
                                                    href="/history"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                                >
                                                    Lịch sử thuê kho
                                                </a>
                                                <a
                                                    href="/MyAppoinment"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                                >
                                                    Cuộc hẹn
                                                </a>
                                                <a
                                                    href="/MyRequest"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                                >
                                                    Yêu cầu
                                                </a>
                                                <a
                                                    href="/MyFeedBack"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                                >
                                                    Đánh giá
                                                </a>
                                                <a
                                                    href="/payment_user"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                                >
                                                    Thanh toán
                                                </a>
                                                <a
                                                    href="/reset"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 transition-colors"
                                                >
                                                    Đổi mật khẩu
                                                </a>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <button
                                                    onClick={logOut}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600
                                                         hover:bg-red-50 transition-colors"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={logOut}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                         hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-2"/>
                                    Đăng xuất
                                </button>
                            )}
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6 text-gray-700"/>
                            ) : (
                                <Menu className="h-6 w-6 text-gray-700"/>
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top">
                            <div className="space-y-2">
                                {customer?.role !== "ROLE_USER" && (
                                    <a
                                        href="/kho"
                                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                             hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <LayoutDashboard className="w-4 h-4 mr-2"/>
                                        DashBoard
                                    </a>
                                )}

                                {customer?.role === "ROLE_USER" && (
                                    <>
                                        <a
                                            href="/profile"
                                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                                 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <User className="w-4 h-4 mr-2"/>
                                            Thông tin cá nhân
                                        </a>
                                        <a
                                            href="/reset"
                                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700
                                                 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <KeyRound className="w-4 h-4 mr-2"/>
                                            Đổi mật khẩu
                                        </a>
                                    </>
                                )}

                                <button
                                    onClick={logOut}
                                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600
                                         hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-2"/>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="text-left flex items-center space-x-2">
                    {/* Optional content on the left */}
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2"/>
                        Quay về trang home
                    </button>
                </div>
                {error && (
                    <div className="mb-4 p-4 bg-red-50 rounded-xl text-red-600 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2"/>
                        {error}
                        <button
                            onClick={fetchProfileData}
                            className="ml-auto text-sm underline hover:text-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
                    {/* Profile Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="bg-indigo-50 rounded-xl p-3">
                                    <User className="h-6 w-6 text-indigo-600"/>
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
                                    <p className="text-gray-600">Quản lý thông tin của bạn</p>
                                </div>
                            </div>
                            {!editMode ? (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition duration-300"
                                >
                                    <Edit2 className="w-4 h-4 mr-2"/>
                                    Sửa thông tin
                                </button>
                            ) : (
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition duration-300"
                                >
                                    <X className="w-4 h-4 mr-2"/>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên đầy đủ
                                </label>
                                {renderField('Full Name', 'fullName', formData.fullName)}
                                {errors.fullName && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1"/>
                                        {errors.fullName}
                                    </p>
                                )}
                            </div>

                            {/*/!* Email *!/*/}
                            {/*<div>*/}
                            {/*    <label className="block text-sm font-medium text-gray-700 mb-2">*/}
                            {/*        Email*/}
                            {/*    </label>*/}
                            {/*    {renderField('Email', 'email', formData.email, 'email')}*/}
                            {/*    {errors.email && (*/}
                            {/*        <p className="mt-2 text-sm text-red-600 flex items-center">*/}
                            {/*            <AlertCircle className="w-4 h-4 mr-1"/>*/}
                            {/*            {errors.email}*/}
                            {/*        </p>*/}
                            {/*    )}*/}
                            {/*</div>*/}

                            {/* Password fields only shown in edit mode */}
                            {editMode && (
                                <>

                                </>
                            )}

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                {renderField('Phone Number', 'phoneNumber', formData.phoneNumber, 'tel')}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                {renderField('Address', 'address', formData.address)}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giới tính
                                </label>
                                {renderField('Gender', 'gender', formData.gender, 'select', genderOptions)}
                            </div>

                            {/*/!* Status *!/*/}
                            {/*<div>*/}
                            {/*    <label className="block text-sm font-medium text-gray-700 mb-2">*/}
                            {/*        Trạng thái*/}
                            {/*    </label>*/}
                            {/*    {renderField('Status', 'status', formData.status, 'select', statusOptions)}*/}
                            {/*</div>*/}
                        </div>

                        {/* Form Actions */}
                        {editMode && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition duration-300"
                                >
                                    <Save className="w-4 h-4 mr-2"/>
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileCRUD;