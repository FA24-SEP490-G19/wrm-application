// service/Rental.js
import axios from 'axios';

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getAllRentals = async () => {
    try {
        const response = await axios.get(`https://api.g42.biz/rentals?page=0&limit=100`, getAuthConfig());
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllRentalByManager = async () => {
    try {
        const response = await axios.get(`https://api.g42.biz/rentals/warehouse?page=0&limit=100`, getAuthConfig());
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getLotById = async (id) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/lots/manager/${id}`,
            getAuthConfig()

        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getAllExpiringRentalsForWarehouse = async () => {
    try {
        const response = await axios.get(`https://api.g42.biz/rentals/warehouse/expiring?page=0&limit=100`, getAuthConfig());
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllCustomerId = async () => {
    try {
        const response = await axios.get('https://api.g42.biz/rentals/user?page=0&limit=100', getAuthConfig());
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const getAllSaleId = async () => {
    try {
        const response = await axios.get(`https://api.g42.biz/rentals/sales?page=0&limit=100`, getAuthConfig());
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const getAllManagerId = async () => {
    try {
        const response = await axios.get(`https://api.g42.biz/rental_details/warehouse?page=0&limit=100`, getAuthConfig());
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createRental = async (rentalData) => {
    try {
        return await axios.post(
            'https://api.g42.biz/rentals/create',
            rentalData,
            getAuthConfig()
        );

    } catch (error) {
        throw error;
    }
};

export const updateRentalStatus = async (id, status) => {
    try {
        const response = await axios.put(
            `https://api.g42.biz/rentals/update/${id}`,
            { status },
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const updateRentalSale = async (id, salesId) => {
    try {
        const response = await axios.put(
            `https://api.g42.biz/rentals/update-rental-sales/${id}?salesId=${salesId}`,
            {},  // Empty body since we're passing data via query params
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteRental = async (id) => {
    try {
        const response = await axios.delete(
            `https://api.g42.biz/rentals/delete/${id}`,
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};