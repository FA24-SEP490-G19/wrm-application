import axios from "axios";
const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getAllItems = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/warehouses?page=0&limit=10`


        )
    } catch (e) {
        throw e;
    }
}

export const getAllItemsByManager = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/warehouses/manager?page=0&limit=10`


        )
    } catch (e) {
        throw e;
    }
}

export const getAllItemAvailable = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/warehouses/available`


        )
    } catch (e) {
        throw e;
    }
}

export const getWareHouseById = async (id) => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/warehouses/${id}`

        )
    } catch (e) {
        throw e;
    }
}

export const createItem = async (info) => {
    try {
        return await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/warehouses/create`,
            info,
            getAuthConfig()

        )
    } catch (e) {
        throw e;
    }
}


export const updateItem = async (id,info) => {
    try {
        return await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/warehouses/update/${id}`,
            info,
            getAuthConfig()

        )
    } catch (e) {
        throw e;
    }
}


export const deleteItem = async (id) => {
    try {
        return await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/warehouses/delete/${id}`,
            getAuthConfig()

        )
    } catch (e) {
        throw e;
    }
}


export const ManagerNotHaveWarehouse = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/users/ManagerNotHaveWarehouse`,
            getAuthConfig()

        )
    } catch (e) {
        throw e;
    }
}
