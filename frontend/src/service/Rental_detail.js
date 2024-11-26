import axios from 'axios';

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export const getAllRentalDetail = async () => {
    try {
        const response = await axios.get('http://localhost:8080/rental_details/warehouse?page=0&limit=10', getAuthConfig());
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const updateRentalDetailStatus = async (id, status) => {
    try {
        const response = await axios.put(
            `http://localhost:8080/rental_details/${id}`,
            { status },
            getAuthConfig()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

