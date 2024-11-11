import React from 'react';
import { Search, ChevronDown, Bell, User, Menu } from 'lucide-react';
import {useAuth} from "../../context/AuthContext.jsx";

const Sidebar = ({ isOpen, onClose }) => {
    const {logOut, customer} = useAuth();

    return (

        <div
            className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-200 ease-in-out lg:block bg-gray-900 text-white w-64 p-6 space-y-6 z-30`}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                    <img src="/api/placeholder/40/40" alt="Riki Logo" className="w-10 h-10"/>
                    <h1 className="text-xl font-bold text-cyan-400">Riki Nihongo</h1>
                </div>
                <button onClick={onClose} className="lg:hidden">
                    <Menu size={24}/>
                </button>
            </div>
            <div className="flex items-center space-x-3 pb-6 border-b border-gray-700">
                <img src="/api/placeholder/48/48" alt="User Avatar" className="w-12 h-12 rounded-full"/>
                <div>
                    <p className="font-semibold">{customer?.username}</p>
                    <div className="flex items-center text-sm">
                        <span className="text-yellow-500 mr-1">●</span>
                        <span>0</span>
                        <span className="text-blue-500 mx-1">●</span>
                        <span>3</span>
                        <span className="text-green-500 ml-1">N4</span>
                    </div>
                </div>
            </div>
            <nav className="space-y-4">
                <a href="#"
                   className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>📊</span><span>Thống kê</span></a>
                <a href="#"
                   className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>📚</span><span>Lớp học của tôi</span></a>
                <a href="#" className="flex items-center space-x-2 text-cyan-400 font-semibold"><span>🎓</span><span>Khóa học của tôi</span></a>
                <a href="#"
                   className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>❤️</span><span>Bài học video yêu thích</span></a>
                <a href="#"
                   className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>🗂️</span><span>Flashcard</span></a>
                <a href="#"
                   className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>📝</span><span>Ghi chú của tôi</span></a>
            </nav>
            <div className="pt-6 border-t border-gray-700">
                <nav className="space-y-4">
                    <a href="#"
                       className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>🧪</span><span>Kiểm tra năng lực</span></a>
                    <a href="#"
                       className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>🕒</span><span>Lịch sử làm bài</span></a>
                    <a href="#"
                       className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>💰</span><span>Quy đổi coin</span></a>
                    <a href="#"
                       className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>🎫</span><span>Voucher kích hoạt</span></a>
                    <a href="#"
                       className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-150"><span>📅</span><span>Lịch sử thanh toán</span></a>
                </nav>
            </div>
        </div>
    );
}

const Header = ({ onMenuClick }) => (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <button onClick={onMenuClick} className="lg:hidden">
                <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold">Trang chủ / <span className="text-cyan-500">Khóa học của tôi</span></h2>
        </div>
        <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition duration-150"><Bell size={20} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition duration-150"><User size={20} /></button>
        </div>
    </header>
);

const CourseCard = ({ title, image, type, date, progress }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-lg">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-1">{type}</p>
            <div className="flex items-center text-xs text-gray-500 mb-3">
                <span className="mr-2">●</span> Đang cập nhật
                <span className="mx-2">|</span>
                <span>{date}</span>
            </div>
            <div className="flex items-center">
                <div className="flex-grow bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-cyan-500 h-2 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                </div>
                <span className="text-xs text-gray-600">{progress}%</span>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Đã xem gần đây</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3 hover:shadow-md transition duration-300">
                                    <span className="text-cyan-500 text-2xl">📘</span>
                                    <div>
                                        <p className="font-semibold text-sm">N3 taisaku Bài tập ngữ pháp 1</p>
                                        <p className="text-xs text-cyan-500">Đang học</p>
                                    </div>
                                </div>
                                {/* Add more recent items here */}
                            </div>
                        </section>
                        <section>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                                <h3 className="text-lg font-semibold">Khóa học của tôi</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <input type="text" placeholder="Tìm kiếm khóa học" className="pl-8 pr-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    </div>
                                    <select className="border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                        <option>Mặc định</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <CourseCard
                                    title="N3 TAISAKU"
                                    image="/api/placeholder/400/200"
                                    type="Khóa chính"
                                    date="06-12-2024"
                                    progress={0}
                                />
                                <CourseCard
                                    title="N3 JUNBI"
                                    image="/api/placeholder/400/200"
                                    type="Khóa chính"
                                    date="06-12-2024"
                                    progress={4}
                                />
                                <CourseCard
                                    title="N3 Luyện đề"
                                    image="/api/placeholder/400/200"
                                    type="Khóa chính"
                                    date="06-12-2024"
                                    progress={0}
                                />
                            </div>
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Khóa học gợi ý</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <img src="/api/placeholder/200/100" alt="Khóa học N4" className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition duration-300" />
                                <img src="/api/placeholder/200/100" alt="Khóa học N4" className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition duration-300" />
                                <img src="/api/placeholder/200/100" alt="KANJI N4" className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition duration-300" />
                                <img src="/api/placeholder/200/100" alt="TT - N4" className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition duration-300" />
                                <img src="/api/placeholder/200/100" alt="N3 JUNBI" className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition duration-300" />
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;