import axios from "axios";

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});
export const getAllContract = async () => {
    try {
        return await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/contracts`,
            getAuthConfig()

        );

    } catch (e) {
        throw e;
    }
};

export const getContractById = async (id) => {
    try {
        const response =  await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/contracts/${id}`,
            getAuthConfig()

        );
        return response.data

    } catch (e) {
        throw e;
    }
};


export const updateContract = async (id, data) => {
    return await axios.put(`${import.meta.env.VITE_API_BASE_URL}/contracts/${id}/update`, data,getAuthConfig());
};

export const createContract = async (data) => {
    return await axios.post(`${import.meta.env.VITE_API_BASE_URL}/contracts/create`, data,getAuthConfig());
};

// If you're using axios instead of fetch, you can do it like this:
const uploadContractImagesAxios = async (contractId, imageLinks) => {
    try {
        const response = await axios.post(
            ` https://api.g42.biz/contracts/${contractId}/add-images`,
            {
                contract_img_link: imageLinks
            },
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        console.error('Error uploading images:', error);
        throw error;
    }
};