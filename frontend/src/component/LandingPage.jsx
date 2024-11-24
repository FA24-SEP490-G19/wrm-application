import React, { useState, useEffect } from 'react';
import { ChevronRight, Warehouse, TruckIcon, ClipboardCheck, Menu, X } from 'lucide-react';

const WarehouseLandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);

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

    return (
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-purple-500 min-h-screen font-sans text-gray-900">
            <header className={`fixed w-full transition-all duration-300 z-50 ${scrollPosition > 50 ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className={`text-3xl font-extrabold transition-colors duration-300 ${scrollPosition > 50 ? 'text-blue-600' : 'text-white'}`}>KhoLưuTrữVN</h1>
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8">
                            {['Trang chủ', 'Dịch vụ', 'Bảng giá', 'Liên hệ'].map((item) => (
                                <li key={item}>
                                    <a href="#" className={`transition-colors duration-300 font-medium ${scrollPosition > 50 ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'}`}>{item}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="text-blue-600" size={24} /> : <Menu className={`${scrollPosition > 50 ? 'text-blue-600' : 'text-white'}`} size={24} />}
                    </button>
                </div>
                {isMenuOpen && (
                    <div className="md:hidden bg-white shadow-lg">
                        <ul className="py-4">
                            {['Trang chủ', 'Dịch vụ', 'Bảng giá', 'Liên hệ'].map((item) => (
                                <li key={item} className="px-6 py-2">
                                    <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </header>

            <main className="container mx-auto px-6 pt-32">
                <section className="text-center mb-24 pt-16 animate-fade-in-down">
                    <h2 className="text-5xl font-extrabold text-white mb-8 leading-tight">
                        Giải Pháp Lưu Trữ <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500">
                            Thông Minh Cho Doanh Nghiệp
                        </span>
                    </h2>
                    <p className="text-xl text-gray-100 mb-12 max-w-2xl mx-auto">
                        KhoLưuTrữVN mang đến dịch vụ cho thuê kho bãi hiện đại, an toàn và linh hoạt.
                    </p>
                    <a href="/register"
                       className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Khám phá ngay
                        <ChevronRight className="ml-2" size={20}/>
                    </a>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
                    {[
                        {
                            icon: Warehouse,
                            title: 'Kho bãi hiện đại',
                            desc: 'Hệ thống kho bãi được trang bị công nghệ hiện đại, đảm bảo an toàn tuyệt đối.'
                        },
                        {
                            icon: TruckIcon,
                            title: 'Vận chuyển thuận tiện',
                            desc: 'Vị trí chiến lược, dễ dàng tiếp cận các tuyến đường chính.'
                        },
                        {
                            icon: ClipboardCheck,
                            title: 'Quản lý chuyên nghiệp',
                            desc: 'Đội ngũ quản lý giàu kinh nghiệm, hỗ trợ 24/7.'
                        }
                    ].map((feature, index) => (
                        <div key={index}
                             className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2 animate-on-scroll">
                            <feature.icon className="text-yellow-400 mb-6" size={48}/>
                            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-gray-200">{feature.desc}</p>
                        </div>
                    ))}
                </section>

                <section className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-12 mb-24 shadow-xl animate-on-scroll">
                    <h2 className="text-4xl font-bold text-white mb-12 text-center">Các Gói Dịch Vụ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Gói Cơ Bản',
                                price: '5.000.000 đ/tháng',
                                features: ['Diện tích 50m²', 'Bảo vệ 24/7']
                            },
                            {
                                title: 'Gói Nâng Cao',
                                price: '10.000.000 đ/tháng',
                                features: ['Diện tích 100m²', 'Quản lý hàng hóa']
                            },
                            {
                                title: 'Gói Doanh Nghiệp',
                                price: 'Liên hệ',
                                features: ['Diện tích tùy chọn', 'Giải pháp tùy chỉnh']
                            }
                        ].map((plan, index) => (
                            <div key={index} className="bg-white bg-opacity-20 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                                <h3 className="text-2xl font-bold text-white mb-4">{plan.title}</h3>
                                <p className="text-3xl font-extrabold text-yellow-400 mb-6">{plan.price}</p>
                                <ul className="mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center mb-3 text-gray-200">
                                            <ChevronRight className="text-yellow-400 mr-2" size={20} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 text-center shadow-xl animate-on-scroll mb-24">
                    <h2 className="text-4xl font-bold text-white mb-6">Sẵn sàng tối ưu hóa việc lưu trữ?</h2>
                    <p className="text-xl text-gray-100 mb-10">Liên hệ ngay để nhận tư vấn miễn phí!</p>

                </section>
            </main>

            <footer className="bg-blue-900 text-white text-center py-10">
                <div className="container mx-auto px-6">
                    <p className="mb-4">&copy; 2024 KhoLưuTrữVN. Tất cả quyền được bảo lưu.</p>
                    <div className="flex justify-center space-x-6">
                        {['Điều khoản', 'Chính sách bảo mật', 'Liên hệ'].map((item) => (
                            <a key={item} href="#" className="hover:text-yellow-400 transition duration-300">{item}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default WarehouseLandingPage;