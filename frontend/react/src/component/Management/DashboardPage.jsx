import React from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Users,
    Package, BarChart2, ArrowRight, MoreVertical,
    Calendar, Clock, CheckCircle, AlertCircle,
    Phone, Mail, MessageSquare, Star, ChevronRight
} from 'lucide-react';
import CRMLayout from "./Crm.jsx";

const DashboardPage = () => {
    // Sample data
    const stats = [
        {
            title: 'Total Customers',
            value: '1,234',
            trend: '+12.5%',
            isPositive: true,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Total Revenue',
            value: '$89,432',
            trend: '+23.8%',
            isPositive: true,
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            title: 'Active Deals',
            value: '48',
            trend: '-5.2%',
            isPositive: false,
            icon: Package,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            title: 'Conversion Rate',
            value: '28%',
            trend: '+8.1%',
            isPositive: true,
            icon: BarChart2,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        }
    ];

    const recentDeals = [
        {
            customer: 'Acme Corp',
            value: 25000,
            stage: 'Negotiation',
            probability: 75,
            nextAction: 'Follow-up call',
            dueDate: '2024-10-25'
        },
        {
            customer: 'Tech Solutions',
            value: 18500,
            stage: 'Proposal',
            probability: 60,
            nextAction: 'Send quote',
            dueDate: '2024-10-24'
        },
        {
            customer: 'Global Industries',
            value: 32000,
            stage: 'Closing',
            probability: 90,
            nextAction: 'Contract review',
            dueDate: '2024-10-23'
        }
    ];

    const upcomingTasks = [
        {
            title: 'Client Meeting - Acme Corp',
            type: 'Meeting',
            due: '2:00 PM Today',
            priority: 'High'
        },
        {
            title: 'Follow up with Tech Solutions',
            type: 'Call',
            due: 'Tomorrow',
            priority: 'Medium'
        },
        {
            title: 'Prepare Q4 Sales Report',
            type: 'Task',
            due: 'Oct 25',
            priority: 'High'
        }
    ];

    const recentActivities = [
        {
            type: 'message',
            title: 'New message from Sarah Johnson',
            description: 'Regarding the proposal discussion',
            time: '5 min ago',
            icon: MessageSquare,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            type: 'deal',
            title: 'Deal closed with Acme Corporation',
            description: 'Value: $25,000',
            time: '2 hours ago',
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            type: 'task',
            title: 'New task assigned',
            description: 'Follow-up with client',
            time: '4 hours ago',
            icon: AlertCircle,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100'
        }
    ];

    const topCustomers = [
        {
            name: 'Acme Corporation',
            revenue: 150000,
            deals: 5,
            status: 'Active'
        },
        {
            name: 'Tech Solutions Inc',
            revenue: 120000,
            deals: 3,
            status: 'Active'
        },
        {
            name: 'Global Industries',
            revenue: 95000,
            deals: 4,
            status: 'Active'
        }
    ];

    return (
        <CRMLayout>
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, here's what's happening today</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                        Last 30 Days
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-6 hover:shadow-lg transition duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${stat.bg} p-3 rounded-xl`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                stat.isPositive
                                    ? 'text-green-600 bg-green-50'
                                    : 'text-red-600 bg-red-50'
                            }`}>
                {stat.trend}
              </span>
                        </div>
                        <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Deals */}
                <div className="xl:col-span-2 bg-white rounded-xl">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Recent Deals</h2>
                            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentDeals.map((deal, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition duration-150"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-medium mb-1">{deal.customer}</h3>
                                            <span className="text-sm text-gray-500">
                        Stage: {deal.stage}
                      </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold">
                                                ${deal.value.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {deal.probability}% probability
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Next: {deal.nextAction}
                    </span>
                                        <span className="text-gray-600">
                      Due: {deal.dueDate}
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tasks */}
                <div className="bg-white rounded-xl">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Upcoming Tasks</h2>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {upcomingTasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-150"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium mb-1">{task.title}</h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {task.due}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        task.priority === 'High'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                    {task.priority}
                  </span>
                                </div>
                            ))}
                            <button className="w-full mt-4 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition flex items-center justify-center">
                                View All Tasks
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl">
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
                        <div className="space-y-6">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center`}>
                                            <activity.icon className={`w-4 h-4 ${activity.color}`} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.title}</p>
                                        <p className="text-sm text-gray-500">{activity.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white rounded-xl">
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4">Top Customers</h2>
                        <div className="space-y-4">
                            {topCustomers.map((customer, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-150"
                                >
                                    <div>
                                        <h3 className="font-medium mb-1">{customer.name}</h3>
                                        <div className="text-sm text-gray-500">
                                            {customer.deals} active deals
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            ${customer.revenue.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-green-600">
                                            {customer.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white rounded-xl">
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4">Sales Performance</h2>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                            {/* Add your chart component here */}
                            <p className="text-gray-500">Sales Chart Placeholder</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </CRMLayout>
    );

};

export default DashboardPage;