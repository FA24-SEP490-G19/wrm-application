import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Upload } from 'lucide-react';

const ContractModal = ({ isOpen, onClose, mode, contractData, onSubmit, onImageUpload }) => {
    const [formData, setFormData] = useState({
        signed_date: '',
        expiry_date: '',
        is_deleted: false,
        images: []
    });
    const [errors, setErrors] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showFullImage, setShowFullImage] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                signed_date: '',
                expiry_date: '',
                is_deleted: false,
                images: []
            });
            setErrors({});
            setUploadedImages([]);
        } else if (mode === 'edit' && contractData) {
            setFormData({
                signed_date: formatDateForInput(contractData.signedDate),
                expiry_date: formatDateForInput(contractData.expiryDate),
                is_deleted: contractData.isDeleted || false,
                images: contractData.contract_images || []
            });
            setUploadedImages(contractData.contract_images || []);
        }
    }, [isOpen, mode, contractData]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = [];

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('image', file);

                // Here you would typically upload to your image hosting service
                // For this example, we'll use the URL directly
                const imageUrl = URL.createObjectURL(file);
                imageUrls.push(imageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }

        setUploadedImages([...uploadedImages, ...imageUrls]);
        if (onImageUpload) {
            onImageUpload(imageUrls);
        }
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
            contract_img_link: uploadedImages
        };

        onSubmit(submitData);
    };

    const ImageUploader = () => (
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Tải lên hình ảnh hợp đồng
            </label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click để tải lên</span> hoặc kéo thả
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF (Tối đa 10MB)</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                    />
                </label>
            </div>
        </div>
    );

    const ImageViewer = ({ images }) => {
        if (!images || images.length === 0) return null;

        const handlePrevious = () => {
            setCurrentImageIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
            );
        };

        const handleNext = () => {
            setCurrentImageIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        };

        return (
            <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Hình ảnh hợp đồng</h3>
                <div className="relative">
                    <div className="grid grid-cols-3 gap-4">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="relative cursor-pointer group"
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setShowFullImage(true);
                                }}
                            >
                                <img
                                    src={image}
                                    alt={`Contract ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>

                {showFullImage && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
                        <div className="max-w-4xl w-full relative">
                            <button
                                onClick={() => setShowFullImage(false)}
                                className="absolute top-4 right-4 text-white hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <img
                                src={images[currentImageIndex]}
                                alt="Full size"
                                className="max-h-[80vh] mx-auto object-contain"
                            />

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevious}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                                    >
                                        <ChevronRight className="w-8 h-8" />
                                    </button>
                                </>
                            )}

                            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            currentImageIndex === index ? 'bg-white' : 'bg-gray-400'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
                <div className="relative bg-white rounded-xl w-full max-w-3xl shadow-xl">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">
                                {mode === 'view' ? 'Chi tiết hợp đồng' :
                                    mode === 'edit' ? 'Sửa hợp đồng' :
                                        'Thêm hợp đồng mới'}
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {mode === 'view' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Thời gian ký
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {formatDateTime(contractData.signedDate)}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Thời gian hết hạn
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {formatDateTime(contractData.expiryDate)}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Kho
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">{contractData.warehouseName}</p>
                                        <p className="mt-1 text-sm text-gray-500">{contractData.warehouseAddress}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Dịch vụ kèm theo
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">{contractData.additionalService}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Khách hàng
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">{contractData.customerFullName}</p>
                                        <p className="mt-1 text-sm text-gray-500">{contractData.customerPhoneNumber}</p>
                                        <p className="mt-1 text-sm text-gray-500">{contractData.customerAddress}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Môi giới
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">{contractData.saleFullName}</p>
                                        <p className="mt-1 text-sm text-gray-500">{contractData.salePhoneNumber}</p>
                                    </div>
                                </div>

                                {contractData.contract_images && contractData.contract_images.length > 0 && (
                                    <ImageViewer images={contractData.contract_images} />
                                )}
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
                                        onChange={(e) => setFormData({ ...formData, signed_date: e.target.value })}
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
                                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                        className={`mt-1 block w-full rounded-lg border ${
                                            errors.expiry_date ? 'border-red-300' : 'border-gray-300'
                                        } px-3 py-2`}
                                    />
                                    {errors.expiry_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>
                                    )}
                                </div>

                                <ImageUploader />

                                {uploadedImages.length > 0 && (
                                    <ImageViewer images={uploadedImages} />
                                )}

                                <div className="flex justify-end space-x-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button><button
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
    );
};

export default ContractModal;