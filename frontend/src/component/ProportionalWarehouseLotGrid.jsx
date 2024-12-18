import React from 'react';
import { Package, CheckCircle, Clock, AlertCircle, ShieldCheck } from 'lucide-react';

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

const calculateGridSize = (size) => {
    // Base size is 20m²
    const baseSize = 20;
    const ratio = size / baseSize;
    // Calculate width and height maintaining roughly square aspect ratio
    const width = Math.max(2, Math.round(Math.sqrt(ratio) * 2));
    const height = Math.max(2, Math.round(Math.sqrt(ratio) * 2));
    return { width, height };
};

const LotButton = ({ lot, onClick, isSelected, style }) => {
    const StatusIcon = LOT_STATUS_CONFIG[lot.status]?.icon;

    return (
        <button
            onClick={() => onClick(lot)}
            style={style}
            className={`
                p-3 rounded-xl text-left transition-all duration-200
                ${LOT_STATUS_CONFIG[lot.status]?.color}
                ${lot.status === 'available' ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                ${isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : 'ring-1'}
                relative group bg-white
            `}
        >
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">Lô {lot.id}</span>
                    {StatusIcon && <StatusIcon className="w-4 h-4"/>}
                </div>
                <div>
                    <p className="text-xs font-medium">{lot.size.toLocaleString()}m²</p>
                    <p className="text-xs font-bold mt-1 text-indigo-600">
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(lot.price)}
                    </p>
                </div>
            </div>

            {lot.status === 'available' && (
                <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"/>
            )}
        </button>
    );
};

const ProportionalWarehouseLotGrid = ({ lots, onLotSelect, selectedLot }) => {
    // Sort lots by size in descending order
    const sortedLots = [...lots].sort((a, b) => b.size - a.size);

    return (
        <div className="p-6">
            {/* Legend and Status */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex gap-6">
                    {Object.entries(LOT_STATUS_CONFIG).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                            <div className={`w-3 h-3 rounded-sm ${value.color} mr-2 ring-1`}/>
                            <span className="text-sm font-medium text-gray-700">{value.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Layout Visualization */}
            <div className="relative max-w-5xl mx-auto bg-white p-6 rounded-xl border border-gray-200">
                {/* Entry Point with Security Room */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
                        Cửa chính / Khu vực bốc dỡ hàng
                    </div>
                </div>

                {/* Security Room */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-gray-100 rounded-lg border-2 border-gray-300 p-2 flex flex-col items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600 text-center">Phòng bảo vệ</span>
                </div>

                {/* Emergency Exits */}
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 rotate-90">
                    Lối thoát hiểm
                </div>
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 rotate-90">
                    Lối thoát hiểm
                </div>

                {/* Main Layout Grid */}
                <div className="grid grid-cols-12 gap-4 mt-12">
                    {sortedLots.map((lot) => {
                        const { width, height } = calculateGridSize(lot.size);
                        return (
                            <div
                                key={lot.id}
                                className={`col-span-${width} row-span-${height}`}
                                style={{
                                    gridColumn: `span ${Math.min(width, 12)}`,
                                    gridRow: `span ${height}`
                                }}
                            >
                                <LotButton
                                    lot={lot}
                                    onClick={onLotSelect}
                                    isSelected={selectedLot?.id === lot.id}
                                    style={{ width: '100%', height: '100%', minHeight: '120px' }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProportionalWarehouseLotGrid;