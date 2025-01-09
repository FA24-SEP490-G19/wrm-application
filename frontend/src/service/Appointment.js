import axios from "axios";

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getAllItems = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/appointments?page=0&limit=100`,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};
export const getAppointmentBySale = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/appointments/sales-appointments?page=0&limit=100`,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};
export const createItem = async (appointmentData) => {
    try {
        return await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/appointments/create`,
            appointmentData,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};

export const updateItem = async (id, appointmentData) => {
    try {
        return await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/appointments/update/${id}`,
            appointmentData,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};

export const deleteItem = async (id) => {
    try {
        return await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/appointments/delete/${id}`,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};

export const getMyAppointment = async () => {
    try {
        const response = await axios.get(
            `http://localhost:8080/appointments/my-appointments?page=0&limit=15`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/users/${id}`,
            getAuthConfig()
        );
        return response.data;
    } catch (e) {
        throw e;
    }
};
export const getWarehouseById = async (id) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/warehouses/${id}`

        );
        return response.data;
    } catch (e) {
        throw e;
    }
};



export const getUpcomingAppointmentsForWarehouse = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/appointments/warehouse/upcoming?page=0&limit=10`,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};

export const createAppointment = async (appointmentData) => {
    try {
        return await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/appointments/customer-create`,
            appointmentData,
            getAuthConfig()
        );
    } catch (e) {
        throw e;
    }
};