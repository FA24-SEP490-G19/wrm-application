import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2,Upload,Trash2  } from 'lucide-react';
import axios from 'axios';
import {useAuth} from "../../../context/AuthContext.jsx";
import {useToast} from "../../../context/ToastProvider.jsx";

const ImageViewer = ({ images, isOpen, onClose,contractId,onImagesUpdate}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { customer } = useAuth();
    const { showToast } = useToast();
    const [uploadingImages, setUploadingImages] = useState(false);

    const canModifyImages = customer.role === "ROLE_ADMIN" || customer.role === "ROLE_SALES";

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
    });

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;

        try {
            await axios.delete(
                `http://localhost:8080/contracts/${contractId}/images/${imageId}`,
                getAuthConfig()
            );
            showToast('Xóa ảnh thành công', 'success');

            // Remove the deleted image from state
            const newLoadedImages = loadedImages.filter((_, index) => index !== currentImageIndex);
            setLoadedImages(newLoadedImages);

            if (currentImageIndex >= newLoadedImages.length) {
                setCurrentImageIndex(Math.max(0, newLoadedImages.length - 1));
            }

            // Notify parent component of the update
            if (onImagesUpdate) {
                onImagesUpdate();
            }
        } catch (error) {
            showToast('Không thể xóa ảnh', 'error');
        }
    };

    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        setUploadingImages(true);
        const base64Images = [];

        try {
            // Convert files to base64
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(file);
                });
                base64Images.push(base64);
            }

            // Upload images
            await axios.post(
                `http://localhost:8080/contracts/${contractId}/images`,
                base64Images,
                getAuthConfig()
            );

            showToast('Tải ảnh lên thành công', 'success');
            if (onImagesUpdate) {
                onImagesUpdate();
            }
        } catch (error) {
            showToast('Không thể tải ảnh lên', 'error');
        } finally {
            setUploadingImages(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setCurrentImageIndex(0);
            setLoadedImages([]);
            setLoading(true);
            return;
        }

        const loadImages = async () => {
            if (!images || images.length === 0) return;

            setLoading(true);
            try {
                const loadedUrls = await Promise.all(
                    images.map(async (imageData) => {
                        const response = await axios.get(imageData.url, {
                            ...imageData.config,
                            responseType: 'blob'
                        });
                        return URL.createObjectURL(response.data);
                    })
                );
                setLoadedImages(loadedUrls);
            } catch (error) {
                console.error('Error loading images:', error);
            } finally {
                setLoading(false);
            }
        };

        loadImages();

        return () => {
            loadedImages.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images, isOpen]);
    const handlePrevious = useCallback((e) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prevIndex) => {
            return prevIndex === 0 ? loadedImages.length - 1 : prevIndex - 1;
        });
    }, [loadedImages.length]);

    const handleNext = useCallback((e) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prevIndex) => {
            return prevIndex === loadedImages.length - 1 ? 0 : prevIndex + 1;
        });
    }, [loadedImages.length]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowLeft') {
            handlePrevious();
        } else if (e.key === 'ArrowRight') {
            handleNext();
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [handlePrevious, handleNext, onClose]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    useEffect(() => {
        if (!isOpen) {
            setCurrentImageIndex(0);
            setLoadedImages([]);
            setLoading(true);
            return;
        }

        const loadImages = async () => {
            if (!images || images.length === 0) return;

            setLoading(true);
            try {
                const loadedUrls = await Promise.all(
                    images.map(async (imageData) => {
                        const response = await axios.get(imageData.url, {
                            ...imageData.config,
                            responseType: 'blob'
                        });
                        return URL.createObjectURL(response.data);
                    })
                );
                setLoadedImages(loadedUrls);
            } catch (error) {
                console.error('Error loading images:', error);
            } finally {
                setLoading(false);
            }
        };

        loadImages();

        return () => {
            loadedImages.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images, isOpen]);

    if (!isOpen || !images || images.length === 0) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            onClick={handleBackdropClick}
        >
            <div
                className="relative max-w-4xl w-full h-[80vh] mx-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4 z-50 flex space-x-2">
                    {canModifyImages && (
                        <>
                            <input
                                type="file"
                                id="image-upload"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploadingImages}
                            />
                            <label
                                htmlFor="image-upload"
                                className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:text-gray-300 hover:bg-opacity-75 transition-all cursor-pointer"
                            >
                                <Upload className="w-6 h-6"/>
                            </label>

                            <button
                                type="button"
                                onClick={() => handleDeleteImage(images[currentImageIndex]?.url.split('/').pop())}
                                className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:text-red-300 hover:bg-opacity-75 transition-all"
                            >
                                <Trash2 className="w-6 h-6"/>
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:text-gray-300 hover:bg-opacity-75 transition-all"
                    >
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-white animate-spin"/>
                    </div>
                ) : (
                    <div className="relative h-full">
                        <img
                            key={currentImageIndex}
                            src={loadedImages[currentImageIndex]}
                            alt={`Contract image ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain"
                            style={{opacity: loading ? 0 : 1}}
                        />

                        {loadedImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:text-gray-300 hover:bg-opacity-75 transition-all"
                                >
                                    <ChevronLeft className="w-8 h-8"/>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:text-gray-300 hover:bg-opacity-75 transition-all"
                                >
                                    <ChevronRight className="w-8 h-8"/>
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black bg-opacity-50 text-white">
                            {currentImageIndex + 1} / {loadedImages.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageViewer;