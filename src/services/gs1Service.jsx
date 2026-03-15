import axios from 'axios';

const API_URL = 'http://localhost:8080/api/gs1';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Nettoyage renforcé : enlève les caractères de contrôle (ASCII 0-31) et les espaces
const cleanGS1Code = (code) => {
    if (!code) return '';
    // Supprimer tous les caractères de contrôle, garder les imprimables
    return code.replace(/[\x00-\x1F\x7F]/g, '').replace(/\s+/g, '').trim();
};

export const gs1Service = {
    /**
     * Décode un code GS1 et retourne les informations extraites
     * @param {string} gs1Code - Le code GS1 scanné
     */
    decodeGS1: async (gs1Code) => {
        console.log('📤 Envoi du code GS1 au backend:', gs1Code);
        
        // Nettoyer le code (enlever caractères de contrôle)
        const cleaned = cleanGS1Code(gs1Code);
        if (!cleaned) {
            console.warn('⚠️ Code vide après nettoyage');
            return { error: 'Code vide' };
        }

        try {
            const response = await axios.get(`${API_URL}/decode/${encodeURIComponent(cleaned)}`, getAuthHeader());
            console.log('✅ Réponse GS1 reçue:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API decodeGS1:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Message:', error.message);
            
            // Fallback : décodage simple côté client
            console.log('🔧 Utilisation du fallback client');
            return decodeGS1Simple(cleaned);
        }
    }
};

/**
 * Décodeur simple côté client (fallback si backend indisponible)
 */
const decodeGS1Simple = (code) => {
    const result = {};
    
    // Nettoyer le code (enlever parenthèses et espaces)
    let cleanCode = code.replace(/[()]/g, '').replace(/\s/g, '');
    
    // Détecter le format
    if (/^\d{13}$/.test(cleanCode)) {
        result.gtin = cleanCode;
        result.format = 'EAN-13';
    } else if (/^\d{14}$/.test(cleanCode)) {
        result.gtin = cleanCode;
        result.format = 'GTIN-14';
    } else {
        result.format = 'GS1';
        
        // Extraire GTIN (AI 01) - 14 chiffres
        const gtinMatch = cleanCode.match(/01(\d{14})/);
        if (gtinMatch) {
            result.gtin = gtinMatch[1];
        } else {
            // Chercher simplement 13-14 chiffres
            const digitsMatch = cleanCode.match(/\d{13,14}/);
            if (digitsMatch) {
                result.gtin = digitsMatch[0];
            }
        }
        
        // Extraire LOT (AI 10) - jusqu'à 20 caractères alphanumériques
        const lotMatch = cleanCode.match(/10([A-Za-z0-9]{1,20})/);
        if (lotMatch) {
            result.lot = lotMatch[1];
        }
        
        // Extraire date expiration (AI 17) - format YYMMDD
        const expMatch = cleanCode.match(/17(\d{6})/);
        if (expMatch) {
            const expDate = expMatch[1];
            const year = 2000 + parseInt(expDate.substring(0, 2));
            const month = parseInt(expDate.substring(2, 4));
            const day = parseInt(expDate.substring(4, 6));
            result.dateExpiration = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
        
        // Extraire numéro de série (AI 21)
        const snMatch = cleanCode.match(/21([A-Za-z0-9]{1,20})/);
        if (snMatch) {
            result.numSerie = snMatch[1];
        }
        
        // Extraire quantité (AI 30)
        const qtyMatch = cleanCode.match(/30(\d+)/);
        if (qtyMatch) {
            result.quantite = parseInt(qtyMatch[1]);
        }
        
        // Extraire poids (AI 3103)
        const weightMatch = cleanCode.match(/3103(\d{6})/);
        if (weightMatch) {
            result.poids = parseInt(weightMatch[1]) / 1000;
        }
    }
    
    console.log('🔧 Résultat fallback:', result);
    return result;
};