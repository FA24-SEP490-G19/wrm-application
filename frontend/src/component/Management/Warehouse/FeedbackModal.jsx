// FeedbackModal.jsx
import React from 'react';
import { Star, X } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, feedbacks }) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Đánh giá & Bình luận</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {feedbacks && feedbacks.length > 0 ? (
                                    feedbacks.map((feedback, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-4 space-y-2"
                                        >
                                            <div className="flex items-center space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${
                                                            i < feedback.rating
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-gray-700">{feedback.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500">Chưa có đánh giá nào</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FeedbackModal;