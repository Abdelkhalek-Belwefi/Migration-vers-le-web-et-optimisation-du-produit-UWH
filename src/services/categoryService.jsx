import axios from 'axios';

const API_URL = 'http://localhost:8080/api/categories';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const categoryService = {
    getAllCategories: async () => {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    },
    getCategoryById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    },
    createCategory: async (category) => {
        const response = await axios.post(API_URL, category, getAuthHeader());
        return response.data;
    },
    updateCategory: async (id, category) => {
        const response = await axios.put(`${API_URL}/${id}`, category, getAuthHeader());
        return response.data;
    },
    deleteCategory: async (id) => {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    }
};