// services/LotService.js
import axios from "axios";

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getAllLots =   async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/lots?page=0&limit=100`,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};

export const getLotById = async (id) => {
    try {
        const response =  await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/lots/${id}`,
            getAuthConfig()
        );
        return response.data
    } catch (e) {
        throw e;
    }
};

export const createLot = async (lotData) => {
    try {
        return await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/lots/create`,
            lotData,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};


export const deleteLot = async (id) => {
    try {
        return await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/lots/delete/${id}`,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};

export const updateLot = async (id,info) => {
    try {
        return await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/lots/update/${id}`,
            info,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};
