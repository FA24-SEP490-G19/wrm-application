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
    // Calculate relative sizes for visualization
    const calculateGridSpan = (size) => {
        switch (parseInt(size)) {
            case 250: return 6;
            case 200: return 5;
            case 150: return 4;
            case 100: return 3;
            case 50: return 2;
            default: return 2;
        }
    };

    // Get size class for central lots
    const getCenterSizeClass = (size) => {
        switch (parseInt(size)) {
            case 100: return 'col-span-2 h-24'; // 100m² takes 2 columns and taller
            case 50: return 'col-span-2 h-15';  // 50m² takes 1 column and shorter
            default: return 'col-span-1 h-16';
        }
    };

    // Sort lots by size
    const sortedLots = [...lots].sort((a, b) => parseInt(b.size) - parseInt(a.size));

    // Arrange lots into sections
    const arrangeLots = () => {
        const leftSide = [];
        const center = [];
        const rightSide = [];

        sortedLots.forEach((lot, index) => {
            const size = parseInt(lot.size);
            if (size >= 150) {
                index % 2 === 0 ? leftSide.push(lot) : rightSide.push(lot);
            } else {
                center.push(lot);
            }
        });

        center.sort((a, b) => parseInt(a.size) - parseInt(b.size));
        center.reverse();

        return { leftSide, center, rightSide };
    };

    const { leftSide, center, rightSide } = arrangeLots();

    const handleLotClick = (lot) => {
        if (onLotSelect) {
            onLotSelect(lot);
        }
    };

    const renderLot = (lot, index, position) => {
        const isSelected = selectedLot?.id === lot.id;
        const StatusIcon = lot.status ? LOT_STATUS_CONFIG[lot.status.toLowerCase()]?.icon : null;

        return (
            <div
                key={`${position}-${index}`}
                onClick={() => handleLotClick(lot)}
                className={`relative bg-green-50 p-3 rounded-lg border border-green-200 hover:shadow-md transition-all cursor-pointer
                    ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                style={{
                    height: position === 'center' ? undefined : `${calculateGridSpan(lot.size) * 2}rem`
                }}
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
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
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

            {/* Warehouse Layout */}
            <div className="mt-4 flex gap-4">
                {/* Left Section */}
                <div className="w-1/4 space-y-4">
                    {leftSide.map((lot, index) => renderLot(lot, index, 'left'))}
                </div>

                {/* Center Section */}
                <div className="flex-1">
                    <div className="grid grid-cols-4 gap-4">
                        {center.map((lot, index) => (
                            <div
                                key={`center-${index}`}
                                className={getCenterSizeClass(lot.size)}
                            >
                                {renderLot(lot, index, 'center')}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Section */}
                <div className="w-1/4 space-y-4">
                    {rightSide.map((lot, index) => renderLot(lot, index, 'right'))}
                </div>
            </div>

            {/* Exit Signs */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 rotate-90">
                Lối thoát hiểm
            </div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 rotate-90">
                Lối thoát hiểm
            </div>
        </div>
    );
};

export default WarehouseLotGrid;