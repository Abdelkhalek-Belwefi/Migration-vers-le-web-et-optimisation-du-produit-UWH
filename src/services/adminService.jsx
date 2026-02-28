import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const adminService = {
    // Récupérer tous les utilisateurs
    getAllUsers: async () => {
        try {
            const response = await axios.get(`${API_URL}/users`, getAuthHeader());
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mettre à jour le rôle
    updateUserRole: async (userId, role) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/${userId}/role`,
                { role },
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Supprimer un utilisateur
    deleteUser: async (userId) => {
        try {
            await axios.delete(`${API_URL}/users/${userId}`, getAuthHeader());
            return true;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Récupérer tous les rôles
    getAllRoles: async () => {
        try {
            const response = await axios.get(`${API_URL}/roles`, getAuthHeader());
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Créer un utilisateur
    createUser: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/users`, userData, getAuthHeader());
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};