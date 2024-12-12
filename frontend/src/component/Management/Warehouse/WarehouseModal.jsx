// AppointmentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, X as XIcon,Plus,Image, Trash2} from 'lucide-react';
import {ManagerNotHaveWarehouse} from "../../../service/WareHouse.js";
import DraggableLotsGrid from "./DraggableLotsGrid.jsx";
import ResizableLotGrid from "./ResizableLotGrid.jsx";

const WarehouseModal = ({ isOpen, onClose, mode, warehouseData, onSubmit }) => {

    const initialFormState = {
        name: '',
        address: '',
        size: '',
        status: 'ACTIVE',
        description: '',
        warehouse_manager_id: '',
        images: [], // Ensure this is always initialized
        lot_items: [] // Ensure this is always initialized
    };

// Add this initial lot state
    const initialLotState = {
        description: '',
        size: '',
        price: '',
        status: 'AVAILABLE'
    };

    // Add state for managing the current lot being added
    const [currentLot, setCurrentLot] = useState(initialLotState);
    const [lotErrors, setLotErrors] = useState({});


    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [managers, setManagers] = useState([]); // State for managers
    const [loadingManagers, setLoadingManagers] = useState(false); // Loading state
    const [existingImages, setExistingImages] = useState([]);

    // Add state for image previews
    const [imagePreviews, setImagePreviews] = useState([]);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const statusOptions = [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' }
    ];

// Add function to validate lot
    const validateLot = (lot) => {
        const errors = {};
        if (!lot.description) errors.description = 'Mô tả không được để trống';
        if (!lot.size || lot.size <= 0) errors.size = 'Kích thước phải lớn hơn 0';
        if (!lot.price) errors.price = 'Giá không được để trống';
        return errors;
    };

// Add function to handle adding a lot
    const handleAddLot = () => {
        const errors = validateLot(currentLot);
        if (Object.keys(errors).length > 0) {
            setLotErrors(errors);
            return;
        }

        setFormData(prev => ({
            ...prev,
            lot_items: [...prev.lot_items, currentLot]
        }));
        setCurrentLot(initialLotState);
        setLotErrors({});
    };

// Add function to remove lot
    const handleRemoveLot = (index) => {
        setFormData(prev => ({
            ...prev,
            lot_items: prev.lot_items.filter((_, i) => i !== index)
        }));
    };
    // Function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove the data:image/jpeg;base64, prefix
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    // Handle thumbnail upload
    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5242880) { // 5MB limit
                setErrors(prev => ({
                    ...prev,
                    thumbnail: 'Kích thước ảnh không được vượt quá 5MB'
                }));
                return;
            }

            try {
                const base64String = await fileToBase64(file);
                setFormData(prev => ({
                    ...prev,
                    thumbnail: base64String
                }));
                setThumbnailPreview(URL.createObjectURL(file));
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    thumbnail: 'Không thể xử lý ảnh. Vui lòng thử lại'
                }));
            }
        }
    };

    const handleImagesUpload = async (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = [];
        const newBase64s = [];

        for (const file of files) {
            if (file.size > 5242880) { // 5MB limit
                setErrors(prev => ({
                    ...prev,
                    images: 'Một hoặc nhiều ảnh vượt quá giới hạn 5MB'
                }));
                return;
            }

            try {
                const base64String = await fileToBase64(file);
                newBase64s.push(base64String);
                newPreviews.push(URL.createObjectURL(file));
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    images: 'Không thể xử lý một số ảnh'
                }));
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newBase64s]
        }));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };
    // Existing useEffect for form data...

    // Remove image
    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };
    useEffect(() => {
        const fetchManagers = async () => {

            if (!isOpen) {
                setFormData(initialFormState);
                setImagePreviews([]);
                setThumbnailPreview('');
                setExistingImages([]);
                setErrors({});
                setLotErrors({});
                return;
            }

            if (mode === 'create') {
                setFormData(initialFormState);
                setImagePreviews([]);
                setThumbnailPreview('');
                setExistingImages([]);
                try {
                    setLoadingManagers(true);
                    const response = await ManagerNotHaveWarehouse();
                    setManagers(response.data || []);
                } catch (error) {
                    console.error('Error fetching managers:', error);
                } finally {
                    setLoadingManagers(false);
                }
            } else if (mode === 'edit' && warehouseData) {
                // Handle existing warehouse data
                const existingImageUrls = warehouseData.images?.map(imagePath =>
                    `${import.meta.env.VITE_API_BASE_URL}/warehouses/images/${imagePath.split('\\').pop()}`
                ) || [];

                setExistingImages(existingImageUrls);
                setThumbnailPreview(
                    warehouseData.fullThumbnailPath
                        ? `${import.meta.env.VITE_API_BASE_URL}/warehouses/images/${warehouseData.fullThumbnailPath.split('\\').pop()}`
                        : ''
                );

                setFormData({
                    ...warehouseData,
                    images: [], // Reset images array for new uploads
                    lot_items: warehouseData.lot_items || []
                });
            }
        }
        fetchManagers()
    }, [isOpen, mode, warehouseData]);

    // New useEffect to fetch managers


    const handleImageURLAdd = () => {
        const url = prompt('Nhập URL hình ảnh:');
        if (url) {
            // Basic URL validation
            try {
                new URL(url);
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), url]
                }));
                setImageError('');
            } catch {
                setImageError('URL không hợp lệ');
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Tên kho không được để trống';
        if (!formData.address) newErrors.address = 'Địa chỉ không được để trống';
        if (!formData.size || formData.size <= 0) newErrors.size = 'Kích thước phải lớn hơn 0';
        if (!formData.description) newErrors.description = 'Mô tả không được để trống';
        if (mode === 'create' && (!formData.images || formData.images.length === 0)) {
            newErrors.images = 'Vui lòng thêm ít nhất một hình ảnh';
        }
        if (mode === 'create' && (!formData.lot_items || formData.lot_items.length === 0)) {
            newErrors.lots = 'Vui lòng thêm ít nhất một lô hàng';
        }

        // Check if total lot size matches warehouse size
        const totalLotSize = formData.lot_items.reduce((sum, lot) => sum + parseFloat(lot.size), 0);
        if (totalLotSize !== parseFloat(formData.size) && mode === 'create') {
            newErrors.size = 'Tổng diện tích các lô phải bằng diện tích kho';
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

        // Prepare final form data including existing images
        const finalFormData = {
            ...formData,
            existingImages: existingImages.map(url => {
                // Extract filename from URL
                const urlParts = url.split('/');
                return urlParts[urlParts.length - 1];
            })
        };

        onSubmit(finalFormData);
    };

    // Rest of your existing functions remain the same...

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
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

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    {/* Change max-w-md to max-w-4xl for wider form */}
                    <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl transform transition-all">
                        <div className="p-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ảnh đại diện kho
                                    </label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        <div className="flex-shrink-0 h-32 w-32 relative">
                                            {thumbnailPreview ? (
                                                <>
                                                    <img
                                                        src={thumbnailPreview}
                                                        alt="Thumbnail preview"
                                                        className="h-32 w-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setThumbnailPreview('');
                                                            setFormData(prev => ({...prev, thumbnail: ''}));
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                    >
                                                        <XIcon className="w-4 h-4"/>
                                                    </button>
                                                </>
                                            ) : (
                                                <div
                                                    className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                    <Image className="w-8 h-8 text-gray-400"/>
                                                </div>
                                            )}
                                        </div>
                                        <label
                                            className="relative cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                                            <span className="text-sm font-medium text-gray-700">Chọn ảnh</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleThumbnailUpload}
                                            />
                                        </label>
                                    </div>
                                    {errors.thumbnail && (
                                        <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
                                    )}
                                </div>
                            {existingImages.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện có</h4>
                                    <div className="grid grid-cols-4 gap-4">
                                        {existingImages.map((url, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={url}
                                                    alt={`Existing ${index + 1}`}
                                                    className="h-32 w-full object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <XIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                                {/* Multiple Images Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Hình ảnh kho
                                    </label>
                                    <div className="mt-1">
                                        <label
                                            className="relative cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 inline-flex items-center">
                                            <Upload className="w-4 h-4 mr-2"/>
                                            <span className="text-sm font-medium text-gray-700">Tải ảnh lên</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImagesUpload}
                                            />
                                        </label>
                                    </div>
                                    {errors.images && (
                                        <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                                    )}
                                </div>
                                    {/* Make the image grid better with more space */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="h-32 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <XIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Make form fields in two columns */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Left column */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Tên kho
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={inputClasses(errors.name)}
                                                placeholder="Nhập tên kho"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Địa chỉ
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className={inputClasses(errors.address)}
                                                placeholder="Nhập địa chỉ"
                                            />
                                            {errors.address && (
                                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Kích thước (m²)
                                            </label>
                                            <input
                                                type="number"
                                                name="size"
                                                value={formData.size}
                                                onChange={handleChange}
                                                className={inputClasses(errors.size)}
                                                placeholder="Nhập kích thước"
                                                step="0.01"
                                            />
                                            {errors.size && (
                                                <p className="mt-1 text-sm text-red-600">{errors.size}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right column */}
                                    <div className="space-y-4">
                                        {mode === 'create' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Người quản lý
                                                </label>
                                                <select
                                                    name="warehouse_manager_id"
                                                    value={formData.warehouse_manager_id}
                                                    onChange={handleChange}
                                                    className={`${inputClasses(errors.warehouse_manager_id)} ${loadingManagers ? 'cursor-wait' : ''}`}
                                                    disabled={loadingManagers}
                                                >
                                                    <option value="">Chọn người quản lý</option>
                                                    {managers.map(manager => (
                                                        <option key={manager.id} value={manager.id}>
                                                            {manager.fullname}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.warehouse_manager_id && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.warehouse_manager_id}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Trạng thái
                                            </label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                className={inputClasses(errors.status)}
                                            >
                                                {statusOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Mô tả
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                className={inputClasses(errors.description)}
                                                placeholder="Nhập mô tả"
                                                rows="4"
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                                {mode === 'create' ? (
                                <div className="space-y-4">
                                    <div className="border-t border-gray-200 pt-6 mt-6">
                                        <h3 className="text-lg font-semibold mb-4">Thông tin các lô hàng</h3>

                                        {/* Lot Form */}
                                        <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Mô tả lô
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={currentLot.description}
                                                        onChange={(e) => setCurrentLot(prev => ({
                                                            ...prev,
                                                            description: e.target.value
                                                        }))}
                                                        className={inputClasses(lotErrors.description)}
                                                        placeholder="Nhập mô tả lô"
                                                    />
                                                    {lotErrors.description && (
                                                        <p className="mt-1 text-sm text-red-600">{lotErrors.description}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Kích thước (m²)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={currentLot.size}
                                                        onChange={(e) => setCurrentLot(prev => ({
                                                            ...prev,
                                                            size: parseFloat(e.target.value)
                                                        }))}
                                                        className={inputClasses(lotErrors.size)}
                                                        placeholder="Nhập kích thước"
                                                        step="0.01"
                                                    />
                                                    {lotErrors.size && (
                                                        <p className="mt-1 text-sm text-red-600">{lotErrors.size}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Giá
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={currentLot.price}
                                                        onChange={(e) => setCurrentLot(prev => ({
                                                            ...prev,
                                                            price: e.target.value
                                                        }))}
                                                        className={inputClasses(lotErrors.price)}
                                                        placeholder="Nhập giá"
                                                    />
                                                    {lotErrors.price && (
                                                        <p className="mt-1 text-sm text-red-600">{lotErrors.price}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleAddLot}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4"/>
                                                    Thêm lô
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Lots List */}
                                    {formData.lot_items.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-700">Danh sách lô đã thêm</h4>
                                            <div className="border rounded-xl p-4">
                                                <ResizableLotGrid
                                                    lots={formData.lot_items}
                                                    onRemove={handleRemoveLot}
                                                />
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Tổng diện tích: {formData.lot_items.reduce((sum, lot) => sum + parseFloat(lot.size), 0).toLocaleString('de-DE')} m²
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : ("") }

                                {/* Form buttons */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                                        {mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
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

export default WarehouseModal;