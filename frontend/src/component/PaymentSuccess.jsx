import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircleHeart, Clock, } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full space-y-6 relative overflow-hidden">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="bg-green-100 rounded-full p-3">
                        <MessageCircleHeart className="w-16 h-16 text-green-500 animate-bounce" />
                    </div>
                </div>

                {/* Success Message */}
                <div className="text-center space-y-3">
                    <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
                    <p className="text-gray-600">
                        Cảm ơn bạn đã trải nghiệm dịch vụ thanh toán của VNPAY
                    </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200" />

                {/* Redirect Message */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <p>Đang chuyển tới màn hình home trong 5s....</p>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-green-500 animate-[progress_5s_linear]" style={{width: '100%'}} />
            </div>
        </div>
    );
};

// Add keyframes for progress bar animation
const style = document.createElement('style');
style.textContent = `
  @keyframes progress {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
`;
document.head.appendChild(style);

export default PaymentSuccess;