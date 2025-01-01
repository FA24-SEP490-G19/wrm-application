import React from 'react';
import { Package, Trash2 } from 'lucide-react';

const EditModeLotGrid = ({ lots }) => {
    const LOT_STATUS_CONFIG = {
        AVAILABLE: {
            color: 'bg-green-100 text-green-700 border-green-200',
            label: 'Có sẵn'
        },
        OCCUPIED: {
            color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            label: 'Đã thuê'
        },
        MAINTENANCE: {
            color: 'bg-gray-100 text-gray-700 border-gray-200',
            label: 'Bảo trì'
        }
    };

    // Sort lots by size and arrange them
    const arrangeLots = () => {
        const sortedLots = [...lots].sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
        const rows = Math.ceil(sortedLots.length / 4); // 4 lots per row
        const arranged = Array(rows).fill().map(() => []);

        sortedLots.forEach((lot, index) => {
            const rowIndex = Math.floor(index / 4);
            arranged[rowIndex].push(lot);
        });

        return arranged;
    };

    const arrangedLots = arrangeLots();
    const totalSize = lots.reduce((sum, lot) => sum + parseFloat(lot.size), 0);

    const LotCard = ({ lot }) => {
        return (
            <div className={`
                relative p-4 rounded-xl border transition-all
                ${LOT_STATUS_CONFIG[lot.status]?.color || 'bg-gray-50 text-gray-700 border-gray-200'}
            `}>
                <div className="space-y-2">
                    <div className="flex justify-between items-start">
                        <span className="font-medium">Lô {lot.id}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                            {LOT_STATUS_CONFIG[lot.status]?.label || 'N/A'}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm">{lot.description || `Lô ${lot.id}`}</p>
                        <p className="text-xs">Diện tích: {lot.size}m²</p>
                        <p className="text-xs font-medium">
                            Giá: {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(lot.price)}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Warehouse Layout Info */}
            <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-blue-900 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Thông tin bố trí kho
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                    <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-3">
                            <span className="text-blue-700">1</span>
                        </div>
                        <p>Tổng diện tích: {totalSize}m²</p>
                    </div>
                    <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-3">
                            <span className="text-blue-700">2</span>
                        </div>
                        <p>Số lượng lô: {lots.length}</p>
                    </div>
                </div>
            </div>

            {/* Status Legend */}
            <div className="flex gap-4">
                {Object.entries(LOT_STATUS_CONFIG).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${value.color.split(' ')[0]}`} />
                        <span className="text-sm text-gray-600">{value.label}</span>
                    </div>
                ))}
            </div>

            {/* Lots Grid */}
            <div className="relative bg-white p-8 rounded-xl border border-gray-200">
                {/* Entry/Exit Points */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                               bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm
                               font-medium border border-green-200">
                    Cửa chính / Khu vực bốc dỡ hàng
                </div>

                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2
                               bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs
                               font-medium border border-red-200 rotate-90">
                    Lối thoát hiểm
                </div>

                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2
                               bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs
                               font-medium border border-red-200 rotate-90">
                    Lối thoát hiểm
                </div>

                {/* Grid Layout */}
                <div className="grid gap-6">
                    {arrangedLots.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-4 gap-4">
                            {row.map((lot) => (
                                <LotCard key={lot.id} lot={lot} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading Area Indicator */}
            <div className="flex justify-center mt-4">
                <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg
                               text-sm font-medium border border-yellow-200">
                    Khu vực bốc dỡ hàng
                </div>
            </div>
        </div>
    );
};

export default EditModeLotGrid;