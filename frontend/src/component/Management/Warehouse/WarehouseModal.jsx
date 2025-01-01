// AppointmentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, X as XIcon,Plus,Image, Trash2} from 'lucide-react';
import {getWareHouseById, ManagerNotHaveWarehouse} from "../../../service/WareHouse.js";
import {useToast} from "../../../context/ToastProvider.jsx";
import {warehouseImageService} from "./warehouseImageService.jsx";
import {getAllLots} from "../../../service/lot.js";
import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from "../../../context/AuthContext.jsx";
import ProportionalWarehouseLotGrid from "../../ProportionalWarehouseLotGrid.jsx";

export const WarehouseLotGrid = ({ lots, onRemoveLot }) => {
    const totalSize = lots.reduce((sum, lot) => sum + parseFloat(lot.size), 0);

    // Sort lots by size and arrange in pairs (2 per row)
    const arrangeLots = () => {
        const sortedLots = [...lots].sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
        const rows = Math.ceil(sortedLots.length / 2); // 2 lots per row
        const arranged = Array(rows).fill().map(() => []);

        // Fill rows with pairs of lots
        sortedLots.forEach((lot, index) => {
            const rowIndex = Math.floor(index / 2);
            arranged[rowIndex].push(lot);
        });

        return arranged;
    };

    const arrangedLots = arrangeLots();

    // Render a lot card with consistent styling
    const LotCard = ({ lot }) => {
        const sizePercentage = (parseFloat(lot.size) / totalSize) * 100;

        return (
            <div className="relative bg-green-50 p-4 rounded-lg border border-green-200
                          hover:shadow-md transition-all cursor-pointer h-40
                          flex flex-col justify-between">
                <div>
                    <p className="font-medium text-base truncate">{lot.description}</p>
                    <p className="text-sm text-gray-500 mt-1">{lot.size}m²</p>
                    <p className="text-sm text-gray-500">({sizePercentage.toFixed(1)}% tổng diện tích)</p>
                </div>
                <div className="flex justify-between items-end">

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLot(lots.indexOf(lot));
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative bg-white p-8 rounded-xl border border-gray-200">
            {/* Warehouse Entry */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                          bg-blue-100 text-blue-700 px-6 py-2 rounded-full text-sm
                          font-medium border border-blue-200">
                Lối vào kho
            </div>

            {/* Main Layout - Grid with 2 columns */}
            <div className="mt-6 space-y-6">
                {arrangedLots.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-2 gap-6">
                        {row.map((lot, colIndex) => (
                            <LotCard
                                key={`${rowIndex}-${colIndex}`}
                                lot={lot}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Exit Signs */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2
                          bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm
                          font-medium border border-red-200 rotate-90">
                Lối thoát hiểm
            </div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2
                          bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm
                          font-medium border border-red-200 rotate-90">
                Lối thoát hiểm
            </div>
        </div>
    );
};const WarehouseModal = ({ isOpen, onClose, mode, warehouseData, onSubmit }) => {

    const initialLotState = {
        quantity: 1,
        status: 'AVAILABLE'
    };

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
    const {id} = useParams();
    const [warehouse, setWarehouse] = useState(null);
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [warehouseImages, setWarehouseImages] = useState([]);

// Update the initialLotState

    const { showToast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
// Add function to generate multiple lots
    const generateLots = (size, price, quantity) => {
        return Array.from({ length: quantity }, (_, index) => ({
            description: `Lô ${index + 1} `,
            size: parseInt(size),
            price,
            status: 'AVAILABLE'
        }));
    };


// Update the validation function
    const validateLot = (lot) => {
        const errors = {};
        if (!lot.quantity || lot.quantity < 1) {
            errors.quantity = 'Số lượng phải lớn hơn 0';
        }
        return errors;
    };

// Update the handleAddLot function to handle numeric price
    const handleAddLot = () => {
        const errors = validateLot(currentLot);
        if (Object.keys(errors).length > 0) {
            setLotErrors(errors);
            return;
        }

        const totalWarehouseSize = parseFloat(formData.size);
        const numberOfLots = parseInt(currentLot.quantity);

        // Calculate size per lot (rounded to 2 decimal places)
        const sizePerLot = parseFloat((totalWarehouseSize / numberOfLots).toFixed(2));

        // Generate base price (example: 1,000,000 VND per m²)
        const basePrice = 1000000;

        // Generate new lots with calculated sizes
        const newLots = Array.from({ length: numberOfLots }, (_, index) => ({
            description: `Lô ${index + 1} `,
            size: sizePerLot,
            price: sizePerLot * basePrice, // Price based on size
            status: 'AVAILABLE'
        }));

        setFormData(prev => ({
            ...prev,
            lot_items: [...prev.lot_items, ...newLots]
        }));

        setCurrentLot(initialLotState);
        setLotErrors({});
    };


    const renderLotForm = () => (
        <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Số lượng lô
                    </label>
                    <input
                        type="number"
                        min="10"
                        max="20"
                        step="2"
                        value={currentLot.quantity}
                        onChange={(e) => {
                            let value = parseInt(e.target.value) || 0;
                            // Ensure the value is even
                            if (value % 2 !== 0) {
                                value = Math.max(10, Math.min(20, value + 1));
                            }
                            setCurrentLot(prev => ({
                                ...prev,
                                quantity: Math.max(10, Math.min(20, value))
                            }));
                        }}
                        className={inputClasses(lotErrors.quantity)}
                        placeholder="Nhập số lượng lô (chẵn)"
                    />
                    {lotErrors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{lotErrors.quantity}</p>
                    )}
                </div>

                <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                        Kích thước mỗi lô sẽ là: {formData.size ? (formData.size / currentLot.quantity).toFixed(2) : 0}m²
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleAddLot}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4"/>
                            Tạo {currentLot.quantity} lô tự động
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );


// Add this function to generate lot description
    const generateLotDescription = (size, index) => {
        return `Lô ${index + 1} - ${size}m²`;
    };

// Modify the handleAddLot function



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


// Add function to remove lot
    const handleLotsChange = (updatedLots) => {
        setFormData(prev => ({
            ...prev,
            lot_items: updatedLots
        }));
    };

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
        setIsUploading(true);

        try {
            const newImages = [];
            const newPreviews = [];

            for (const file of files) {
                if (file.size > 5242880) { // 5MB limit
                    showToast('Một hoặc nhiều ảnh vượt quá giới hạn 5MB', 'error');
                    continue;
                }

                try {
                    const base64String = await fileToBase64(file);
                    newImages.push(base64String);
                    newPreviews.push(URL.createObjectURL(file));
                } catch (error) {
                    showToast('Không thể xử lý một số ảnh', 'error');
                }
            }

            if (mode === 'edit' && warehouseData?.id) {
                // If in edit mode, upload images directly
                const addedImages = await warehouseImageService.addImages(warehouseData.id, newImages);
                // Refresh existing images
                const updatedImages = await warehouseImageService.getImages(warehouseData.id);
                setExistingImages(updatedImages.map(img => `http://localhost:8080/warehouses/images/${img}`));
                showToast('Tải ảnh lên thành công', 'success');
            } else {
                // In create mode, store images in formData
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...newImages]
                }));
                setImagePreviews(prev => [...prev, ...newPreviews]);
            }
        } catch (error) {
            showToast('Tải ảnh lên thất bại', 'error');
        } finally {
            setIsUploading(false);
        }
    };
    const handleRemoveImage = async (index, imageId) => {
        try {
            if (mode === 'edit' && warehouseData?.id) {
                await warehouseImageService.deleteImage(warehouseData.id, imageId);
                setExistingImages(prev => prev.filter((_, i) => i !== index));
                showToast('Xóa ảnh thành công', 'success');
            } else {
                setFormData(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index)
                }));
                setImagePreviews(prev => prev.filter((_, i) => i !== index));
            }
        } catch (error) {
            showToast('Xóa ảnh thất bại', 'error');
        }
    };

    const handleViewImage = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsImageModalOpen(true);
    };

// Add Image Modal component
    const ImageModal = ({ image, isOpen, onClose }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
                <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={image}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            </div>
        );
    };


    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) {
                // Reset states when modal closes
                setFormData(initialFormState);
                setImagePreviews([]);
                setThumbnailPreview('');
                setExistingImages([]);
                setErrors({});
                setLotErrors({});
                return;
            }

            if (mode === 'create') {
                // Reset for create mode
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
                try {
                    // Fetch images when opening in edit mode
                    const images = await warehouseImageService.getImages(warehouseData.id);
                    const imageUrls = images.map(img =>
                        `http://localhost:8080/warehouses/images/${img}`
                    );
                    setExistingImages(imageUrls);

                    // Set thumbnail if exists
                    if (warehouseData.fullThumbnailPath) {
                        setThumbnailPreview(
                            `http://localhost:8080/warehouses/images/${warehouseData.fullThumbnailPath.split('\\').pop()}`
                        );
                    }

                    // Set other form data
                    setFormData({
                        ...warehouseData,
                        images: [], // Reset images array for new uploads
                        lot_items: warehouseData.lot_items || []
                    });
                } catch (error) {
                    showToast('Không thể tải hình ảnh', 'error');
                }
            }
        };

        fetchData();
    }, [isOpen, mode, warehouseData]);
    // New useEffect to fetch managers

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [warehouseResponse, lotsResponse] = await Promise.all([
                    getWareHouseById(warehouseData.id),
                    getAllLots()
                ]);

                setWarehouse(warehouseResponse.data);
                setLots(lotsResponse.data.lots.filter(lot => lot.warehouse_id === parseInt(warehouseData.id)));

                // Set warehouse images if they exist
                if (warehouseResponse.data.images) {
                    setWarehouseImages(warehouseResponse.data.images);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Không thể tải thông tin');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, mode, warehouseData]);


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



// In WarehouseModal component
    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Only include thumbnail in formData if it's a new upload
        const finalFormData = {
            ...formData,
            thumbnail: formData.thumbnail === warehouseData?.thumbnail ? null : formData.thumbnail,
            existingImages: existingImages.map(url => {
                const urlParts = url.split('/');
                return urlParts[urlParts.length - 1];
            })
        };

        onSubmit(finalFormData);
    };

// When loading the modal in edit mode
    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) {
                // Reset states when modal closes
                setFormData(initialFormState);
                setImagePreviews([]);
                setThumbnailPreview('');
                setExistingImages([]);
                setErrors({});
                setLotErrors({});
                return;
            }

            const getAuthConfig = () => ({
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            if (mode === 'edit' && warehouseData) {
                try {
                    // Set form data with existing thumbnail path
                    setFormData({
                        ...warehouseData,
                        images: [], // Reset images array for new uploads
                        lot_items: warehouseData.lot_items || [],
                        thumbnail: warehouseData.thumbnail // Keep existing thumbnail path
                    });

                    // Fetch current thumbnail with auth if exists
                    if (warehouseData.thumbnail) {
                        const thumbnailUrl = `http://localhost:8080/warehouses/images/${warehouseData.thumbnail.split('\\').pop()}`;
                        try {
                            // Verify the thumbnail exists and is accessible
                            await axios.head(thumbnailUrl, getAuthConfig());
                            setThumbnailPreview(thumbnailUrl);
                        } catch (error) {
                            console.error('Error loading thumbnail:', error);
                            setThumbnailPreview('');  // Reset if there's an error
                        }
                    }

                    // Fetch images if any
                    const images = await warehouseImageService.getImages(warehouseData.id);
                    const imageUrls = images.map(img =>
                        `http://localhost:8080/warehouses/images/${img}`
                    );
                    setExistingImages(imageUrls);

                } catch (error) {
                    showToast('Không thể tải dữ liệu', 'error');
                    console.error('Error loading data:', error);
                }
            }
        };

        fetchData();
    }, [isOpen, mode, warehouseData]);

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


                            {/* Multiple Images Upload */}
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-sm font-medium text-gray-700">
                                        Hình ảnh kho
                                    </label>
                                    <label
                                        className="relative cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 inline-flex items-center">
                                        <Upload className="w-4 h-4 mr-2"/>
                                        <span className="text-sm font-medium text-gray-700">
                {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
            </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImagesUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-4 gap-4">
                                    {mode === 'edit' ? (
                                        // Display existing images in edit mode
                                        existingImages.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <div
                                                    className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={url}
                                                        alt={`Warehouse ${index + 1}`}
                                                        className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                                        onClick={() => handleViewImage(url)}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index, url.split('/').pop())}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        // Display image previews in create mode
                                        imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div
                                                    className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                                        onClick={() => handleViewImage(preview)}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Image viewer modal */}
                            <ImageModal
                                image={selectedImage}
                                isOpen={isImageModalOpen}
                                onClose={() => {
                                    setIsImageModalOpen(false);
                                    setSelectedImage(null);
                                }}
                            />

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
                                {mode === 'create' && (
                                    <div className="space-y-4">
                                        <div className="border-t border-gray-200 pt-6 mt-6">
                                            <h3 className="text-lg font-semibold mb-4">Thông tin các lô hàng</h3>
                                            {renderLotForm()}
                                        </div>

                                        {formData.lot_items.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-gray-700">Sơ đồ kho</h4>
                                                    <div className="text-sm text-gray-500">
                                                        Tổng diện tích: {formData.lot_items.reduce((sum, lot) => sum + parseFloat(lot.size), 0)}m²
                                                    </div>
                                                </div>

                                                <WarehouseLotGrid
                                                    lots={formData.lot_items}
                                                    onRemoveLot={handleRemoveLot}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {mode === 'edit'  && (
                                    <ProportionalWarehouseLotGrid
                                        lots={lots}

                                    />
                                )}

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