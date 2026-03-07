import axios from 'axios';

const API_URL = 'http://localhost:8080/api/mouvements';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token utilisé:', token ? 'Présent' : 'Absent');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const mouvementService = {
    entreeStock: async (stockId, quantite, motif, commentaire = '') => {
        try {
            console.log('📦 Appel entreeStock:', { stockId, quantite, motif, commentaire });
            const response = await axios.post(`${API_URL}/entree`, null, {
                ...getAuthHeader(),
                params: { stockId, quantite, motif, commentaire }
            });
            console.log('✅ Réponse entreeStock:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API entreeStock:', error.response?.data || error.message);
            throw error;
        }
    },

    sortieStock: async (stockId, quantite, motif, commentaire = '') => {
        try {
            console.log('📦 Appel sortieStock:', { stockId, quantite, motif, commentaire });
            const response = await axios.post(`${API_URL}/sortie`, null, {
                ...getAuthHeader(),
                params: { stockId, quantite, motif, commentaire }
            });
            console.log('✅ Réponse sortieStock:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API sortieStock:', error.response?.data || error.message);
            throw error;
        }
    },

    transfererStock: async (stockIdSource, emplacementDestination, quantite, motif, commentaire = '') => {
        try {
            console.log('🔄 Appel transfererStock:', { 
                stockIdSource, 
                emplacementDestination, 
                quantite, 
                motif, 
                commentaire 
            });
            
            const response = await axios.post(`${API_URL}/transfert`, null, {
                ...getAuthHeader(),
                params: { 
                    stockIdSource, 
                    emplacementDestination, 
                    quantite, 
                    motif, 
                    commentaire 
                }
            });
            
            console.log('✅ Réponse transfererStock:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API transfererStock:', error);
            
            // Analyse détaillée de l'erreur
            if (error.response) {
                // La requête a été faite et le serveur a répondu avec un code d'erreur
                console.error('📊 Status:', error.response.status);
                console.error('📊 Data:', error.response.data);
                console.error('📊 Headers:', error.response.headers);
                
                // Extraire le message d'erreur du backend
                const errorMessage = error.response.data?.message || 
                                     error.response.data?.error || 
                                     `Erreur ${error.response.status}`;
                throw new Error(errorMessage);
            } else if (error.request) {
                // La requête a été faite mais aucune réponse n'a été reçue
                console.error('📊 Pas de réponse du serveur');
                throw new Error('Le serveur ne répond pas');
            } else {
                // Une erreur s'est produite lors de la configuration de la requête
                console.error('📊 Erreur de configuration:', error.message);
                throw error;
            }
        }
    },

    getMouvementsByStock: async (stockId) => {
        try {
            const response = await axios.get(`${API_URL}/stock/${stockId}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getMouvementsByStock:', error.response?.data || error.message);
            throw error;
        }
    },

    getAllMouvements: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getAllMouvements:', error.response?.data || error.message);
            throw error;
        }
    }
};