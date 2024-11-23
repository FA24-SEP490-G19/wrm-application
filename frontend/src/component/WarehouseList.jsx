import React, { useState } from 'react';
import {
    Building2, Menu, Search, MapPin, Package,
    ArrowUpDown, Filter, ChevronDown, MoreHorizontal,
    Square, Timer, Truck, DollarSign, CalendarDays
} from 'lucide-react';

const WarehouseList = () => {
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        status: 'all',
        price: 'all',
        size: 'all'
    });

    // Sample data - replace with your actual data structure
    const warehouses = [
        {
            id: 1,
            name: 'Premium Storage Facility',
            location: '123 Industrial Park, New York',
            size: '50,000',
            price: 5000,
            status: 'Available',
            features: ['Climate Control', '24/7 Security', 'Loading Dock'],
            lastUpdated: '2024-10-15',
            occupancyRate: 85,
        },
        {
            id: 2,
            name: 'Central Distribution Hub',
            location: '456 Logistics Ave, Chicago',
            size: '75,000',
            price: 7500,
            status: 'Limited',
            features: ['High Ceiling', 'Multiple Docks', 'CCTV'],
            lastUpdated: '2024-10-14',
            occupancyRate: 60,
        },
        {
            id: 3,
            name: 'Riverside Warehouse Complex',
            location: '789 Harbor Road, Miami',
            size: '30,000',
            price: 3000,
            status: 'Occupied',
            features: ['Waterfront Access', 'Modern Facilities'],
            lastUpdated: '2024-10-16',
            occupancyRate: 100,
        },
    ];

    const statusColors = {
        'Available': 'bg-green-100 text-green-800',
        'Limited': 'bg-yellow-100 text-yellow-800',
        'Occupied': 'bg-red-100 text-red-800'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Building2 className="h-8 w-8 text-indigo-600" />
                            <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
                                Warehouse Hub
                            </h1>
                        </div>
                        <div className="hidden md:flex space-x-6">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                Dashboard
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                Settings
                            </button>
                            <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition duration-300">
                                Add Warehouse
                            </button>
                        </div>
                        <button className="md:hidden">
                            <Menu className="h-6 w-6 text-gray-700" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Search and Filter Bar */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search warehouses..."
                                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setFilterOpen(!filterOpen)}
                                    className="px-4 py-3 bg-white rounded-xl border border-gray-200 flex items-center gap-2 hover:border-indigo-500 transition duration-200"
                                >
                                    <Filter className="w-5 h-5 text-gray-500" />
                                    Filters
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {filterOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
                                        <div className="space-y-4">
                                            {/* Status Filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                                <select
                                                    className="w-full p-2 rounded-lg border border-gray-200"
                                                    value={selectedFilters.status}
                                                    onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                                                >
                                                    <option value="all">All</option>
                                                    <option value="available">Available</option>
                                                    <option value="limited">Limited</option>
                                                    <option value="occupied">Occupied</option>
                                                </select>
                                            </div>

                                            {/* Price Range Filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                                <select
                                                    className="w-full p-2 rounded-lg border border-gray-200"
                                                    value={selectedFilters.price}
                                                    onChange={(e) => setSelectedFilters({...selectedFilters, price: e.target.value})}
                                                >
                                                    <option value="all">All</option>
                                                    <option value="0-5000">$0 - $5,000</option>
                                                    <option value="5000-10000">$5,000 - $10,000</option>
                                                    <option value="10000+">$10,000+</option>
                                                </select>
                                            </div>

                                            {/* Size Filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Size (sq ft)</label>
                                                <select
                                                    className="w-full p-2 rounded-lg border border-gray-200"
                                                    value={selectedFilters.size}
                                                    onChange={(e) => setSelectedFilters({...selectedFilters, size: e.target.value})}
                                                >
                                                    <option value="all">All</option>
                                                    <option value="0-25000">0 - 25,000</option>
                                                    <option value="25000-50000">25,000 - 50,000</option>
                                                    <option value="50000+">50,000+</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="px-4 py-3 bg-white rounded-xl border border-gray-200 flex items-center gap-2 hover:border-indigo-500 transition duration-200">
                                <ArrowUpDown className="w-5 h-5 text-gray-500" />
                                Sort
                            </button>
                        </div>
                    </div>
                </div>

                {/* Warehouse Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {warehouses.map((warehouse) => (
                        <div
                            key={warehouse.id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300"
                        >
                            {/* Warehouse Image */}
                            <div className="relative h-48 rounded-t-2xl bg-gray-200 overflow-hidden">
                                <img
                                    src="/api/placeholder/400/320"
                                    alt={warehouse.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[warehouse.status]}`}>
                    {warehouse.status}
                  </span>
                                </div>
                            </div>

                            {/* Warehouse Info */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{warehouse.name}</h3>
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span className="text-sm">{warehouse.location}</span>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <Square className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Size</span>
                                        </div>
                                        <p className="font-semibold">{warehouse.size} sq ft</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Price</span>
                                        </div>
                                        <p className="font-semibold">${warehouse.price}/month</p>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {warehouse.features.map((feature, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                                            >
                        {feature}
                      </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <CalendarDays className="w-4 h-4 mr-1" />
                                        Updated {warehouse.lastUpdated}
                                    </div>
                                    <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition duration-200">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-indigo-500 transition duration-200">
                            Previous
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
                            1
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-indigo-500 transition duration-200">
                            2
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-indigo-500 transition duration-200">
                            3
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-indigo-500 transition duration-200">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseList;