// components/Appointments/AppointmentModal.jsx
import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

const AppointmentModal = ({ isOpen, onClose, warehouseId, onSubmit }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [error, setError] = useState('');

    // Get tomorrow's date as minimum date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) {
            setError('Vui lòng chọn ngày và giờ hẹn');
            return;
        }

        // Combine date and time
        const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;
        onSubmit({
            warehouse_id: warehouseId,
            appointment_date: appointmentDateTime
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40"
                 onClick={onClose} />

            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Đặt lịch hẹn
                                </h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <p className="text-red-600 text-sm">{error}</p>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chọn ngày
                                    </label>
                                    <input
                                        type="date"
                                        min={minDate}
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chọn giờ
                                    </label>
                                    <select
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn thời gian</option>
                                        <option value="09:00">09:00</option>
                                        <option value="10:00">10:00</option>
                                        <option value="11:00">11:00</option>
                                        <option value="14:00">14:00</option>
                                        <option value="15:00">15:00</option>
                                        <option value="16:00">16:00</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Đặt lịch
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppointmentModal;