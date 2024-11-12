import axios from "axios";
const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});
export const login = async (emailAndPassword) => {
    try {
        return await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/users/login`,
            emailAndPassword
        )
    } catch (e) {
        throw e;
    }
}

export const register = async (info) => {
    try {
        return await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/users/register`,
            info
        )
    } catch (e) {
        throw e;
    }
}

export const changePassword = async (info) => {
    try {
        return await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/users/change-password`,
            info,
            getAuthConfig()
        )
    } catch (e) {
        throw e;
    }
}

export const getProfile = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
            getAuthConfig()
        )
    } catch (e) {
        throw e;
    }
}


export const updateProfile = async (info) => {
    try {
        return await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/users/profile`,info,
            getAuthConfig()
        )
    } catch (e) {
        throw e;
    }
}

export const getAllProfile = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/users`,
            getAuthConfig()
        )
    } catch (e) {
        throw e;
    }
}

export const createUser = async (info) => {
    try {
        return await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/users/admin/users`,info,
            getAuthConfig()
        )
    } catch (e) {
        throw e;
    }
}
export const getAllCustomers = async () => {
    try {
        return  await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/users/customers`,
            getAuthConfig()
        );

    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};


export const getAllSales = async () => {
    try {
        return  await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/users/sale`,
            getAuthConfig()
        );

    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/users`,
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
