import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from "../../context/AuthContext.jsx";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email không được để trống');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('Email không đúng định dạng');
            return false;
        }
        setEmailError('');
        return true;
    };

    const { login } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) return;

        setError('');
        setIsLoading(true);

        try {
            await login({ email, password });
            // Navigate to dashboard on successful login
            navigate('/home');
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || 'Tài khoản hoặc mật khẩu không đúng');
            } else if (err.request) {
                setError('Máy chủ không có phản hồi, vui lòng thử lại');
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại.');
            }
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };
// comment
    return (
        <div className="flex h-screen">
            {/* Left side with background image */}
            <div className="flex-1 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images1.loopnet.com/i2/46_hWPCIDtvftblExmSJEcKVyvYvK_WCsy_b5sGjNhQ/110/image.jpg')",
                    }}
                />
                <div className="absolute inset-0 bg-blue-900 bg-opacity-50" />


            </div>

            {/* Right side with login form */}
            <div className="w-1/3 flex items-center justify-center bg-white">
                <div className="w-full max-w-md p-8">
                    <h2 className="text-3xl font-bold mb-6 text-blue-600">Đăng nhập</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="example@email.com"
                                required
                            />
                            {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
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
                        <div className="flex items-center justify-between">

                            <a href="/forgot" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'ĐĂNG NHẬP'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Bạn chưa có tài khoản? <a href="/register" className="font-medium text-blue-600 hover:underline">Đăng ký ngay</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;