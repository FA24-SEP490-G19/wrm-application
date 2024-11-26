import axios from "axios";

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getAllFeedback = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/feedback`,
            getAuthConfig()

        );

    } catch (e) {
        throw e;
    }
};


export const getMyFeedback = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/feedback/customer`,
            getAuthConfig()

        );

    } catch (e) {
        throw e;
    }
};