// service/Request.js
import axios from 'axios';

const API_URL = 'https://api.g42.biz';

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        'Content-Type': 'application/json'
    }
});

export const getAllRequests = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/requests?page=0&limit=100`,
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyRequests = async (page = 0, limit = 10) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/requests/my-request?page=${page}&limit=${limit}`,
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateRequest = async (id, requestData) => {
    try {
        const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/requests/${id}`,
            {
                status: requestData.status,
                admin_response: requestData.adminResponse // Match the backend field name
            },
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createRequest = async (requestData) => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/requests/create`,
            requestData,
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};



export const deleteRequest = async (id) => {
    try {
        const response = await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/requests/${id}`,
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRequestTypes = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/request-types`,
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};