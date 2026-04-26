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
            console.error('Erreur API getAllUsers:', error.response?.data || error.message);
            throw error;
        }
    },

    // Mettre à jour le rôle (avec entrepotId optionnel)
    updateUserRole: async (userId, role, entrepotId = null) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/${userId}/role`,
                { role, entrepotId },
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Erreur API updateUserRole:', error.response?.data || error.message);
            throw error;
        }
    },

    // Supprimer un utilisateur
    deleteUser: async (userId) => {
        try {
            await axios.delete(`${API_URL}/users/${userId}`, getAuthHeader());
            return true;
        } catch (error) {
            console.error('Erreur API deleteUser:', error.response?.data || error.message);
            throw error;
        }
    },

    // Activer un compte
    activerCompte: async (userId) => {
        try {
            const response = await axios.put(`${API_URL}/users/${userId}/activer`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API activerCompte:', error.response?.data || error.message);
            throw error;
        }
    },

    // Désactiver un compte
    desactiverCompte: async (userId) => {
        try {
            const response = await axios.put(`${API_URL}/users/${userId}/desactiver`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API desactiverCompte:', error.response?.data || error.message);
            throw error;
        }
    },

    // Récupérer tous les rôles
    getAllRoles: async () => {
        try {
            const response = await axios.get(`${API_URL}/roles`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getAllRoles:', error.response?.data || error.message);
            throw error;
        }
    },

    // Créer un utilisateur (avec entrepotId optionnel)
    createUser: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/users`, userData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API createUser:', error.response?.data || error.message);
            throw error;
        }
    }
};