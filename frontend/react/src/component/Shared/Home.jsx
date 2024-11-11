import React from 'react';
import { Building2, Square, Timer, Truck, DollarSign, Package, MapPin, Phone, Mail, Search, Menu } from 'lucide-react';
import {useAuth} from "../../context/AuthContext.jsx";

const WarehouseRental = () => {
    const features = [
        { icon: Square, title: 'Total Area', value: '50,000 sq ft' },
        { icon: Timer, title: 'Availability', value: 'Immediate' },
        { icon: Truck, title: 'Loading Docks', value: '4 Units' },
        { icon: Package, title: 'Storage Height', value: '32 ft' }
    ];

    const { customer } = useAuth();
    const warehouses = [
        {
            id: 1,
            title: 'Industrial Warehouse A',
            location: 'East Industrial Park',
            price: '5,500',
            area: '10,000',
            description: 'Modern warehouse with 24/7 security and climate control',
            tags: ['Climate Control', 'Security']
        },
        {
            id: 2,
            title: 'Logistics Center B',
            location: 'West Distribution Hub',
            price: '7,200',
            area: '15,000',
            description: 'Strategic location with excellent highway access',
            tags: ['Highway Access', 'Loading Dock']
        },
        {
            id: 3,
            title: 'Storage Facility C',
            location: 'South Business District',
            price: '4,800',
            area: '8,000',
            description: 'Flexible space with modern amenities',
            tags: ['Flexible Space', '24/7 Access']
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Building2 className="h-8 w-8 text-indigo-600" />
                            <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">Warehouse Hub</h1>
                        </div>
                        <div className="hidden md:flex space-x-6">
                            <button
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                                <a href="/dashboard">DashBoard</a>
                            </button>
                            <p className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition duration-300">

                                <a href="/profile" >Xin chào {customer?.username}</a>
                            </p>
                        </div>
                        <button className="md:hidden">
                        <Menu className="h-6 w-6 text-gray-700" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 opacity-90" />
                <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center mix-blend-overlay" />
                <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Find Your Perfect <br className="hidden sm:block" />
                        Warehouse Space
                    </h2>
                    <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                        Discover premium warehouse solutions tailored to your business needs
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by location or size..."
                                className="pl-10 pr-4 py-3 rounded-full w-full shadow-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <button className="px-8 py-3 bg-white text-indigo-600 rounded-full font-medium hover:shadow-lg hover:scale-105 transition duration-300 whitespace-nowrap">
                            Find Space
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                            <div className="bg-indigo-50 rounded-xl p-3 inline-block mb-4">
                                <feature.icon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Warehouse Listings */}
            <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-8 text-center">Featured Warehouses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {warehouses.map((warehouse) => (
                        <div key={warehouse.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                                <img src="/api/placeholder/400/320" alt={warehouse.title} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 px-4 py-1 bg-white/90 backdrop-blur-md rounded-full text-sm font-medium text-indigo-600">
                                    Available Now
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{warehouse.title}</h3>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
                                    {warehouse.location}
                                </div>
                                <p className="text-gray-600 mb-4">{warehouse.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {warehouse.tags.map((tag, index) => (
                                        <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                      {tag}
                    </span>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div className="flex items-center">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        <span className="text-xl font-bold">${warehouse.price}</span>
                                        <span className="text-gray-600 text-sm ml-1">/month</span>
                                    </div>
                                    <span className="text-gray-600">{warehouse.area} sq ft</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Ready to Find Your Space?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our warehouse experts are here to help you find the perfect solution for your business
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
                        <div className="flex items-center bg-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
                            <Phone className="h-6 w-6 text-indigo-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Call us at</p>
                                <span className="font-semibold">1-800-WAREHOUSE</span>
                            </div>
                        </div>
                        <div className="flex items-center bg-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
                            <Mail className="h-6 w-6 text-indigo-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Email us at</p>
                                <span className="font-semibold">contact@warehousehub.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseRental;