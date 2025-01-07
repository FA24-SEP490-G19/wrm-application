import axios from "axios";

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getMonthlyRevenueForSales = async (year) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales-dashboard/monthly?year=${year}`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getQuarterlyRevenueForSales = async (year) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales-dashboard/quarterly?year=${year}`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getYearlyRevenueForSales = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales-dashboard/yearly`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getPendingAppointments = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales-dashboard/count/appointments/pending`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getExpiringRentals = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales-dashboard/count/expiring-rentals`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getSignedRentals = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales-dashboard/count/signed-rentals`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getUpcomingAppointments = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales-dashboard/count/upcoming-appointments`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};