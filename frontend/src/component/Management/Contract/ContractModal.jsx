import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Upload, Image, Trash2 } from 'lucide-react';

const ContractModal = ({ isOpen, onClose, mode, contractData, onSubmit, onImageUpload }) => {
    const initialFormState = {
        signed_date: '',
        expiry_date: '',
        is_deleted: false,
        images: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormState);
            setErrors({});
            setImageFiles([]);
            setImagePreviewUrls([]);
        } else if (mode === 'edit' && contractData) {
            setFormData({
                signed_date: formatDateForInput(contractData.signedDate),
                expiry_date: formatDateForInput(contractData.expiryDate),
                is_deleted: contractData.isDeleted || false,
                images: contractData.images || []
            });
        }
    }, [isOpen, mode, contractData]);



    const validateForm = () => {
        const errors = {};

        // Existing validations
        if (!formData.signed_date) {
            errors.signed_date = 'Ngày ký không được để trống';
        }
        if (!formData.expiry_date) {
            errors.expiry_date = 'Ngày hết hạn không được để trống';
        }
        if (new Date(formData.expiry_date) <= new Date(formData.signed_date)) {
            errors.expiry_date = 'Ngày hết hạn phải sau ngày ký';
        }
        if (new Date(formData.expiry_date) < new Date(formData.signed_date + 7 * 24 * 60 * 60 * 1000)) {
            errors.expiry_date = 'Thời gian thuê phải tối thiểu 1 tuần';
        }

        // Add image validation
        if (mode === 'create' && imageFiles.length === 0) {
            errors.images = 'Vui lòng tải lên ít nhất một hình ảnh hợp đồng';
        }

        // If in edit mode and no existing images and no new images
        if (mode === 'edit' && imageFiles.length === 0 && (!contractData?.images || contractData.images.length === 0)) {
            errors.images = 'Vui lòng tải lên ít nhất một hình ảnh hợp đồng';
        }

        return errors;
    };

    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);
        const newErrors = { ...errors };

        // Clear any existing image errors
        delete newErrors.images;

        // Validate each file
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                newErrors.images = 'Kích thước ảnh vượt quá giới hạn tối đa 10MB.';
                setErrors(newErrors);
                return;
            }
            if (!file.type.startsWith('image/')) {
                newErrors.images = 'Chỉ chấp nhận file ảnh.';
                setErrors(newErrors);
                return;
            }
        }

        const newImageFiles = [...imageFiles, ...files];
        setImageFiles(newImageFiles);
        setErrors(newErrors); // Clear image error if files are valid

        // Create preview URLs
        const newPreviewUrls = await Promise.all(
            files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            })
        );

        setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    };
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format for date input
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split('/').reverse().join('-'); // Convert dd/mm/yyyy to yyyy-mm-dd for input
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }); // Shows as dd/mm/yyyy
    };

    const removeImage = (index) => {
        const newImageFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
        setImageFiles(newImageFiles);
        setImagePreviewUrls(newPreviewUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Convert images to base64
        const base64Images = await Promise.all(
            imageFiles.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        // Remove the "data:image/...;base64," prefix
                        const base64String = reader.result.split(',')[1];
                        resolve(base64String);
                    };
                    reader.readAsDataURL(file);
                });
            })
        );

        const submitData = {
            signed_date: new Date(formData.signed_date).toISOString().split('.')[0],
            expiry_date: new Date(formData.expiry_date).toISOString().split('.')[0],
            is_deleted: formData.is_deleted,
            images: base64Images
        };

        onSubmit(submitData);
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity"
                style={{zIndex: 50}}
                onClick={onClose}
            />

            <div
                className="fixed inset-0 overflow-y-auto"
                style={{zIndex: 51}}
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
                                            type="date"
                                            name="signed_date"
                                            value={formData.signed_date}
                                            onChange={(e) => setFormData({...formData, signed_date: e.target.value})}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.signed_date ? 'border-red-300' : 'border-gray-300'
                                            } px-3 py-2`}
                                            lang="vi-VN"
                                        />
                                        {formData.signed_date && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Ngày đã chọn: {formatDateForDisplay(formData.signed_date)}
                                            </p>
                                        )}
                                        {errors.signed_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.signed_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ngày hết hạn
                                        </label>
                                        <input
                                            type="date"
                                            name="expiry_date"
                                            value={formData.expiry_date}
                                            onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.expiry_date ? 'border-red-300' : 'border-gray-300'
                                            } px-3 py-2`}
                                            lang="vi-VN"
                                        />
                                        {formData.expiry_date && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Ngày đã chọn: {formatDateForDisplay(formData.expiry_date)}
                                            </p>
                                        )}
                                        {errors.expiry_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Hình ảnh hợp đồng
                                        </label>
                                        <div
                                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400"/>
                                                <div className="flex text-sm text-gray-600">
                                                    <label htmlFor="file-upload"
                                                           className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                        <span>Tải ảnh lên</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={handleImageUpload}
                                                        />
                                                    </label>
                                                    <p className="pl-1">hoặc kéo thả vào đây</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG tối đa 10MB</p>
                                            </div>
                                        </div>
                                        {errors.images && (
                                            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                                        )}

                                        {/* Image previews */}
                                        {imagePreviewUrls.length > 0 && (
                                            <div className="mt-4 grid grid-cols-3 gap-4">
                                                {imagePreviewUrls.map((url, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-24 w-full object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4"/>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
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