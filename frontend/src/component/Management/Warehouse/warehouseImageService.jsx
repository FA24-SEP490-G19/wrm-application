// services/WarehouseImageService.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const warehouseImageService = {
    getImages: async (warehouseId) => {
        const response = await axios.get(`${BASE_URL}/warehouses/${warehouseId}/images`, getAuthConfig());
        return response.data;
    },

    addImages: async (warehouseId, base64Images) => {
        const response = await axios.post(
            `${BASE_URL}/warehouses/${warehouseId}/images`,
            base64Images,
            getAuthConfig()
        );
        return response.data;
    },

    deleteImage: async (warehouseId, imageId) => {
        await axios.delete(
            `${BASE_URL}/warehouses/${warehouseId}/images/${imageId}`,
            getAuthConfig()
        );
    },

    updateImages: async (warehouseId, base64Images) => {
        const response = await axios.put(
            `${BASE_URL}/warehouses/${warehouseId}/images`,
            base64Images,
            getAuthConfig()
        );
        return response.data;
    }
};