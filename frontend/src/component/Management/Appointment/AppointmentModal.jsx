import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';
import {getAllItemAvailable, getAllItems} from "../../../service/WareHouse.js";
import {getAllCustomers, getAllCustomersIsActive} from "../../../service/Authenticate.js";

const AppointmentModal = ({isOpen, onClose, mode, appointmentData, onSubmit}) => {
    const initialFormState = {
        customer_id: '',
        warehouse_id: '',
        appointment_date: '',
        status: 'PENDING'
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [warehouses, setWarehouses] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (mode === 'edit' && appointmentData) {
            setFormData({
                ...appointmentData,
                appointment_date: '' // Set to empty initially
            });
        } else {
            setFormData(initialFormState);
        }
    }, [mode, appointmentData, isOpen]);

    const fetchOptions = async () => {
        setLoading(true);
        try {

            const warehousesResponse = await getAllItemAvailable();
            const customersResponse = await getAllCustomersIsActive();

            setWarehouses(warehousesResponse.data);

            setCustomers(customersResponse.data || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
        setLoading(false);
    };
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format for datetime-local input
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.customer_id) newErrors.customer_id = 'ID khách hàng không được để trống';
        if (!formData.warehouse_id) newErrors.warehouse_id = 'ID kho không được để trống';
        if (!formData.appointment_date) newErrors.appointment_date = 'Ngày hẹn không được để trống';

        // Validate if appointment date is in the future
        if (formData.appointment_date) {
            const appointmentDate = new Date(formData.appointment_date);
            const now = new Date();
            if (appointmentDate <= now) {
                newErrors.appointment_date = 'Ngày hẹn phải là thời gian trong tương lai';
            }
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSubmit(formData);
    };

    const validateAppointmentTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        const hours = date.getHours();
        return hours >= 9 && hours <= 17;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'appointment_date') {
            // Validate time first
            if (!validateAppointmentTime(value)) {
                setErrors(prev => ({
                    ...prev,
                    appointment_date: 'Vui lòng chọn thời gian từ 9h đến 17h'
                }));
                return;
            }

            // Format the date for display
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error if exists
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    if (!isOpen) return null;

    const inputClasses = (error) => `
        mt-1 block w-full rounded-xl border
        ${error ? 'border-red-300' : 'border-gray-300'}
        px-3 py-2
        focus:outline-none focus:ring-2
        ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}
        transition-colors
    `;

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Use 24-hour format
        }).replace(/[,]/g, ''); // Remove any commas
    };

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
                            {/* ... header code ... */}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'create' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Khách hàng
                                        </label>
                                        <select
                                            name="customer_id"
                                            value={formData.customer_id}
                                            onChange={handleChange}
                                            className={`${inputClasses(errors.customer_id)} ${loading ? 'cursor-wait' : ''}`}
                                            disabled={loading}
                                        >
                                            <option value="">Chọn khách hàng</option>
                                            {customers.map(customer => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer?.fullname} - {customer.email} ({customer.phone_number})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.customer_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
                                        )}
                                    </div>
                                )}

                                {mode === 'create' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Kho
                                        </label>
                                        <select
                                            name="warehouse_id"
                                            value={formData.warehouse_id}
                                            onChange={handleChange}
                                            className={`${inputClasses(errors.warehouse_id)} ${loading ? 'cursor-wait' : ''}`}
                                            disabled={loading}
                                        >
                                            <option value="">Chọn kho</option>
                                            {warehouses.map(warehouse => (
                                                <option key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.name} - {warehouse.address}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.warehouse_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.warehouse_id}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Thời gian hẹn
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="appointment_date"
                                        // Initially empty, but shows selected value after choosing
                                        value={formData.appointment_date || ''}
                                        onChange={handleChange}
                                        className={inputClasses(errors.appointment_date)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        lang="vi-VN"
                                    />
                                    {!formData.appointment_date && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            Chọn thời gian muốn cập nhật
                                        </p>
                                    )}
                                    {formData.appointment_date && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            Thời gian đã chọn: {formatDateForDisplay(formData.appointment_date)}
                                        </p>
                                    )}
                                    {errors.appointment_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.appointment_date}</p>
                                    )}
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
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                                    >
                                        {mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
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