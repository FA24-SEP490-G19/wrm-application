import React, {useState, useEffect} from 'react';
import {X, ChevronRight, ChevronLeft, Upload, Image} from 'lucide-react';

const ContractModal = ({isOpen, onClose, mode, contractData, onSubmit, onImageUpload}) => {
    const initialFormState = {
        signed_date: '',
        expiry_date: '',
        is_deleted: false,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormState);
            setErrors({});
        } else if (mode === 'edit' && contractData) {
            setFormData({
                signed_date: formatDateForInput(contractData.signedDate),
                expiry_date: formatDateForInput(contractData.expiryDate),
                is_deleted: contractData.isDeleted || false,
            });
        }
    }, [isOpen, mode, contractData]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.signed_date) {
            errors.signed_date = 'Ngày ký không được để trống';
        }
        if (!formData.expiry_date) {
            errors.expiry_date = 'Ngày hết hạn không được để trống';
        }
        if (new Date(formData.expiry_date) <= new Date(formData.signed_date)) {
            errors.expiry_date = 'Ngày hết hạn phải sau ngày ký';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const submitData = {
            signed_date: new Date(formData.signed_date).toISOString().split('.')[0],
            expiry_date: new Date(formData.expiry_date).toISOString().split('.')[0],
            is_deleted: formData.is_deleted,
        };

        onSubmit(submitData);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Use higher z-index than rental modal */}
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity"
                style={{zIndex: 50}}  // Lower than toast
                onClick={onClose}
            />

            <div
                className="fixed inset-0 overflow-y-auto"
                style={{zIndex: 51}}  // Lower than toast
            >
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl w-full max-w-3xl shadow-xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">
                                    {mode === 'view' ? 'Chi tiết hợp đồng' :
                                        mode === 'edit' ? 'Sửa hợp đồng' :
                                            'Thêm hợp đồng mới'}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            {mode === 'view' ? (
                                <div className="space-y-6">
                                    <p>Contract Details View Mode</p>
                                    {/* Add your contract view details here */}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ngày ký
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="signed_date"
                                            value={formData.signed_date}
                                            onChange={(e) => setFormData({...formData, signed_date: e.target.value})}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.signed_date ? 'border-red-300' : 'border-gray-300'
                                            } px-3 py-2`}
                                        />
                                        {errors.signed_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.signed_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ngày hết hạn
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="expiry_date"
                                            value={formData.expiry_date}
                                            onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.expiry_date ? 'border-red-300' : 'border-gray-300'
                                            } px-3 py-2`}
                                        />
                                        {errors.expiry_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            {mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContractModal;