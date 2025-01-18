import React, {useState, useEffect} from 'react';
import {
    ChevronRight,
    Warehouse,
    TruckIcon,
    ClipboardCheck,
    Menu,
    X,
    Star,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Check
} from 'lucide-react';
import logo from "../assets/logo.png";


const WarehouseLandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [warehouses, setWarehouses] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeSection, setActiveSection] = useState('home');
    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
            const animatedElements = document.querySelectorAll('.animate-on-scroll');
            animatedElements.forEach((el) => {
                if (el.getBoundingClientRect().top < window.innerHeight * 0.75) {
                    el.classList.add('is-visible');
                }
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch warehouses data
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await fetch(' https://api.g42.biz/warehouses?page=0&limit=10');
                const data = await response.json();
                setWarehouses(data.warehouses || []);
            } catch (error) {
                console.error('Error fetching warehouses:', error);
            }
        };

        fetchWarehouses();
    }, []);

    useEffect(() => {
        if (warehouses.length === 0) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === warehouses.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [warehouses]);

    const getCurrentWarehouseImages = () => {
        if (warehouses.length === 0) return [];
        const warehouse = warehouses[currentImageIndex];
        const images = [];

        if (warehouse?.thumbnail) {
            images.push(`${import.meta.env.VITE_API_BASE_URL}/warehouses/images/${warehouse.thumbnail.split('\\').pop()}`);
        }

        if (warehouse?.warehouseImages?.length) {
            warehouse.warehouseImages.forEach(img => {
                if (img?.image_url) {
                    const imageName = img.image_url.split('\\').pop();
                    images.push(`${import.meta.env.VITE_API_BASE_URL}/warehouses/images/${imageName}`);
                }
            });
        }

        return images;
    };


    const getWarehouseImage = (warehouse) => {
        if (!warehouse?.thumbnail) return '/api/placeholder/400/320';
        return `${import.meta.env.VITE_API_BASE_URL}/warehouses/images/${warehouse.thumbnail.split('\\').pop()}`;
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({behavior: 'smooth'});
            setActiveSection(sectionId);
        }
        setIsMenuOpen(false);
    };

    const navigationItems = [
        {id: 'home', label: 'Trang chủ'},
        {id: 'services', label: 'Dịch vụ'},
        {id: 'warehouses', label: 'Kho bãi'},
        {id: 'pricing', label: 'Bảng giá'},
        {id: 'contact', label: 'Liên hệ'}
    ];

    return (
        <div className="min-h-screen font-sans text-gray-900">
            {/* Background Image Slider */}
            <div className="fixed inset-0 z-0">
                {getCurrentWarehouseImages().map((imageUrl, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 
                            ${index === currentImageIndex ? 'opacity-50' : 'opacity-0'}`}
                        style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-purple-900/80"/>
            </div>

            <div className="relative z-10">
                {/* Enhanced Header */}
                <header className={`fixed w-full transition-all duration-300 z-50 
                    ${scrollPosition > 50 ? 'bg-white/95 shadow-lg backdrop-blur-sm' : 'bg-transparent'}`}>
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            {/* Logo */}
                            <div className="flex items-center">
                                <img src={logo} alt="Logo" className="h-11 w-11"/>
                                <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
                                    Warehouse Hub
                                </h1>
                            </div>

                            <nav className="hidden md:flex items-center space-x-8">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className={`transition-colors duration-300 font-medium 
                                            ${scrollPosition > 50
                                            ? 'text-gray-700 hover:text-blue-600'
                                            : 'text-white hover:text-blue-200'}
                                            ${activeSection === item.id ? 'border-b-2 border-yellow-400' : ''}`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="hidden md:flex items-center space-x-4">
                                {/* Existing Hotline */}
                                <a href="tel:+84123456789"
                                   className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-300
        ${scrollPosition > 50
                                       ? 'text-blue-600 hover:bg-blue-50'
                                       : 'text-white hover:bg-white/10'}`}>
                                    <Phone size={20} className="mr-2"/>
                                    <span>Hotline: 123-456-789</span>
                                </a>

                                {/* New Login Button */}
                                <a href="/login"
                                   className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all duration-300
        ${scrollPosition > 50
                                       ? 'bg-blue-600 text-white hover:bg-blue-700'
                                       : 'bg-white/10 text-white hover:bg-white/20'} 
        backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105`}>
                                    Đăng nhập
                                </a>
                            </div>

                            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen
                                    ? <X className="text-blue-600" size={24}/>
                                    : <Menu className={scrollPosition > 50 ? 'text-blue-600' : 'text-white'} size={24}/>
                                }
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-lg">
                            <div className="container mx-auto px-6 py-4">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                                <a href="tel:+84123456789"
                                   className="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg mt-2">
                                    <Phone size={20} className="mr-2"/>
                                    <span>Hotline: 123-456-789</span>
                                </a>

                                {/* New Login Button for Mobile */}
                                <a href="/login"
                                   className="flex items-center justify-center px-4 py-3 mt-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
                                    Đăng nhập
                                </a>
                            </div>
                        </div>
                    )}
                </header>

                <main className="container mx-auto px-6">
                    {/* Hero Section */}
                    <section id="home" className="pt-40 pb-20">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
                                Giải Pháp Lưu Trữ
                                <span
                                    className="block mt-2 bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                                    Thông Minh Cho Doanh Nghiệp
                                </span>
                            </h2>
                            <p className="text-xl text-gray-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                                KhoLưuTrữVN mang đến dịch vụ cho thuê kho bãi hiện đại,
                                an toàn và linh hoạt cho doanh nghiệp của bạn.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a href="/register"
                                   className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                    Đăng ký ngay
                                    <ArrowRight className="ml-2" size={20}/>
                                </a>
                                <a href="/home/guess"
                                   className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                    Khám phá ngay
                                    <Phone className="ml-2" size={20}/>
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Featured Warehouses section with null check */}
                    <section id="warehouses" className="py-20">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-white mb-4">Kho Bãi Nổi Bật</h2>
                            <p className="text-gray-200">Khám phá các kho bãi hiện đại của chúng tôi</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {warehouses.slice(0, 3).map((warehouse) => (
                                <div key={warehouse.id}
                                     className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                    <div className="relative h-48">
                                        <img
                                            src={getWarehouseImage(warehouse)}
                                            alt={warehouse.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div
                                            className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                                            {warehouse.status === 'ACTIVE' ? 'Còn trống' : 'Đã thuê'}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-2">{warehouse.name || 'Chưa có tên'}</h3>
                                        <p className="text-gray-300 mb-4">{warehouse.description || 'Chưa có mô tả'}</p>
                                        <div className="flex items-center text-gray-200 mb-4">
                                            <MapPin size={16} className="mr-2"/>
                                            <span>{warehouse.address || 'Chưa có địa chỉ'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                        <span className="text-yellow-400 font-bold">
                                            {(warehouse.size || 0).toLocaleString()} m²
                                        </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Enhanced Features Section */}
                    <section id="services" className="py-20">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-white mb-4">Dịch Vụ Của Chúng Tôi</h2>
                            <p className="text-gray-200">Giải pháp toàn diện cho nhu cầu lưu trữ của bạn</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Warehouse,
                                    title: 'Kho Bãi Hiện Đại',
                                    desc: 'Hệ thống kho bãi được trang bị công nghệ hiện đại, đảm bảo an toàn tuyệt đối cho hàng hóa.',
                                    features: ['Hệ thống an ninh 24/7', 'Kiểm soát nhiệt độ', 'Phòng cháy chữa cháy']
                                },
                                {
                                    icon: TruckIcon,
                                    title: 'Vận Chuyển Thuận Tiện',
                                    desc: 'Vị trí chiến lược, dễ dàng tiếp cận các tuyến đường chính và trung tâm logistics.',
                                    features: ['Kết nối đa chiều', 'Dịch vụ vận chuyển', 'Bốc xếp hàng hóa']
                                },
                                {
                                    icon: ClipboardCheck,
                                    title: 'Quản Lý Chuyên Nghiệp',
                                    desc: 'Đội ngũ quản lý giàu kinh nghiệm, hỗ trợ 24/7 với quy trình chuyên nghiệp.',
                                    features: ['Báo cáo real-time', 'Hỗ trợ khẩn cấp', 'Tư vấn logistics']
                                }
                            ].map((feature, index) => (
                                <div key={index}
                                     className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                    <feature.icon className="text-yellow-400 mb-6" size={48}/>
                                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                    <p className="text-gray-300 mb-6">{feature.desc}</p>
                                    <ul className="space-y-3">
                                        {feature.features.map((item, i) => (
                                            <li key={i} className="flex items-center text-gray-200">
                                                <Check className="text-green-400 mr-2" size={16}/>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Enhanced Pricing Section */}
                    <section id="pricing" className="py-20">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-white mb-4">Bảng Giá Dịch Vụ</h2>
                            <p className="text-gray-200">Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Gói Cơ Bản',
                                    price: '100.000 VNĐ',
                                    period: '/m²',
                                    description: 'Phù hợp cho doanh nghiệp nhỏ',
                                    features: [
                                        'Diện tích 50m²',
                                        'Bảo vệ 24/7',
                                        'Kiểm soát nhiệt độ cơ bản',
                                        'Báo cáo hàng tháng',
                                        'Hỗ trợ cơ bản'
                                    ]
                                },
                                {
                                    title: 'Gói Nâng Cao',
                                    price: '100.000 VNĐ',
                                    period: '/m²',
                                    highlight: true,
                                    description: 'Phù hợp cho doanh nghiệp vừa',
                                    features: [
                                        'Diện tích 100m²',
                                        'Bảo vệ 24/7',
                                        'Kiểm soát nhiệt độ tự động',
                                        'Báo cáo thời gian thực',
                                        'Hỗ trợ ưu tiên 24/7',
                                        'Dịch vụ bốc xếp',
                                        'Bảo hiểm hàng hóa'
                                    ]
                                },
                                {
                                    title: 'Gói Linh Hoạt',
                                    price: 'Liên hệ',
                                    period: '',
                                    highlight: false,
                                    description: 'Giải pháp tùy chỉnh cho doanh nghiệp lớn',
                                    features: [
                                        'Diện tích tùy chọn',
                                        'Giải pháp bảo mật cao cấp',
                                        'Hệ thống quản lý riêng biệt',
                                        'Báo cáo tùy chỉnh',
                                        'Hỗ trợ chuyên biệt 24/7',
                                        'Dịch vụ logistics tích hợp',
                                        'Bảo hiểm cao cấp'
                                    ]
                                }
                            ].map((plan, index) => (
                                <div key={index}
                                     className={`relative rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105
            ${plan.highlight
                                         ? 'bg-gradient-to-b from-blue-600 to-blue-800 shadow-xl'
                                         : 'bg-white/10 backdrop-blur-sm'}`}>
                                    {plan.highlight && (
                                        <div
                                            className="absolute top-0 right-0 bg-yellow-400 text-blue-900 text-sm font-bold px-4 py-1">
                                            Phổ biến nhất
                                        </div>
                                    )}
                                    <div className="p-8">
                                        <h3 className="text-2xl font-bold text-white mb-2">{plan.title}</h3>
                                        <p className="text-gray-300 mb-6">{plan.description}</p>
                                        <div className="mb-8">
                                            <span className="text-4xl font-bold text-white">{plan.price}</span>
                                            <span className="text-gray-300">{plan.period}</span>
                                        </div>
                                        <ul className="space-y-4 mb-8">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center text-gray-200">
                                                    <Check className="text-green-400 mr-2" size={16}/>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    {/* Contact Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="contact">
                        {/* Contact Details */}
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl h-full">
                            <h3 className="text-xl font-bold text-white mb-6">Thông Tin Liên Hệ</h3>
                            <div className="space-y-4">
                                <a href="tel:123-456-789"
                                   className="flex items-center text-gray-200 hover:text-blue-400 transition-colors duration-300">
                                    <Phone className="mr-3" size={20}/>
                                    <span>123-456-789</span>
                                </a>
                                <a href="mailto:contact@kholuutruvn.com"
                                   className="flex items-center text-gray-200 hover:text-blue-400 transition-colors duration-300">
                                    <Mail className="mr-3" size={20}/>
                                    <span>contact@kholuutruvn.com</span>
                                </a>
                                <div className="flex items-center text-gray-200">
                                    <MapPin className="mr-3" size={20}/>
                                    <span>Khu công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội</span>
                                </div>
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl h-full">
                            <h3 className="text-xl font-bold text-white mb-6">Giờ Làm Việc</h3>
                            <div className="space-y-3 text-gray-200">
                                <div className="flex justify-between">
                                    <span>Thứ 2 - Thứ 6:</span>
                                    <span>8:00 - 17:30</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Thứ 7:</span>
                                    <span>8:00 - 12:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Chủ nhật:</span>
                                    <span>Nghỉ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center text-gray-200">
                        <MapPin className="mr-3" size={20}/>
                        <span>SEP490 - FALL2024</span>
                    </div>
                </main>
            </div>
        </div>

    );
};

export default WarehouseLandingPage;