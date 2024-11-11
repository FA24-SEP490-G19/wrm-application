import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { register } from "../../service/Authenticate.js";

const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsLoading(true);

        try {
            await register({ fullName:fullName, email, password, phone_number:phoneNumber, gender, address,retypePassword:confirmPassword });
            setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || 'Đăng ký thất bại');
            } else if (err.request) {
                setError('Máy chủ không có phản hồi, vui lòng thử lại');
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại');
            }
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen">
            {/* Left side with background image */}
            <div className="flex-1 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://3pllinks.com/wp-content/uploads/2022/09/empty-warehouse-storage-distribution-centers_41470-4881.jpg')",
                    }}
                />
                <div className="absolute inset-0 bg-blue-900 bg-opacity-50" />

                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-10">
                    <h1 className="text-5xl font-bold mb-4 text-center">KhoLưuTrữVN</h1>
                    <p className="text-2xl text-center">Dịch vụ cho thuê kho bãi hàng đầu Việt Nam</p>
                </div>
            </div>

            {/* Right side with register form */}
            <div className="w-1/3 bg-white flex items-center justify-center p-12 overflow-y-auto">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-6 text-blue-600">Đăng ký tài khoản</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span>{success}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="example@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0123456789"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                            <select
                                id="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>

                            </select>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                            <textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Địa chỉ của bạn"
                                rows="3"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition duration-300"
                            disabled={isLoading || success}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'ĐĂNG KÝ'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Bạn đã có tài khoản? <a href="/login" className="font-medium text-blue-600 hover:underline">Đăng nhập</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;