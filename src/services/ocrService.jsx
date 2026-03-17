import axios from 'axios';

const API_URL = 'http://localhost:8080/api/ocr';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    };
};

export const ocrService = {
    /**
     * Extrait le texte d'une image de document (bon de livraison, facture, etc.)
     * @param {File} imageFile - Le fichier image scanné
     * @returns {Promise<Object>} Les informations extraites (numéro PO, fournisseur, etc.)
     */
    extractDocumentInfo: async (imageFile) => {
        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            const response = await axios.post(`${API_URL}/extract`, formData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('❌ Erreur OCR:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Analyse un code-barres de document (GS1, QR code, etc.)
     * @param {string} barcode - Le code scanné
     * @returns {Promise<Object>} Les informations extraites
     */
    decodeDocumentBarcode: async (barcode) => {
        try {
            const response = await axios.get(`${API_URL}/decode/${encodeURIComponent(barcode)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur décodage code-barres:', error.response?.data || error.message);
            throw error;
        }
    }
};