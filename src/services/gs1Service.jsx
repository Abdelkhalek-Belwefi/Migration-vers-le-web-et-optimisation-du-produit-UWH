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

export const gs1Service = {
    /**
     * Décode un code GS1 et retourne les informations extraites
     * @param {string} gs1Code - Le code GS1 scanné
     */
    decodeGS1: async (gs1Code) => {
        console.log('📤 Envoi du code GS1 au backend:', gs1Code);
        
        try {
            // Nettoyer le code (enlever les espaces)
            const cleanCode = encodeURIComponent(gs1Code.trim());
            const response = await axios.get(`${API_URL}/decode/${cleanCode}`, getAuthHeader());
            
            console.log('✅ Réponse GS1 reçue:', response.data);
            return response.data;
            
        } catch (error) {
            console.error('❌ Erreur API decodeGS1:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Message:', error.message);
            
            // Fallback : décodage simple côté client
            console.log('🔧 Utilisation du fallback client');
            return decodeGS1Simple(gs1Code);
        }
    }
};

/**
 * Décodeur simple côté client (fallback si backend indisponible)
 */
const decodeGS1Simple = (code) => {
    const result = {};
    
    // Nettoyer le code
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
        
        // Extraire GTIN (AI 01)
        const gtinMatch = cleanCode.match(/(?:01)?(\d{14})/);
        if (gtinMatch) {
            result.gtin = gtinMatch[1];
        }
        
        // Extraire LOT (AI 10)
        const lotMatch = cleanCode.match(/(?:10)?([A-Za-z0-9]{1,20})/);
        if (lotMatch && !lotMatch[1].match(/^\d{14}$/)) {
            result.lot = lotMatch[1];
        }
        
        // Extraire date expiration (AI 17)
        const expMatch = cleanCode.match(/(?:17)?(\d{6})/);
        if (expMatch) {
            const expDate = expMatch[1];
            const year = 2000 + parseInt(expDate.substring(0, 2));
            const month = parseInt(expDate.substring(2, 4));
            const day = parseInt(expDate.substring(4, 6));
            result.dateExpiration = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
        
        // Extraire quantité (AI 30)
        const qtyMatch = cleanCode.match(/(?:30)?(\d+)/);
        if (qtyMatch && qtyMatch[1].length < 6) {
            result.quantite = parseInt(qtyMatch[1]);
        }
    }
    
    console.log('🔧 Résultat fallback:', result);
    return result;
};