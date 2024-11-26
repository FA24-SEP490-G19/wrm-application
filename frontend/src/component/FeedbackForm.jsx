import React, { useState } from 'react';
import { Star } from 'lucide-react';

const FeedbackForm = ({ warehouseId, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:8080/feedback/add', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    warehouse_id: warehouseId,
                    rating,
                    comment
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            setComment('');
            setRating(0);
            onSubmit?.();
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full mt-6 bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Đánh giá kho</h2>
            </div>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Đánh giá</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 transition-colors ${
                                            star <= (hoveredRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nhận xét</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                     placeholder-gray-400 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!rating || !comment || isSubmitting}
                        className={`w-full px-4 py-2 text-white rounded-lg transition-colors
                                 ${!rating || !comment || isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;