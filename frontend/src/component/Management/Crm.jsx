import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    Building2, Menu, Users, DollarSign, Search,
    BarChart2, MessageSquare, Calendar, Settings,
    Home, UserPlus, FileText, Bell, ChevronDown,
    Layout, Package, CheckCircle, Phone, Mail,
    Plus, Filter, MoreHorizontal, ArrowRight, X, ArrowLeft, CreditCard, ClipboardList, Key, Warehouse
} from 'lucide-react';
import {useAuth} from "../../context/AuthContext.jsx";
import logo from "../../assets/logo.png";
import {useNavigate} from "react-router-dom";

// Layout Component
const CRMLayout = ({ children }) => {
    const [collapsedSidebar, setCollapsedSidebar] = useState(false);
    const location = useLocation();
    const { logOut } = useAuth();
    const { customer } = useAuth();
    const navigate = useNavigate();

    const navigation = [
        // { name: 'Dashboard', icon: Home, path: '/dashboard', roles: ['ROLE_ADMIN', 'MANAGER'] },
        { name: 'Thống kê', icon: BarChart2, path: '/statistical', roles: ['ROLE_ADMIN'] },
        { name: 'Thống kê', icon: BarChart2, path: '/SaleDashboard', roles: ['ROLE_SALES'] },
        { name: 'Thống kê', icon: BarChart2, path: '/ManagerDashboard', roles: ['ROLE_MANAGER'] },
        { name: 'Quản lý kho', icon: Warehouse, path: '/kho', roles: ['ROLE_ADMIN'] },
        { name: 'Quản lý cuộc hẹn', icon: Calendar, path: '/appointment', roles: ['ROLE_ADMIN', 'ROLE_SALES'] },
        { name: 'Quản lý cho thuê', icon: Key, path: '/rental', roles: ['ROLE_ADMIN', 'ROLE_SALES'] },
        { name: 'Quản lý yêu cầu', icon: ClipboardList, path: '/request', roles: ['ROLE_ADMIN', 'ROLE_SALES', 'ROLE_MANAGER'] },
        // { name: 'Quản lý phản hồi', icon: MessageSquare, path: '/feedback', roles: ['ROLE_ADMIN'] },
        { name: 'Quản lý người dùng', icon: Users, path: '/user', roles: ['ROLE_ADMIN'] },
        { name: 'Quản lý thanh toán', icon: CreditCard, path: '/payment', roles: ['ROLE_SALES', 'ROLE_ADMIN'] },
        { name: 'Cuộc hẹn sắp tới', icon: Calendar, path: '/upcoming', roles: ['ROLE_MANAGER'] },
        { name: 'Hợp đồng sắp hết hạn', icon: Key, path: '/expired', roles: ['ROLE_MANAGER'] },



    ];

    const filteredNavigation = navigation.filter(
        (item) => !item.roles || item.roles.includes(customer?.role)
    );

    return (
        <div className="h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`${
                collapsedSidebar ? 'w-20' : 'w-64'
            } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
                {/* Logo */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
                    {!collapsedSidebar && (
                        <Link to="/home" className="flex items-center">
                            <img src={logo} className="h-11 w-11 text-indigo-600" alt="Logo"/>
                            <span className="ml-2 font-bold text-xl">Quản lý</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setCollapsedSidebar(!collapsedSidebar)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="h-5 w-5 text-gray-500"/>
                    </button>
                </div>

                {/* Navigation */}
                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {filteredNavigation.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`w-full flex items-center ${collapsedSidebar ? 'justify-center' : 'justify-start'} px-3 py-2 rounded-xl transition-colors ${
                                location.pathname === item.path
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${collapsedSidebar ? '' : 'mr-3'}`} />
                            {!collapsedSidebar && (
                                <span className="font-medium">{item.name}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Menu */}
                <div className="p-4 border-t border-gray-200">
                    <button className="w-full flex items-center px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <img
                            src="https://docs.cts.vn/user_avatar.png"
                            alt="User"
                            className="w-8 h-8 rounded-full"
                        />
                        {!collapsedSidebar && (
                            <>
                                <div className="ml-3 text-left">
                                    <p className="text-sm font-medium">{customer?.username}</p>
                                </div>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
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
                    <div className="flex items-center space-x-4">
                        <div>
                            <button
                                onClick={() => navigate('/profileNotUser')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                👨‍💼Thông tin cá nhân
                            </button>
                        </div>
                        <div>
                            <button
                                onClick={() => navigate('/resetForNotUser')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                🔄️Đổi mật khẩu
                            </button>
                        </div>
                        <div>
                            <button
                                onClick={logOut}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-900 transition">
                                🔙Đăng xuất
                            </button>
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default CRMLayout;