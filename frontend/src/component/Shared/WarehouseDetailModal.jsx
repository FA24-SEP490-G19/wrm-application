// WarehouseDetailModal.jsx
import React from 'react';
import { X, MapPin, Square, User, Calendar, Package, Phone, Mail } from 'lucide-react';

const WarehouseDetailModal = ({ isOpen, onClose, warehouse }) => {
    if (!isOpen || !warehouse) return null;

    const statusColors = {
        'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
        'INACTIVE': 'bg-gray-50 text-gray-700 border-gray-100'
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl transform transition-all">
                        {/* Header Image */}
                        <div className="relative h-64 rounded-t-2xl overflow-hidden">
                            <img
                                src="/api/placeholder/800/400"
                                alt={warehouse.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[warehouse.status]}`}>
                                    {warehouse.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{warehouse.name}</h2>
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                                    {warehouse.address}
                                </div>
                            </div>

                            {/* Warehouse Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Square className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Diện tích</p>
                                        <p className="font-medium">{warehouse.size} m²</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <User className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Quản lý kho</p>
                                        <p className="font-medium">{warehouse.warehouse_manager_name || 'Chưa có'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
                                <p className="text-gray-600">{warehouse.description}</p>
                            </div>

                            {/* Contact Information */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a href="tel:1800-6868" className="flex items-center space-x-3 text-gray-600 hover:text-indigo-600">
                                        <Phone className="w-5 h-5" />
                                        <span>1800-6868</span>
                                    </a>
                                    <a href="mailto:support@warehousehub.com" className="flex items-center space-x-3 text-gray-600 hover:text-indigo-600">
                                        <Mail className="w-5 h-5" />
                                        <span>support@warehousehub.com</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WarehouseDetailModal;