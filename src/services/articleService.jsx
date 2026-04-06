import axios from 'axios';

const API_URL = 'http://localhost:8080/api/articles';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) console.warn('⚠️ Token manquant dans localStorage');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Nettoyage GS1
const cleanGS1Code = (code) => {
    if (!code) return '';
    return code.replace(/\u001D/g, '').replace(/[^\x20-\x7E]/g, '').trim();
};

// Extraction GTIN
const extractGTIN = (code) => {
    if (!code) return null;
    let clean = cleanGS1Code(code);
    const gtinMatch = clean.match(/(?:01|\(01\))?(\d{14})/);
    if (gtinMatch) return gtinMatch[1];
    const digitsMatch = clean.match(/\d{13,14}/);
    if (digitsMatch) return digitsMatch[0];
    return null;
};

export const articleService = {
    getAllArticles: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeader());
            console.log('📦 Données reçues du backend:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getAllArticles:', error.response?.data || error.message);
            throw error;
        }
    },

    getArticleById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getArticleById:', error.response?.data || error.message);
            throw error;
        }
    },

    getArticleByCodeERP: async (codeERP) => {
        try {
            const response = await axios.get(`${API_URL}/code/${encodeURIComponent(codeERP)}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getArticleByCodeERP:', error.response?.data || error.message);
            throw error;
        }
    },

    findByGTIN: async (gtin) => {
        try {
            const response = await axios.get(`${API_URL}/gs1/${encodeURIComponent(gtin)}`, getAuthHeader());
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.status === 400) return null;
            console.error('❌ Erreur API findByGTIN:', error.response?.data || error.message);
            throw error;
        }
    },

    findByCode: async (code) => {
        const cleanedCode = cleanGS1Code(code);
        if (!cleanedCode) return null;
        const gtin = extractGTIN(cleanedCode);
        if (gtin) {
            const article = await articleService.findByGTIN(gtin);
            if (article) return article;
        }
        try {
            return await articleService.getArticleByCodeERP(cleanedCode);
        } catch {
            return null;
        }
    },

    // Création d'article – envoie à la fois 'code' et 'codeArticleERP'
    createArticle: async (articleData) => {
        try {
            const codeValue = articleData.code || articleData.codeArticleERP;
            if (!codeValue) {
                throw new Error('Le code de l’article est obligatoire');
            }
            const payload = {
                code: codeValue,
                codeArticleERP: codeValue,
                designation: articleData.designation,
                gtin: articleData.gtin || '',
                numSerie: articleData.numSerie || '',
                description: articleData.description || '',
                category: articleData.category || '',
                uniteMesure: articleData.uniteMesure || '',
                poids: articleData.poids || 0,
                volume: articleData.volume || 0,
                lotDefaut: articleData.lotDefaut || '',
                dureeExpirationJours: articleData.dureeExpirationJours || null,
                actif: articleData.actif !== undefined ? articleData.actif : true,
                prixUnitaire: articleData.prixUnitaire || 0
            };
            console.log('📤 Envoi article avec payload:', payload);
            const response = await axios.post(API_URL, payload, getAuthHeader());
            console.log('✅ Réponse création:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API createArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    // src/services/articleService.jsx – extrait de updateArticle

updateArticle: async (id, articleData) => {
    try {
        const payload = {
            codeArticleERP: articleData.codeArticleERP,   // ← AJOUTÉ
            designation: articleData.designation,
            gtin: articleData.gtin || '',
            numSerie: articleData.numSerie || '',
            description: articleData.description || '',
            category: articleData.category || '',
            uniteMesure: articleData.uniteMesure || '',
            poids: articleData.poids || 0,
            volume: articleData.volume || 0,
            lotDefaut: articleData.lotDefaut || '',
            dureeExpirationJours: articleData.dureeExpirationJours || null,
            actif: articleData.actif !== undefined ? articleData.actif : true,
            prixUnitaire: articleData.prixUnitaire || 0
        };
        console.log('📤 Mise à jour article avec payload:', payload);
        const response = await axios.put(`${API_URL}/${id}`, payload, getAuthHeader());
        console.log('✅ Réponse mise à jour:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur API updateArticle:', error.response?.data || error.message);
        throw error;
    }
},

    activerArticle: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/activer`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API activerArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    desactiverArticle: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/desactiver`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API desactiverArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    deleteArticle: async (id) => {
        try {
            console.log('🗑️ Suppression article id:', id);
            const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
            console.log('✅ Réponse suppression:', response.status, response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API deleteArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    searchArticles: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/search`, {
                ...getAuthHeader(),
                params: params
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API searchArticles:', error.response?.data || error.message);
            throw error;
        }
    }
};

// Exports nommés pour compatibilité avec `import { getAllArticles }`
export const getAllArticles = articleService.getAllArticles;
export const getArticleById = articleService.getArticleById;
export const getArticleByCodeERP = articleService.getArticleByCodeERP;
export const findByGTIN = articleService.findByGTIN;
export const findByCode = articleService.findByCode;
export const createArticle = articleService.createArticle;
export const updateArticle = articleService.updateArticle;
export const activerArticle = articleService.activerArticle;
export const desactiverArticle = articleService.desactiverArticle;
export const deleteArticle = articleService.deleteArticle;
export const searchArticles = articleService.searchArticles;