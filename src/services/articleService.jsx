import axios from 'axios';

const API_URL = 'http://localhost:8080/api/articles';

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

/**
 * Nettoie un code GS1 brut en supprimant les caractères de contrôle (ex: séparateur GS \u001D)
 * et ne garde que les caractères imprimables.
 * @param {string} code - Le code brut scanné
 * @returns {string} Code nettoyé
 */
const cleanGS1Code = (code) => {
    if (!code) return '';
    // Enlever le caractère GS (ASCII 29) et autres caractères de contrôle, garder imprimables
    return code.replace(/\u001D/g, '').replace(/[^\x20-\x7E]/g, '').trim();
};

/**
 * Extrait le GTIN (14 chiffres) d'un code GS1 complet
 * @param {string} code - Code GS1 (avec ou sans parenthèses)
 * @returns {string|null} Le GTIN s'il est trouvé, sinon null
 */
const extractGTIN = (code) => {
    if (!code) return null;
    // Nettoyer d'abord
    let clean = cleanGS1Code(code);
    // Chercher (01) suivi de 14 chiffres
    const gtinMatch = clean.match(/(?:01|\(01\))?(\d{14})/);
    if (gtinMatch) {
        return gtinMatch[1];
    }
    // Chercher simplement 13 ou 14 chiffres consécutifs (pour EAN-13 ou GTIN-14)
    const digitsMatch = clean.match(/\d{13,14}/);
    if (digitsMatch) {
        return digitsMatch[0];
    }
    return null;
};

export const articleService = {
    // Récupérer tous les articles
    getAllArticles: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeader());
            console.log('📦 Données reçues du backend:', response.data);
            response.data.forEach(article => {
                console.log(`Article ${article.id}: numSerie =`, article.numSerie);
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getAllArticles:', error.response?.data || error.message);
            throw error;
        }
    },

    // Récupérer un article par ID
    getArticleById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getArticleById:', error.response?.data || error.message);
            throw error;
        }
    },

    // Récupérer un article par code ERP
    getArticleByCodeERP: async (codeERP) => {
        try {
            const response = await axios.get(`${API_URL}/code/${encodeURIComponent(codeERP)}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getArticleByCodeERP:', error.response?.data || error.message);
            throw error;
        }
    },

    // Rechercher un article par GTIN
    findByGTIN: async (gtin) => {
        try {
            const response = await axios.get(`${API_URL}/gs1/${encodeURIComponent(gtin)}`, getAuthHeader());
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('❌ Erreur API findByGTIN:', error.response?.data || error.message);
            throw error;
        }
    },

    // 🔥 MÉTHODE CORRIGÉE : Recherche un article par code scanné (ERP ou GS1) avec extraction du GTIN
    findByCode: async (code) => {
        const cleanedCode = cleanGS1Code(code);
        if (!cleanedCode) {
            console.log('⚠️ Code vide après nettoyage');
            return null;
        }

        console.log('🔍 Recherche article par code nettoyé:', cleanedCode);

        // Étape 1 : essayer d'extraire le GTIN (si c'est un code GS1)
        const gtin = extractGTIN(cleanedCode);
        if (gtin) {
            console.log('🔢 GTIN extrait:', gtin);
            try {
                const article = await articleService.findByGTIN(gtin);
                if (article) {
                    console.log('✅ Article trouvé par GTIN:', article);
                    return article;
                }
            } catch (err) {
                console.error('Erreur recherche par GTIN:', err);
            }
        }

        // Étape 2 : si pas de GTIN ou non trouvé, essayer par code ERP
        try {
            const article = await articleService.getArticleByCodeERP(cleanedCode);
            console.log('✅ Article trouvé par code ERP:', article);
            return article;
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error('Erreur recherche par code ERP:', err);
            }
            // Pas trouvé non plus
        }

        console.log('❌ Aucun article trouvé pour le code:', cleanedCode);
        return null;
    },

    // Créer un article (admin)
    createArticle: async (articleData) => {
        try {
            console.log('📤 Envoi article avec numSerie:', articleData.numSerie);
            const response = await axios.post(API_URL, articleData, getAuthHeader());
            console.log('✅ Réponse création:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API createArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    // Mettre à jour un article (admin)
    updateArticle: async (id, articleData) => {
        try {
            console.log('📤 Mise à jour article avec numSerie:', articleData.numSerie);
            const response = await axios.put(`${API_URL}/${id}`, articleData, getAuthHeader());
            console.log('✅ Réponse mise à jour:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API updateArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    // Activer un article
    activerArticle: async (id) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/activer`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API activerArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    // Désactiver un article
    desactiverArticle: async (id) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/desactiver`, {}, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API desactiverArticle:', error.response?.data || error.message);
            throw error;
        }
    },

    // Supprimer un article (admin)
    deleteArticle: async (id) => {
        try {
            console.log('🗑️ Suppression article id:', id);
            const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
            console.log('✅ Réponse suppression:', response.status, response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API deleteArticle:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Message:', error.message);
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
            console.error('❌ Erreur API searchArticles:', error.response?.data || error.message);
            throw error;
        }
    }
};