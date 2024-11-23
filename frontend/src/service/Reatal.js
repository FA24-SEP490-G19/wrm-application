// service/Rental.js
import axios from 'axios';

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getAllRentals = async () => {
    try {
        const response = await axios.get('http://localhost:8080/rentals?page=0&limit=10', getAuthConfig());
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createRental = async (rentalData) => {
    try {
        return await axios.post(
            'http://localhost:8080/rentals/create',
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
            `http://localhost:8080/rentals/update/${id}`,
            { status },
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
            `http://localhost:8080/rentals/delete/${id}`,
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};