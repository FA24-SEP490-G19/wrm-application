import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    Building2, Menu, Users, DollarSign, Search,
    BarChart2, MessageSquare, Calendar, Settings,
    Home, UserPlus, FileText, Bell, ChevronDown,
    Layout, Package, CheckCircle, Phone, Mail,
    Plus, Filter, MoreHorizontal, ArrowRight, X
} from 'lucide-react';
import {useAuth} from "../../context/AuthContext.jsx";
import logo from "../../assets/logo.png";

// Layout Component
const CRMLayout = ({ children }) => {
    const [collapsedSidebar, setCollapsedSidebar] = useState(false);
    const location = useLocation();
    const { logOut } = useAuth();
    const { customer } = useAuth();

    const navigation = [
        // { name: 'Dashboard', icon: Home, path: '/dashboard', roles: ['ROLE_ADMIN', 'MANAGER'] },
        { name: 'Quản lí người dùng', icon: Users, path: '/user', roles: ['ROLE_ADMIN'] },
        { name: 'Quản lí kho', icon: DollarSign, path: '/kho', roles: ['ROLE_SALES', 'ROLE_ADMIN'] },
        { name: 'Quản lí cuộc hẹn', icon: Calendar, path: '/appointment', roles: ['ROLE_ADMIN','ROLE_SALES'] },
        { name: 'Quản lí lot', icon: Package, path: '/lot', roles: ['ROLE_ADMIN'] }
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
                        <div className="flex items-center">
                            <img src={logo} className="h-11 w-11 text-indigo-600"/>
                            <span className="ml-2 font-bold text-xl">Quản lý</span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsedSidebar(!collapsedSidebar)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="h-5 w-5 text-gray-500" />
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

                    <div className="flex items-end space-x-4">
                        <button
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                            <a href="/home">Home</a>
                        </button>
                        <button
                            onClick={logOut}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                            Đăng xuất
                        </button>
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

export  default  CRMLayout;