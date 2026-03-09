import axios from 'axios';

const API_URL = 'http://localhost:8080/api/rangement';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const rangementService = {
    // Récupérer les tâches à faire
    getTasksAFaire: async () => {
        try {
            const response = await axios.get(`${API_URL}/a-faire`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getTasksAFaire:', error.response?.data || error.message);
            throw error;
        }
    },

    // Récupérer toutes les tâches (pour supervision)
    getAllTasks: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getAllTasks:', error.response?.data || error.message);
            throw error;
        }
    },

    // Récupérer les tâches par statut
    getTasksByStatut: async (statut) => {
        try {
            const response = await axios.get(`${API_URL}/statut/${statut}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getTasksByStatut:', error.response?.data || error.message);
            throw error;
        }
    },

    // Commencer une tâche
    commencerTask: async (id) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/commencer`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API commencerTask:', error.response?.data || error.message);
            throw error;
        }
    },

    // Terminer une tâche
    terminerTask: async (id, emplacementReel = null) => {
        try {
            const params = emplacementReel ? { emplacementReel } : {};
            const response = await axios.put(`${API_URL}/${id}/terminer`, null, {
                ...getAuthHeader(),
                params
            });
            return response.data;
        } catch (error) {
            console.error('Erreur API terminerTask:', error.response?.data || error.message);
            throw error;
        }
    }
};