import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    Building2, Menu, Users, DollarSign, Search,
    BarChart2, MessageSquare, Calendar, Settings,
    Home, UserPlus, FileText, Bell, ChevronDown,
    Layout, Package, CheckCircle, Phone, Mail,
    Plus, Filter, MoreHorizontal, ArrowRight, X
} from 'lucide-react';

// Layout Component
const CRMLayout = ({ children }) => {
    const [collapsedSidebar, setCollapsedSidebar] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Customers', icon: Users, path: '/user' },
        { name: 'Deals', icon: DollarSign, path: '/deals' },
        { name: 'Tasks', icon: CheckCircle, path: '/tasks' },
        { name: 'Calendar', icon: Calendar, path: '/calendar' },
        { name: 'Messages', icon: MessageSquare, path: '/messages' },
        { name: 'Documents', icon: FileText, path: '/documents' },
        { name: 'Reports', icon: BarChart2, path: '/reports' },
    ];

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
                            <Building2 className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 font-bold text-xl">CRM Hub</span>
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
                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`w-full flex items-center ${
                                collapsedSidebar ? 'justify-center' : 'justify-start'
                            } px-3 py-2 rounded-xl transition-colors ${
                                location.pathname === item.path
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${
                                collapsedSidebar ? '' : 'mr-3'
                            }`} />
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
                            src="/api/placeholder/32/32"
                            alt="User"
                            className="w-8 h-8 rounded-full"
                        />
                        {!collapsedSidebar && (
                            <>
                                <div className="ml-3 text-left">
                                    <p className="text-sm font-medium">John Doe</p>
                                    <p className="text-xs text-gray-500">Admin</p>
                                </div>
                                <ChevronDown className="w-4 h-4 ml-auto text-gray-500" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                    <div className="flex items-center flex-1">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-gray-100 rounded-xl">
                            <Bell className="w-5 h-5 text-gray-500" />
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                            <Plus className="w-5 h-5" />
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