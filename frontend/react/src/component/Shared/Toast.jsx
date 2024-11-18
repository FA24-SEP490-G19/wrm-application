// components/shared/Toast.jsx
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
    const types = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            textColor: 'text-green-800',
            borderColor: 'border-green-200',
            iconColor: 'text-green-400'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            textColor: 'text-red-800',
            borderColor: 'border-red-200',
            iconColor: 'text-red-400'
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-800',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-400'
        }
    };

    const style = types[type] || types.success;
    const Icon = style.icon;

    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
            <div className={`${style.bgColor} ${style.textColor} ${style.borderColor} border rounded-xl px-4 py-3 shadow-lg flex items-center max-w-md`}>
                <Icon className={`w-5 h-5 ${style.iconColor} mr-3`} />
                <span className="flex-1">{message}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

// Add these styles to your global CSS or Tailwind config
const styles = `
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.3s ease-out;
}
`;