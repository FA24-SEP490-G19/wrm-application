import React, { useState } from 'react';
import {
    Building2, Menu, MapPin, Square, Timer, Truck,
    DollarSign, Package, Calendar, Clock, ChevronLeft,
    Phone, Mail, User, Shield, ThermometerSun, Boxes,
    ArrowUpRight, Activity, CheckCircle2, Camera
} from 'lucide-react';

const WarehouseDetail = () => {
    const [selectedImage, setSelectedImage] = useState(0);

    // Sample warehouse data - replace with your actual data structure
    const warehouse = {
        id: 1,
        name: 'Premium Storage Facility',
        status: 'Available',
        location: {
            address: '123 Industrial Park, New York, NY 10001',
            coordinates: '40.7128° N, 74.0060° W',
            accessRoutes: ['Highway 95', 'Industrial Route 7'],
        },
        pricing: {
            monthly: 5000,
            minLeaseTerm: 12,
            securityDeposit: 10000,
        },
        specifications: {
            totalArea: '50,000 sq ft',
            clearHeight: '32 ft',
            loadingDocks: 4,
            parkingSpaces: 25,
            floorStrength: '5,000 lbs/sq ft',
        },
        features: [
            'Climate Control',
            '24/7 Security',
            'Loading Dock',
            'CCTV Surveillance',
            'Fire Suppression',
            'High-Speed Internet',
            'Office Space',
            'Parking Area'
        ],
        amenities: [
            'Break Room',
            'Conference Room',
            'Security Office',
            'Restrooms',
            'Loading Equipment',
        ],
        occupancyRate: 85,
        images: [
            '/api/placeholder/800/600',
            '/api/placeholder/800/600',
            '/api/placeholder/800/600',
            '/api/placeholder/800/600'
        ],
        contact: {
            manager: 'John Smith',
            phone: '+1 (555) 123-4567',
            email: 'contact@premiumstorage.com',
            availability: '24/7'
        },
        certifications: [
            'ISO 9001:2015',
            'OSHA Compliant',
            'Green Building Certified'
        ],
        lastInspection: '2024-09-15',
        availableFrom: '2024-11-01'
    };

    const stats = [
        { icon: Square, label: 'Total Area', value: warehouse.specifications.totalArea },
        { icon: Package, label: 'Clear Height', value: warehouse.specifications.clearHeight },
        { icon: Truck, label: 'Loading Docks', value: warehouse.specifications.loadingDocks },
        { icon: Activity, label: 'Occupancy Rate', value: `${warehouse.occupancyRate}%` }
    ];

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
                                Contact Agent
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
                {/* Back Button */}
                <button className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 group">
                    <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
                    Back to Listings
                </button>

                {/* Title Section */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{warehouse.name}</h1>
                        <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{warehouse.location.address}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Monthly Rate</p>
                            <p className="text-2xl font-bold text-gray-900">${warehouse.pricing.monthly}</p>
                        </div>
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium self-start">
              {warehouse.status}
            </span>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="mb-8">
                    <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4">
                        <img
                            src={warehouse.images[selectedImage]}
                            alt="Warehouse"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {warehouse.images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`aspect-video rounded-xl overflow-hidden ${
                                    selectedImage === index ? 'ring-2 ring-indigo-500' : ''
                                }`}
                            >
                                <img
                                    src={image}
                                    alt={`View ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Left 2 Columns */}
                    <div className="lg:col-span-2">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <stat.icon className="w-5 h-5 mr-2" />
                                        <span className="text-sm">{stat.label}</span>
                                    </div>
                                    <p className="text-xl font-semibold">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Specifications */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                            <h2 className="text-xl font-bold mb-4">Specifications</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(warehouse.specifications).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className="font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                            <h2 className="text-xl font-bold mb-4">Features & Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {warehouse.features.map((feature, index) => (
                                    <div key={index} className="flex items-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Location & Access</h2>
                            <div className="space-y-4">
                                <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                                    <img
                                        src="/api/placeholder/800/400"
                                        alt="Map"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Access Routes</h3>
                                        <ul className="list-disc list-inside text-gray-600">
                                            {warehouse.location.accessRoutes.map((route, index) => (
                                                <li key={index}>{route}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-2">Coordinates</h3>
                                        <p className="text-gray-600">{warehouse.location.coordinates}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <User className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600">Property Manager</p>
                                        <p className="font-medium">{warehouse.contact.manager}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{warehouse.contact.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{warehouse.contact.email}</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition duration-300">
                                    Contact Now
                                </button>
                            </div>
                        </div>

                        {/* Additional Info Cards */}
                        <div className="space-y-4">
                            {/* Availability */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold mb-1">Availability</h3>
                                        <p className="text-gray-600">Available from</p>
                                        <p className="font-medium">{warehouse.availableFrom}</p>
                                    </div>
                                    <Calendar className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>

                            {/* Lease Terms */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold mb-1">Lease Terms</h3>
                                        <p className="text-gray-600">Minimum term</p>
                                        <p className="font-medium">{warehouse.pricing.minLeaseTerm} months</p>
                                    </div>
                                    <Clock className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>

                            {/* Security */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold mb-1">Security Deposit</h3>
                                        <p className="text-gray-600">Refundable</p>
                                        <p className="font-medium">${warehouse.pricing.securityDeposit}</p>
                                    </div>
                                    <Shield className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>

                            {/* Certifications */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold mb-3">Certifications</h3>
                                <div className="space-y-2">
                                    {warehouse.certifications.map((cert, index) => (
                                        <div key={index} className="flex items-center">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                                            <span className="text-sm">{cert}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDetail;