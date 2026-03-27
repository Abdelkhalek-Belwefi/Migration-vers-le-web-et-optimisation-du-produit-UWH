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
            console.error('❌ Erreur API decodeGS1:', error);
            // Fallback : décodage simple côté client
            console.log('🔧 Utilisation du fallback client');
            return decodeGS1Simple(cleaned);
        }
    }
};

/**
 * Décodeur simple côté client (fallback si backend indisponible)
 * CORRECTION : extraction plus fiable du lot (AI 10) avec ou sans parenthèses
 */
const decodeGS1Simple = (code) => {
    const result = {};
    
    let cleanCode = code;
    
    // Détecter le format
    if (/^\d{13}$/.test(cleanCode)) {
        result.gtin = cleanCode;
        result.format = 'EAN-13';
        return result;
    } else if (/^\d{14}$/.test(cleanCode)) {
        result.gtin = cleanCode;
        result.format = 'GTIN-14';
        return result;
    }
    
    result.format = 'GS1';
    
    // Extraire GTIN (AI 01) - 14 chiffres
    const gtinMatch = cleanCode.match(/\(01\)(\d{14})/);
    if (gtinMatch) {
        result.gtin = gtinMatch[1];
    } else {
        // Chercher simplement 13-14 chiffres
        const digitsMatch = cleanCode.match(/\d{13,14}/);
        if (digitsMatch) {
            result.gtin = digitsMatch[0];
        }
    }
    
    // 🔥 CORRECTION LOT : gérer les cas avec parenthèses ou sans parenthèses
    // Cas 1 : entre parenthèses (10)...
    let lotMatch = cleanCode.match(/\(10\)([^\(]+)/);
    if (lotMatch) {
        let lot = lotMatch[1].trim();
        lot = lot.replace(/[\x00-\x1F\x7F]/g, '').trim();
        result.lot = lot;
        console.log('📦 Lot extrait (avec parenthèses):', result.lot);
    } else {
        // Cas 2 : pas de parenthèses, rechercher "10" après la position du GTIN
        let startSearch = 0;
        if (result.gtin) {
            const gtinStart = cleanCode.indexOf(result.gtin);
            if (gtinStart !== -1) {
                startSearch = gtinStart + result.gtin.length;
            }
        }
        const ai10Index = cleanCode.indexOf('10', startSearch);
        if (ai10Index !== -1) {
            // Trouver la prochaine occurrence de deux chiffres qui pourrait être un AI,
            // en ignorant le "10" courant
            let nextAI = cleanCode.length;
            for (let i = ai10Index + 2; i < cleanCode.length - 1; i++) {
                const possibleAI = cleanCode.substr(i, 2);
                // Liste des AI courants (01, 10, 11, 17, 21, 30)
                if (possibleAI === '01' || possibleAI === '10' || possibleAI === '11' || 
                    possibleAI === '17' || possibleAI === '21' || possibleAI === '30') {
                    // On ignore le "10" lui-même
                    if (possibleAI === '10') continue;
                    nextAI = i;
                    break;
                }
            }
            const lot = cleanCode.substring(ai10Index + 2, nextAI).trim();
            if (lot && lot.length > 0 && lot !== result.gtin) {
                result.lot = lot;
                console.log('📦 Lot extrait (sans parenthèses):', result.lot);
            }
        }
    }
    
    // Extraire date expiration (AI 17) - format YYMMDD
    const expMatch = cleanCode.match(/\(17\)(\d{6})/);
    if (expMatch) {
        const expDate = expMatch[1];
        const year = 2000 + parseInt(expDate.substring(0, 2));
        const month = parseInt(expDate.substring(2, 4));
        const day = parseInt(expDate.substring(4, 6));
        result.dateExpiration = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } else {
        // Rechercher "17" suivi de 6 chiffres sans parenthèses
        const expIndex = cleanCode.indexOf('17');
        if (expIndex !== -1 && cleanCode.length >= expIndex + 8) {
            const expDate = cleanCode.substring(expIndex + 2, expIndex + 8);
            if (/^\d{6}$/.test(expDate)) {
                const year = 2000 + parseInt(expDate.substring(0, 2));
                const month = parseInt(expDate.substring(2, 4));
                const day = parseInt(expDate.substring(4, 6));
                result.dateExpiration = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
        }
    }
    
    // Extraire numéro de série (AI 21)
    const snMatch = cleanCode.match(/\(21\)([^\(]+)/);
    if (snMatch) {
        result.numSerie = snMatch[1].trim();
    }
    
    // Extraire quantité (AI 30)
    const qtyMatch = cleanCode.match(/\(30\)(\d+)/);
    if (qtyMatch) {
        result.quantite = parseInt(qtyMatch[1]);
    }
    
    // Extraire poids (AI 3103)
    const weightMatch = cleanCode.match(/\(3103\)(\d{6})/);
    if (weightMatch) {
        result.poids = parseInt(weightMatch[1]) / 1000;
    }
    
    console.log('🔧 Résultat fallback:', result);
    return result;
};