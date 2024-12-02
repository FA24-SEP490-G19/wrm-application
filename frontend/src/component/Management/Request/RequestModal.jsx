// RequestModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from "../../../context/AuthContext.jsx";

const REQUEST_TYPES = [
    { id: 1, content: "Yêu cầu phản hồi dịch vụ", role_id: 1 },
    { id: 2, content: "Yêu cầu tạo tài khoản khách hàng mới", role_id: 3 },
    { id: 3, content: "Yêu cầu báo cáo doanh thu", role_id: 3 },
    { id: 4, content: "Yêu cầu tài liệu quảng cáo", role_id: 3 },
    { id: 5, content: "Yêu cầu bảo trì", role_id: 4 },
    { id: 6, content: "Báo cáo sự cố", role_id: 4 },
    { id: 7, content: "Yêu cầu kiểm toán hàng tồn kho", role_id: 4 },
    { id: 8, content: "Yêu cầu cải thiện/nâng cấp", role_id: 4 }
];

const ROLE_MAPPINGS = {
    'ROLE_ADMIN': 1,
    'ROLE_SALES': 3,
    'ROLE_MANAGER': 4
};

const RequestModal = ({ isOpen, onClose, mode, requestData, onSubmit }) => {
    const { customer } = useAuth();
    const userRoleId = ROLE_MAPPINGS[customer.role];

    const initialFormState = {
        type_id: '',
        description: '',
        status: 'PENDING',
        adminResponse: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && requestData) {
                const typeObj = REQUEST_TYPES.find(t => t.content === requestData.type);
                setFormData({
                    ...requestData,
                    type_id: typeObj ? typeObj.id.toString() : '',
                    description: requestData.description || ''
                });
            } else if (mode === 'admin-reply' && requestData) {
                setFormData({
                    ...requestData,
                    adminResponse: '',
                    status: requestData.status || 'PENDING'
                });
            } else {
                setFormData(initialFormState);
            }
        } else {
            setFormData(initialFormState);
            setErrors({});
        }
    }, [mode, requestData, isOpen]);

    const availableRequestTypes = REQUEST_TYPES.filter(type => type.role_id === userRoleId);

    const validateForm = () => {
        const newErrors = {};

        if (mode === 'admin-reply') {
            if (!formData.adminResponse?.trim()) {
                newErrors.adminResponse = 'Phản hồi không được để trống';
            }
        } else {
            if (!formData.type_id) newErrors.type_id = 'Loại yêu cầu không được để trống';
            if (!formData.description) newErrors.description = 'Nội dung không được để trống';
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

        if (mode === 'admin-reply') {
            onSubmit({
                status: formData.status,
                adminResponse: formData.adminResponse
            });
        } else {
            const typeObj = REQUEST_TYPES.find(t => t.id.toString() === formData.type_id);
            onSubmit({
                ...formData,
                type: typeObj?.content
            });
        }
    };

    const inputClasses = (error) => `
        mt-1 block w-full rounded-xl border
        ${error ? 'border-red-300' : 'border-gray-300'}
        px-3 py-2
        focus:outline-none focus:ring-2
        ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}
        transition-colors
    `;

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
                                <h2 className="text-xl font-bold">
                                    {mode === 'edit' ? 'Chỉnh sửa yêu cầu' :
                                        mode === 'admin-reply' ? 'Phản hồi yêu cầu' :
                                            'Tạo yêu cầu mới'}
                                </h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'admin-reply' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Thông tin yêu cầu
                                            </label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                                <p><strong>Loại yêu cầu:</strong> {requestData?.type}</p>
                                                <p className="mt-2"><strong>Nội dung:</strong> {requestData?.description}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Trạng thái <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                                className={inputClasses(errors.status)}
                                            >
                                                <option value="PENDING">Đang chờ</option>
                                                <option value="APPROVED">Chấp nhận</option>
                                                <option value="REJECTED">Từ chối</option>
                                                <option value="CANCELLED">Đã hủy</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Phản hồi <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.adminResponse}
                                                onChange={(e) => setFormData({...formData, adminResponse: e.target.value})}
                                                className={`${inputClasses(errors.adminResponse)} h-32`}
                                                placeholder="Nhập phản hồi..."
                                            />
                                            {errors.adminResponse && (
                                                <p className="mt-1 text-sm text-red-600">{errors.adminResponse}</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Loại yêu cầu <span className="text-red-500">*</span>
                                            </label>
                                            {mode === 'edit' ? (
                                                <div className={`${inputClasses()} bg-gray-50`}>
                                                    {REQUEST_TYPES.find(t => t.id.toString() === formData.type_id)?.content}
                                                </div>
                                            ) : (
                                                <select
                                                    value={formData.type_id}
                                                    onChange={(e) => setFormData({...formData, type_id: e.target.value})}
                                                    className={inputClasses(errors.type_id)}
                                                >
                                                    <option value="">Chọn loại yêu cầu</option>
                                                    {availableRequestTypes.map(type => (
                                                        <option key={type.id} value={type.id}>
                                                            {type.content}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {errors.type_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.type_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nội dung yêu cầu <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                className={`${inputClasses(errors.description)} h-32`}
                                                placeholder="Nhập nội dung yêu cầu..."
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                            )}
                                        </div>
                                    </>
                                )}

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
                                        {mode === 'edit' ? 'Cập nhật' :
                                            mode === 'admin-reply' ? 'Phản hồi' :
                                                'Tạo mới'}
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

export default RequestModal;