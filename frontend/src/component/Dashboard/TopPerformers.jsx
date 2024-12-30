// TopPerformers.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TopPerformers = ({ topCustomers, topWarehouses, topSales }) => {
    const transformData = (data) => {
        if (!Array.isArray(data)) return [];

        return data.map(item => ({
            name: item?.name || item?.fullName || 'Không xác định',
            revenue: Number(item?.revenue || item?.amount || 0)
        }));
    };

    const sections = [
        {
            title: 'Khách Hàng Hàng Đầu',
            data: transformData(topCustomers),
            color: '#3b82f6'
        },
        {
            title: 'Kho Hàng Hàng Đầu',
            data: transformData(topWarehouses),
            color: '#10b981'
        },
        {
            title: 'Doanh Số Cao Nhất',
            data: transformData(topSales),
            color: '#6366f1'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((section, index) => {
                const hasData = section.data && section.data.length > 0;

                return (
                    <div key={index} className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">{section.title}</h2>
                        <div className="h-64">
                            {hasData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={section.data} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            label={{
                                                value: 'Doanh Thu (VNĐ)',
                                                position: 'bottom'
                                            }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={100}
                                        />
                                        <Tooltip
                                            formatter={(value) => `${value.toLocaleString()} VNĐ`}
                                            contentStyle={{
                                                background: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                padding: '8px'
                                            }}
                                        />
                                        <Bar
                                            name="Doanh Thu"
                                            dataKey="revenue"
                                            fill={section.color}
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    Không có dữ liệu
                                </div>
                            )}
                        </div>

                    </div>
                );
            })}
        </div>
    );
};

export default TopPerformers;