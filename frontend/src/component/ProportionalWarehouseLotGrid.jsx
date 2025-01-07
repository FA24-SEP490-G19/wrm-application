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
        label: 'Đã đặt trước',
        icon: Clock
    },
    occupied: {
        color: 'bg-yellow-200 text-yellow-700 border-yellow-100',
        label: 'Đang sử dụng',
        icon: AlertCircle
    }
};

const WarehouseLotGrid = ({ lots, onLotSelect, selectedLot, onRemoveLot, readOnly = true }) => {
    const totalSize = lots.reduce((sum, lot) => sum + parseFloat(lot.size), 0);

    // Sort lots by size and arrange in pairs (2 per row)
    const arrangeLots = () => {
        const sortedLots = [...lots].sort((a, b) => a.id - b.id);
        const rows = Math.ceil(sortedLots.length / 2); // 2 lots per row
        const arranged = Array(rows).fill().map(() => []);

        // Fill rows with pairs of lots
        sortedLots.forEach((lot, index) => {
            const rowIndex = Math.floor(index / 2);
            arranged[rowIndex].push(lot);
        });

        return arranged;
    };

    const arrangedLots = arrangeLots();

    // Render a lot card with consistent styling
    const LotCard = ({ lot }) => {
        const sizePercentage = (parseFloat(lot.size) / totalSize) * 100;
        const isSelected = selectedLot?.id === lot.id;
        const StatusIcon = lot.status ? LOT_STATUS_CONFIG[lot.status.toLowerCase()]?.icon : null;

        // Get status configuration based on lot status
        const statusConfig = lot.status ? LOT_STATUS_CONFIG[lot.status.toLowerCase()] : LOT_STATUS_CONFIG.available;

        return (
            <div
                onClick={() => onLotSelect && onLotSelect(lot)}
                className={`relative p-4 rounded-lg border transition-all cursor-pointer h-40
                      flex flex-col justify-between
                      ${isSelected ? 'ring-2 ring-indigo-500' : ''}
                      ${statusConfig.color} // Apply status-specific colors
                      hover:shadow-md`}
            >
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium text-base truncate">{lot.description || `Lô ${lot.id}`}</p>
                            <p className="text-sm mt-1">{lot.size}m²</p>
                            <p className="text-sm">({sizePercentage.toFixed(1)}% tổng diện tích)</p>
                        </div>
                        {StatusIcon && <StatusIcon className="w-4 h-4" />}
                    </div>
                </div>
                <div className="flex justify-between items-end">
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
        );
    };
    return (
        <div className="relative bg-white p-8 rounded-xl border border-gray-200">
            {/* Warehouse Entry */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                          bg-blue-100 text-blue-700 px-6 py-2 rounded-full text-sm
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

            {/* Main Layout - Grid with 2 columns */}
            <div className="mt-6 space-y-6">
                {arrangedLots.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-2 gap-6">
                        {row.map((lot, colIndex) => (
                            <LotCard
                                key={`${rowIndex}-${colIndex}`}
                                lot={lot}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Exit Signs */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2
                          bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm
                          font-medium border border-red-200 rotate-90">
                Lối thoát hiểm
            </div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2
                          bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm
                          font-medium border border-red-200 rotate-90">
                Lối thoát hiểm
            </div>
        </div>
    );
};

export default WarehouseLotGrid;