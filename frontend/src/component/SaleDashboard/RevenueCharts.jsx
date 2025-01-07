import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatCurrency = (value) => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)} tỷ`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)} triệu`;
    }
    return `${value.toLocaleString()} VNĐ`;
};

const RevenueCharts = ({ monthlyStats, quarterlyStats, yearlyStats }) => {
    const [viewType, setViewType] = useState('monthly');

    const transformedData = useMemo(() => {
        const ensureArray = (data) => Array.isArray(data) ? data : [];

        switch (viewType) {
            case 'monthly': {
                // Create an array for all 12 months
                const allMonths = Array.from({ length: 12 }, (_, i) => ({
                    period: `Tháng ${i + 1}`,
                    revenue: 0
                }));

                // Map the actual data to the corresponding months
                const dataMap = new Map(
                    ensureArray(monthlyStats).map(item => [
                        Number(item?.period || 0),
                        Number(item?.revenue || 0)
                    ])
                );

                // Fill in the actual revenue data where it exists
                return allMonths.map((month, index) => ({
                    period: month.period,
                    revenue: dataMap.get(index + 1) || 0
                }));
            }
            case 'quarterly': {
                // Create an array for all 4 quarters
                const allQuarters = Array.from({ length: 4 }, (_, i) => ({
                    period: `Quý ${i + 1}`,
                    revenue: 0
                }));

                const dataMap = new Map(
                    ensureArray(quarterlyStats).map(item => [
                        Number(item?.period || 0),
                        Number(item?.revenue || 0)
                    ])
                );

                return allQuarters.map((quarter, index) => ({
                    period: quarter.period,
                    revenue: dataMap.get(index + 1) || 0
                }));
            }
            case 'yearly': {
                const currentYear = new Date().getFullYear();
                const yearsToShow = 5; // Show last 5 years
                const allYears = Array.from({ length: yearsToShow }, (_, i) => ({
                    period: `Năm ${currentYear - (yearsToShow - 1) + i}`,
                    revenue: 0
                }));

                const dataMap = new Map(
                    ensureArray(yearlyStats).map(item => [
                        Number(item?.year || 0),
                        Number(item?.revenue || 0)
                    ])
                );

                return allYears.map(yearItem => {
                    const year = parseInt(yearItem.period.split(' ')[1]);
                    return {
                        period: yearItem.period,
                        revenue: dataMap.get(year) || 0
                    };
                });
            }
            default:
                return [];
        }
    }, [viewType, monthlyStats, quarterlyStats, yearlyStats]);

    const viewTypeLabels = {
        monthly: 'Theo Tháng',
        quarterly: 'Theo Quý',
        yearly: 'Theo Năm'
    };

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
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="period"
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                width={80}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    padding: '8px'
                                }}
                                labelStyle={{
                                    fontWeight: 'bold'
                                }}
                            />
                            <Legend/>
                            <Line
                                type="monotone"
                                name="Doanh Thu"
                                dataKey="revenue"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{r: 4}}
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

export default RevenueCharts;