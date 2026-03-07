import axios from 'axios';

const API_URL = 'http://localhost:8080/api/stocks';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const stockService = {
    getAllStocks: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getAllStocks:', error.response?.data || error.message);
            throw error;
        }
    },

    getStockById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getStockById:', error.response?.data || error.message);
            throw error;
        }
    },

    getStocksByArticle: async (articleId) => {
        try {
            const response = await axios.get(`${API_URL}/article/${articleId}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getStocksByArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    getStockByLot: async (lot) => {
        try {
            const response = await axios.get(`${API_URL}/lot/${lot}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getStockByLot:', error.response?.data || error.message);
            throw error;
        }
    },

    searchStocks: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/search`, {
                ...getAuthHeader(),
                params
            });
            return response.data;
        } catch (error) {
            console.error('Erreur API searchStocks:', error.response?.data || error.message);
            throw error;
        }
    },

    augmenterQuantite: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/augmenter`, null, {
                ...getAuthHeader(),
                params: data
            });
            return response.data;
        } catch (error) {
            console.error('Erreur API augmenterQuantite:', error.response?.data || error.message);
            throw error;
        }
    },

    diminuerQuantite: async (stockId, quantite) => {
        try {
            const response = await axios.post(`${API_URL}/diminuer`, null, {
                ...getAuthHeader(),
                params: { stockId, quantite }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur API diminuerQuantite:', error.response?.data || error.message);
            throw error;
        }
    },

    changerStatut: async (id, statut) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/statut?statut=${statut}`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API changerStatut:', error.response?.data || error.message);
            throw error;
        }
    }
};