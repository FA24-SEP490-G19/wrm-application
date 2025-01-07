import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const VerificationSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Tài khoản đã kích hoạt thành công!
                </h1>
                <p className="text-gray-600 mb-4">
                    Bạn sẽ được chuyển hướng về trang đăng nhập sau 5 giây.
                </p>
                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all duration-[5000ms] ease-linear w-0"
                        style={{ animation: 'progress 5s linear forwards' }}
                    />
                </div>
                <button
                    onClick={() => navigate('/home')}
                    className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
                >
                    Về trang chủ ngay
                </button>
            </div>

            <style jsx>{`
                @keyframes progress {
                    from {
                        width: 0%;
                    }
                    to {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default VerificationSuccess;