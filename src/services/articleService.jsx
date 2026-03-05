import axios from 'axios';

const API_URL = 'http://localhost:8080/api/articles';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const articleService = {
    // Récupérer tous les articles
    getAllArticles: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getAllArticles:', error.response?.data || error.message);
            throw error;
        }
    },

    // Récupérer un article par ID
    getArticleById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getArticleById:', error.response?.data || error.message);
            throw error;
        }
    },

    // Récupérer un article par code ERP
    getArticleByCodeERP: async (codeERP) => {
        try {
            const response = await axios.get(`${API_URL}/code/${codeERP}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API getArticleByCodeERP:', error.response?.data || error.message);
            throw error;
        }
    },

    // Créer un article (admin)
    createArticle: async (articleData) => {
        try {
            const response = await axios.post(API_URL, articleData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API createArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    // Mettre à jour un article (admin)
    updateArticle: async (id, articleData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, articleData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API updateArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    // Activer un article (admin)
    activerArticle: async (id) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/activer`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API activerArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    // Désactiver un article (admin)
    desactiverArticle: async (id) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/desactiver`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Erreur API desactiverArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    // Recherche avancée
    searchArticles: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/search`, {
                ...getAuthHeader(),
                params: params
            });
            return response.data;
        } catch (error) {
            console.error('Erreur API searchArticles:', error.response?.data || error.message);
            throw error;
        }
    }
};