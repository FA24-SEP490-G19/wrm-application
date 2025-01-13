import React from 'react';
import { Clock, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatsCards = ({ metrics }) => {
    const navigate = useNavigate();

    const stats = [
        {
            title: 'Yêu cầu chờ xử lý',
            value: metrics.pendingRequests,
            icon: Clock,
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600',
            path: '/request'  // Route for pending requests
        },
        {
            title: 'Hợp Đồng Sắp Hết Hạn',
            value: metrics.expiringRentals,
            icon: Calendar,
            bgColor: 'bg-green-100',
            textColor: 'text-green-600',
            path: '/rental'  // Route for expiring contracts
        },
        {
            title: 'Lịch Hẹn Chưa Phân Công',
            value: metrics.unassignedAppointments,
            icon: Users,
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-600',
            path: '/appointment'  // Route for unassigned appointments
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    onClick={() => navigate(stat.path)}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 ${stat.bgColor} rounded-full`}>
                            <stat.icon className={stat.textColor} size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;