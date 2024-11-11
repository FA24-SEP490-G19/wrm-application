import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Check, X, Building2, Menu } from 'lucide-react';

const ChangePassword = () => {
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

    const passwordRequirements = [
        { id: 'length', label: 'At least 8 characters', test: (pass) => pass.length >= 8 },
        { id: 'uppercase', label: 'One uppercase letter', test: (pass) => /[A-Z]/.test(pass) },
        { id: 'lowercase', label: 'One lowercase letter', test: (pass) => /[a-z]/.test(pass) },
        { id: 'number', label: 'One number', test: (pass) => /\d/.test(pass) },
        { id: 'special', label: 'One special character', test: (pass) => /[!@#$%^&*]/.test(pass) }
    ];

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

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Form validation logic here
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Building2 className="h-8 w-8 text-indigo-600" />
                            <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
                                Warehouse Hub
                            </h1>
                        </div>
                        <div className="hidden md:flex space-x-6">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                Dashboard
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                Settings
                            </button>
                            <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition duration-300">
                                Support
                            </button>
                        </div>
                        <button className="md:hidden">
                            <Menu className="h-6 w-6 text-gray-700" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition duration-300">
                            <div className="flex items-center mb-6">
                                <div className="bg-indigo-50 rounded-xl p-3">
                                    <Lock className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                                    <p className="text-gray-600 mt-1">Update your account password</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.oldPassword ? 'text' : 'password'}
                                            name="oldPassword"
                                            value={formData.oldPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('oldPassword')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.oldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.newPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition duration-300"
                                >
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Requirements */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition duration-300">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Requirements</h3>
                            <div className="space-y-3">
                                {passwordRequirements.map(requirement => (
                                    <div key={requirement.id}
                                         className={`flex items-center p-3 rounded-xl ${
                                             requirement.test(formData.newPassword)
                                                 ? 'bg-green-50'
                                                 : 'bg-gray-50'
                                         }`}>
                                        {requirement.test(formData.newPassword) ? (
                                            <Check className="w-5 h-5 text-green-500 mr-3" />
                                        ) : (
                                            <X className="w-5 h-5 text-gray-400 mr-3" />
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

export default ChangePassword;