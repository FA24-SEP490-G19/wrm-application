import React from 'react';
import { Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const LOT_STATUS_CONFIG = {
    available: {
        color: 'bg-green-300 text-green-700 border-green-500',
        label: 'Có sẵn',
        icon: CheckCircle
    },
    reserved: {
        color: 'bg-blue-300 text-blue-700 border-blue-100',
        label: 'Đã thuê',
        icon: Clock
    },
    occupied: {
        color: 'bg-yellow-200 text-yellow-700 border-yellow-100',
        label: 'Bảo trì',
        icon: AlertCircle
    }
};

const WarehouseLotGrid = ({ lots, onLotSelect, selectedLot, onRemoveLot, readOnly = true }) => {
    const totalSize = lots.reduce((sum, lot) => sum + parseFloat(lot.size), 0);

    // Sort lots by size and arrange horizontally
    const arrangeLots = () => {
        const sortedLots = [...lots].sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
        const rows = Math.ceil(sortedLots.length / 3); // 3 lots per row
        const arranged = Array(rows).fill().map(() => []);

        sortedLots.forEach((lot, index) => {
            const rowIndex = Math.floor(index / 3);
            arranged[rowIndex].push(lot);
        });

        return arranged;
    };

    const arrangedLots = arrangeLots();

    const renderLot = (lot, rowIndex, colIndex) => {
        const isSelected = selectedLot?.id === lot.id;
        const StatusIcon = lot.status ? LOT_STATUS_CONFIG[lot.status.toLowerCase()]?.icon : null;
        const sizePercentage = (parseFloat(lot.size) / totalSize) * 100;

        return (
            <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onLotSelect && onLotSelect(lot)}
                className={`relative bg-green-50 p-3 rounded-lg border border-green-200 
                           hover:shadow-md transition-all cursor-pointer h-32
                           ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
            >
                <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium text-sm">{lot.description || `Lô ${lot.id}`}</p>
                            <p className="text-xs text-gray-500">{lot.size}m²</p>
                        </div>
                        {StatusIcon && <StatusIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-medium text-green-700">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(lot.price)}/tháng
                        </span>
                        {!readOnly && onRemoveLot && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveLot(lots.indexOf(lot));
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative bg-white p-8 rounded-xl border border-gray-200">
            {/* Warehouse Entry */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                          bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm
                          font-medium border border-blue-200">
                Lối vào kho
            </div>

            {/* Status Legend */}
            {!readOnly && (
                <div className="flex gap-6 mb-4">
                    {Object.entries(LOT_STATUS_CONFIG).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                            <div className={`w-3 h-3 rounded-sm ${value.color} mr-2 ring-1`} />
                            <span className="text-sm font-medium text-gray-700">{value.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Layout - Grid with horizontal fill */}
            <div className="mt-4 space-y-4 min-h-[400px]">
                {arrangedLots.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-3 gap-4">
                        {row.map((lot, colIndex) => renderLot(lot, rowIndex, colIndex))}
                    </div>
                ))}
            </div>

            {/* Exit Signs */}
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
        </div>
    );
};

export default WarehouseLotGrid;