// RevenueCharts.jsx
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const RevenueCharts = ({ monthlyRevenue, quarterlyRevenue, yearlyRevenue }) => {
    const [viewType, setViewType] = useState('monthly');

    const transformedData = useMemo(() => {
        const ensureArray = (data) => Array.isArray(data) ? data : [];

        switch (viewType) {
            case 'monthly':
                return ensureArray(monthlyRevenue).map(item => ({
                    period: `Tháng ${item?.period || item?.month || 'N/A'}`,
                    revenue: Number(item?.revenue || item?.amount || 0)
                }));
            case 'quarterly':
                return ensureArray(quarterlyRevenue).map(item => ({
                    period: `Quý ${item?.period || item?.quarter || 'N/A'}`,
                    revenue: Number(item?.revenue || item?.amount || 0)
                }));
            case 'yearly':
                return ensureArray(yearlyRevenue).map(item => ({
                    period: `Năm ${item?.period || item?.year || 'N/A'}`,
                    revenue: Number(item?.revenue || item?.amount || 0)
                }));
            default:
                return [];
        }
    }, [viewType, monthlyRevenue, quarterlyRevenue, yearlyRevenue]);

    const viewTypeLabels = {
        monthly: 'Theo Tháng',
        quarterly: 'Theo Quý',
        yearly: 'Theo Năm'
    };

    // Check if we have any valid data to display
    const hasData = transformedData.length > 0;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-row items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tổng Quan Doanh Thu</h2>
                <div className="space-x-2">
                    {Object.keys(viewTypeLabels).map((type) => (
                        <button
                            key={type}
                            className={`px-4 py-2 rounded transition-colors ${
                                viewType === type
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={() => setViewType(type)}
                        >
                            {viewTypeLabels[type]}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-96">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={transformedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => `${value.toLocaleString()} VNĐ`}
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    padding: '8px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                name="Doanh Thu"
                                dataKey="revenue"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        Không có dữ liệu
                    </div>
                )}
            </div>
        </div>
    );
};
