import axios from "axios";

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getAvailableLots = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/manager-dashboard/count/lots/available`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getRentedLots = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/manager-dashboard/count/lots/rented`,
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
            `${import.meta.env.VITE_API_BASE_URL}/manager-dashboard/count/appointments/upcoming`,
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
            `${import.meta.env.VITE_API_BASE_URL}/manager-dashboard/count/rentals/expiring`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};