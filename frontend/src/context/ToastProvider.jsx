// context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import {Toast} from "../component/Shared/Toast.jsx";

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    }, []);

    const hideToast = useCallback(() => {
        setToast({ show: false, message: '', type: 'success' });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};