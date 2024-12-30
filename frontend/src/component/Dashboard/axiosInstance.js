// services/dashboardService.js
import axios from "axios";

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getMonthlyRevenue = async (year) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/admin-dashboard/revenue/monthly?year=${year}`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getQuarterlyRevenue = async (year) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/admin-dashboard/revenue/quarterly?year=${year}`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getYearlyRevenue = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/admin-dashboard/revenue/yearly`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getTopCustomers = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/admin-dashboard/top-customers`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getTopWarehouses = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/admin-dashboard/top-warehouses`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getTopSales = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/admin-dashboard/top-sales`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getPendingRequests = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/admin-dashboard/count/pending-requests`,
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
            `${import.meta.env.VITE_API_BASE_URL}/admin-dashboard/count/expiring-rentals`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};


export const getUnassignedAppointments = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/admin-dashboard/count/unassigned-appointments`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};