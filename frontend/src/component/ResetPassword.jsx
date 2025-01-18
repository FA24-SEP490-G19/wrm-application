import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(' https://api.g42.biz/users/reset-password?email=' + email, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full space-y-6">
                    <div className="flex justify-center">
                        <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
                    </div>

                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-bold text-gray-800">Kiểm tra email</h2>
                        <p className="text-gray-600">
                            Chúng tôi đã gửi mật khẩu mới tới email của bạn
                        </p>
                        <p className="text-sm text-gray-500">
                            Đang đi tới trang đăng nhập trong vòng 5s.....
                        </p>
                    </div>

                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 animate-[progress_5s_linear]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 rounded-full p-3 inline-flex mb-4">
                        <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Quên mật khẩu</h1>
                    <p className="text-gray-600 mt-2">
                        Vui lòng nhập email, chúng tôi sẽ gửi mật khẩu reset tới email của bạn
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Reset mật khẩu</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Add keyframes for progress bar animation
const style = document.createElement('style');
style.textContent = `
  @keyframes progress {
    from { width: 0; }
    to { width: 100%; }
  }
`;
document.head.appendChild(style);

export default ResetPassword;