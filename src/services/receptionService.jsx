import axios from 'axios';

const API_URL = 'http://localhost:8080/api/reception';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('⚠️ Token manquant dans localStorage');
    }
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const receptionService = {
    getAllReceptions: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ getAllReceptions:', error.response?.data || error.message);
            throw error;
        }
    },

    getReceptionById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ getReceptionById:', error.response?.data || error.message);
            throw error;
        }
    },

    getReceptionByPO: async (numeroPO) => {
        try {
            const response = await axios.get(`${API_URL}/po/${numeroPO}`, getAuthHeader());
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('❌ getReceptionByPO:', error.response?.data || error.message);
            throw error;
        }
    },

    createReception: async (receptionData) => {
        try {
            const response = await axios.post(API_URL, receptionData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ createReception:', error.response?.data || error.message);
            throw error;
        }
    },

    searchReceptions: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/search`, {
                ...getAuthHeader(),
                params
            });
            return response.data;
        } catch (error) {
            console.error('❌ searchReceptions:', error.response?.data || error.message);
            throw error;
        }
    },

    addLine: async (receptionId, lineData) => {
        try {
            const response = await axios.post(`${API_URL}/${receptionId}/lines`, lineData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ addLine:', error.response?.data || error.message);
            throw error;
        }
    },

    updateLine: async (lineId, quantiteRecue, lot, dateExpiration, emplacement) => {
        try {
            const params = { quantiteRecue };
            if (lot) params.lot = lot;
            if (dateExpiration) params.dateExpiration = dateExpiration;
            if (emplacement) params.emplacement = emplacement;
            
            const response = await axios.put(`${API_URL}/lines/${lineId}`, null, {
                ...getAuthHeader(),
                params
            });
            return response.data;
        } catch (error) {
            console.error('❌ updateLine:', error.response?.data || error.message);
            throw error;
        }
    },

    // ✅ Méthode de validation corrigée
   validerReception: async (id) => {
    try {
        console.log('🔍 Validation de la réception ID:', id);
        const response = await axios.put(`${API_URL}/${id}/valider`, {}, getAuthHeader());
        console.log('✅ Réponse validation:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ validerReception:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        // Extraire le message d'erreur du backend s'il existe
        const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la validation';
        throw new Error(errorMessage);
    }
},

    getPutawayTasks: async (receptionId) => {
        try {
            const response = await axios.get(`${API_URL}/${receptionId}/putaway`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ getPutawayTasks:', error.response?.data || error.message);
            throw error;
        }
    },

    getAllPutawayTasks: async () => {
        try {
            const response = await axios.get(`${API_URL}/putaway`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ getAllPutawayTasks:', error.response?.data || error.message);
            throw error;
        }
    }
};