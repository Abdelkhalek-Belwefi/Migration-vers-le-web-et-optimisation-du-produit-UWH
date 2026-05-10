import axios from 'axios';

const API_URL = 'http://localhost:8080/api/previsions';

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const previsionService = {
    /**
     * Récupère les prévisions de charge pour les 7 prochains jours
     */
    getPrevisions7Jours: async () => {
        try {
            const response = await axios.get(`${API_URL}/charge/7jours`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur chargement prévisions:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Rafraîchit le cache des prévisions (force un recalcul)
     */
    refreshPrevisions: async () => {
        try {
            const response = await axios.post(`${API_URL}/refresh`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur rafraîchissement prévisions:', error.response?.data || error.message);
            throw error;
        }
    }
};