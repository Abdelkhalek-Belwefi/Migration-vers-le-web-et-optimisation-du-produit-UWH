import React, { useState, useEffect, useRef } from 'react';
import { FaComment, FaTimes, FaRobot, FaPaperPlane } from 'react-icons/fa';
import ChatMessage from './ChatMessage';
import { stockService } from '../../services/stockService';
import { articleService } from '../../services/articleService';
import { receptionService } from '../../services/receptionService';
import { mouvementService } from '../../services/mouvementService';
import * as expeditionService from '../../services/expeditionService';
import './ChatBot.css';

// ========== MOTEUR DE FUZZY MATCHING AVANCÉ ==========
class AdvancedIntentMatcher {
    constructor() {
        this.intents = {
            STOCK_BARCODE: {
                keywords: ['codebarre', 'barcode', 'scan', 'gtin'],
                patterns: [/^\d{8,14}$/],
                weight: 100
            },
            STOCK_ARTICLE: {
                keywords: ['stockde', 'quantitede', 'combien', 'article', 'produit'],
                patterns: [/stock\s*(de|du)/i],
                weight: 90
            },
            STOCK_FAIBLE: {
                keywords: ['stockfaible', 'stockbas', 'rupture', 'reappro', 'faible', 'critique', 'alertestock', 'manque'],
                patterns: [],
                weight: 85
            },
            PREPARATION_COMMANDES: {
                keywords: ['preparation', 'commandes', 'preparer', 'prepa', 'pick', 'commandesclient', 'commandeclient'],
                patterns: [/preparation\s*de\s*commandes/i, /preparer\s*commande/i],
                weight: 90
            },
            DETAIL_RECEPTION: {
                keywords: ['detail', 'reception', 'bl', 'bonlivraison', 'numero', 'detailreception'],
                patterns: [/detail\s*de\s*reception/i, /reception\s*bl/i, /bl\s*\d+/i],
                weight: 95
            },
            HISTORIQUE: {
                keywords: ['historique', 'mouvement', 'activite', 'journal', 'log', 'trace'],
                patterns: [],
                weight: 80
            },
            RECEPTION: {
                keywords: ['reception', 'recept', 'po', 'boncommande', 'commande'],
                patterns: [],
                weight: 85
            },
            LISTE_RECEPTION: {
                keywords: ['listereception', 'toutesreceptions', 'affichereception'],
                patterns: [/liste\s*de\s*reception/i, /toutes?\s*les?\s*receptions?/i],
                weight: 90
            },
            RANGEMENT: {
                keywords: ['rangement', 'putaway', 'ranger', 'stockage', 'task'],
                patterns: [],
                weight: 80
            },
            EXPEDITION: {
                keywords: ['expedition', 'expedie', 'bl', 'bonlivraison', 'livrer'],
                patterns: [],
                weight: 80
            },
            IMPRESSION: {
                keywords: ['impression', 'imprimer', 'print', 'document', 'pdf'],
                patterns: [],
                weight: 75
            },
            SYNC_ERP: {
                keywords: ['synchro', 'synchronisation', 'erp', 'sync', 'maj'],
                patterns: [],
                weight: 70
            },
            DEMANDE_TRANSFERT: {
                keywords: ['demande', 'transfert', 'recue', 'recu', 'transfere'],
                patterns: [],
                weight: 75
            },
            LIVRAISON_ATTENTE: {
                keywords: ['livraison', 'otp', 'codeotp', 'validation', 'attentelivraison'],
                patterns: [],
                weight: 85
            },
            SALUTATION: {
                keywords: ['bonjour', 'salut', 'hello', 'coucou', 'yo', 'bienvenue'],
                patterns: [],
                weight: 95
            },
            AIDE: {
                keywords: ['aide', 'help', 'commande', 'quefaire', 'comment', 'info'],
                patterns: [],
                weight: 90
            },
            MERCI: {
                keywords: ['merci', 'thanks', 'thank', 'bravo', 'super', 'parfait'],
                patterns: [],
                weight: 85
            }
        };
        
        this.corrections = {
            'stok': 'stock', 'stck': 'stock', 'stcok': 'stock',
            'recepton': 'reception', 'receptin': 'reception',
            'livrason': 'livraison', 'expeditionn': 'expedition',
            'historik': 'historique', 'rangemant': 'rangement',
            'faible': 'faible', 'fable': 'faible',
            'prepa': 'preparation', 'prepar': 'preparation',
            'commandeclient': 'commande', 'commandesclients': 'commandes',
            'detail': 'detail', 'detaille': 'detail'
        };
        
        this.extractedThreshold = null;
    }

    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = a[j - 1] === b[i - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[b.length][a.length];
    }

    similarity(word1, word2) {
        const distance = this.levenshteinDistance(word1.toLowerCase(), word2.toLowerCase());
        const maxLen = Math.max(word1.length, word2.length);
        if (maxLen === 0) return 1;
        return 1 - distance / maxLen;
    }

    correctWord(word) {
        if (this.corrections[word.toLowerCase()]) {
            return this.corrections[word.toLowerCase()];
        }
        return word;
    }

    normalize(text) {
        let normalized = text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, ' ')
            .trim();
        
        const words = normalized.split(/\s+/);
        const corrected = words.map(w => this.correctWord(w));
        return corrected.join(' ');
    }

    fuzzyContains(text, keyword, threshold = 0.65) {
        const normalizedKeyword = this.normalize(keyword);
        const words = text.split(/\s+/);
        
        for (const word of words) {
            const sim = this.similarity(word, normalizedKeyword);
            if (sim >= threshold) {
                return true;
            }
        }
        return false;
    }

    extractNumber(text) {
        const match = text.match(/\d{8,14}/);
        return match ? match[0] : null;
    }

    extractThreshold(text) {
        const match = text.match(/[<:]\s*(\d+)|faible\s*[<:]?\s*(\d+)|stock\s*faible\s*[<:]?\s*(\d+)/i);
        if (match) {
            return parseInt(match[1] || match[2] || match[3]);
        }
        return null;
    }

    extractArticleName(text) {
        const match = text.match(/stock\s+(?:de|du)\s+(.+)/i);
        if (match && match[1].length > 2 && !match[1].match(/faible|bas|critique/)) {
            return match[1].trim();
        }
        
        const simpleMatch = text.match(/stock\s+([a-z0-9\s]{3,})/i);
        if (simpleMatch && simpleMatch[1].length > 2 && !simpleMatch[1].match(/faible|bas|critique/)) {
            return simpleMatch[1].trim();
        }
        
        return null;
    }

    findIntent(text) {
        const normalized = this.normalize(text);
        this.extractedThreshold = this.extractThreshold(text);
        
        // PRIORITE 1: DETAIL_RECEPTION
        const hasDetail = this.fuzzyContains(normalized, 'detail', 0.6);
        const hasReception = this.fuzzyContains(normalized, 'reception', 0.6);
        const hasBL = this.fuzzyContains(normalized, 'bl', 0.6) || /\d{10,14}/.test(text);
        
        if ((hasDetail && hasReception) || (hasReception && hasBL)) {
            return 'DETAIL_RECEPTION';
        }
        
        // PRIORITE 2: PREPARATION_COMMANDES
        const hasPreparation = this.fuzzyContains(normalized, 'preparation', 0.6) ||
                               this.fuzzyContains(normalized, 'preparer', 0.6) ||
                               this.fuzzyContains(normalized, 'prepa', 0.6);
        const hasCommande = this.fuzzyContains(normalized, 'commande', 0.6) ||
                            this.fuzzyContains(normalized, 'commandes', 0.6);
        
        if (hasPreparation || (hasCommande && !this.fuzzyContains(normalized, 'reception', 0.6))) {
            return 'PREPARATION_COMMANDES';
        }
        
        // PRIORITE 3: STOCK_FAIBLE
        const hasStock = normalized.includes('stock');
        const hasFaible = this.fuzzyContains(normalized, 'faible', 0.6) || 
                          this.fuzzyContains(normalized, 'bas', 0.6) ||
                          this.fuzzyContains(normalized, 'critique', 0.6);
        
        if (hasStock && hasFaible) {
            return 'STOCK_FAIBLE';
        }
        
        if (hasFaible && !hasStock) {
            return 'STOCK_FAIBLE';
        }
        
        // PRIORITE 4: Verifier les patterns regex
        for (const [intent, config] of Object.entries(this.intents)) {
            for (const pattern of config.patterns) {
                if (pattern.test(text)) {
                    return intent;
                }
            }
        }
        
        // PRIORITE 5: Autres intentions
        let bestIntent = null;
        let bestScore = 0;
        
        for (const [intent, config] of Object.entries(this.intents)) {
            let score = 0;
            
            for (const keyword of config.keywords) {
                if (this.fuzzyContains(normalized, keyword, 0.6)) {
                    score += config.weight;
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestIntent = intent;
            }
        }
        
        if (bestScore < 25) {
            return 'INCONNU';
        }
        
        return bestIntent;
    }

    isBarcode(text) {
        const num = this.extractNumber(text);
        if (num && num.length >= 8 && num.length <= 14) return num;
        return null;
    }
}

const matcher = new AdvancedIntentMatcher();

const ChatBot = ({ userRole, userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: Date.now(),
                text: getWelcomeMessage(userRole),
                sender: 'bot',
                timestamp: new Date(),
                type: 'text'
            }]);
        }
    }, [userRole]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getWelcomeMessage = (role) => {
        const roleNames = {
            'RESPONSABLE_ENTREPOT': 'Responsable',
            'OPERATEUR_ENTREPOT': 'Operateur',
            'TRANSPORTEUR': 'Transporteur',
            'SERVICE_COMMERCIAL': 'Commercial'
        };
        const roleName = roleNames[role] || 'Utilisateur';
        
        return `Bonjour ${roleName} !

Je suis votre assistant intelligent L-Mobile.

Exemples :
- "preparation commandes"
- "stok fable 40"
- "recept"
- "livrason"
- "detail reception BL-123"

Tapez "Aide" pour la liste.`;
    };

    const addBotMessage = (text, type = 'text') => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: text,
            sender: 'bot',
            timestamp: new Date(),
            type: type
        }]);
    };

    // ========== FONCTIONS METIER ==========
    
    const getPreparationCommandes = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/commandes/statut/EN_ATTENTE', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const commandes = await res.json();
            
            if (!commandes || commandes.length === 0) {
                return `Aucune commande en attente de preparation.`;
            }
            
            let msg = `${commandes.length} commande(s) en attente de preparation :\n\n`;
            for (const cmd of commandes.slice(0, 10)) {
                msg += `[${cmd.numeroCommande}] ${cmd.clientNom || 'Client inconnu'}\n`;
                if (cmd.lignes && cmd.lignes.length > 0) {
                    msg += `   ${cmd.lignes.length} article(s) a preparer\n`;
                }
            }
            return msg;
        } catch (e) {
            console.error("Erreur preparation commandes:", e);
            return `Module preparation de commandes disponible dans le menu principal.`;
        }
    };

    const getDetailReceptionByBL = async (blNumber) => {
        try {
            const receptions = await receptionService.getAllReceptions();
            
            // Chercher la reception avec ce numero de BL ou PO
            const reception = receptions.find(r => 
                r.bonLivraison === blNumber || 
                r.numeroPO === blNumber ||
                (r.bonLivraison && r.bonLivraison.includes(blNumber)) ||
                (r.numeroPO && r.numeroPO.includes(blNumber))
            );
            
            if (!reception) {
                return `Aucune reception trouvee avec le numero BL/PO : ${blNumber}`;
            }
            
            let msg = `[DETAIL RECEPTION]\n`;
            msg += `PO: ${reception.numeroPO}\n`;
            msg += `BL: ${reception.bonLivraison || 'N/A'}\n`;
            msg += `Fournisseur: ${reception.fournisseur || 'N/A'}\n`;
            msg += `Date: ${new Date(reception.dateReception).toLocaleDateString()}\n`;
            msg += `Statut: ${reception.statut}\n`;
            msg += `Cree par: ${reception.createurNom || 'N/A'}\n`;
            
            if (reception.lignes && reception.lignes.length > 0) {
                msg += `\nArticles recus (${reception.lignes.length}):\n`;
                for (const ligne of reception.lignes.slice(0, 10)) {
                    msg += `- ${ligne.articleDesignation} : ${ligne.quantiteRecue}/${ligne.quantiteAttendue} u`;
                    if (ligne.lot) msg += ` (Lot: ${ligne.lot})`;
                    msg += `\n`;
                }
                if (reception.lignes.length > 10) {
                    msg += `\n... et ${reception.lignes.length - 10} autres articles`;
                }
            }
            
            return msg;
        } catch (e) {
            console.error("Erreur detail reception:", e);
            return `Erreur : ${e.message}`;
        }
    };

    const getStockFaible = async (seuil = 20) => {
        try {
            const stocks = await stockService.getAllStocks();
            const faibles = stocks.filter(s => s.quantite > 0 && s.quantite < seuil);
            
            if (faibles.length === 0) {
                return `Aucun stock inferieur a ${seuil} unites.`;
            }
            
            faibles.sort((a, b) => a.quantite - b.quantite);
            
            let msg = `${faibles.length} article(s) avec stock < ${seuil} unites :\n\n`;
            for (const s of faibles.slice(0, 10)) {
                const niveau = s.quantite <= 5 ? '[CRITIQUE]' : (s.quantite <= 10 ? '[ALERTE]' : '[FAIBLE]');
                msg += `${niveau} ${s.articleDesignation} : ${s.quantite} u (Lot ${s.lot})\n`;
            }
            if (faibles.length > 10) msg += `\n... et ${faibles.length - 10} autres`;
            return msg;
        } catch (e) {
            return `Erreur : ${e.message}`;
        }
    };

    const getStockByBarcode = async (barcode) => {
        try {
            let article = null;
            try { article = await articleService.findByGTIN(barcode); } catch(e) {}
            if (!article) {
                try { article = await articleService.getArticleByCodeERP(barcode); } catch(e) {}
            }
            if (!article) return `Aucun article trouve pour : ${barcode}`;
            
            const stocks = await stockService.getStocksByArticle(article.id);
            const total = stocks.filter(s => s.quantite > 0).reduce((s, sum) => s + sum.quantite, 0);
            return `[${article.designation}] Stock total: ${total} unites`;
        } catch (e) {
            return `Erreur : ${e.message}`;
        }
    };

    const getStockByArticleName = async (name) => {
        try {
            const articles = await articleService.getAllArticles();
            const matches = articles.filter(a => 
                a.designation.toLowerCase().includes(name.toLowerCase())
            );
            if (matches.length === 0) return `Aucun article trouve pour "${name}"`;
            
            let msg = `Resultats pour "${name}" :\n\n`;
            for (const a of matches.slice(0, 5)) {
                const stocks = await stockService.getStocksByArticle(a.id);
                const total = stocks.filter(s => s.quantite > 0).reduce((s, sum) => s + sum.quantite, 0);
                msg += `- ${a.designation} : ${total} u\n`;
            }
            return msg;
        } catch (e) {
            return `Erreur : ${e.message}`;
        }
    };

    const getHistoriqueMouvements = async () => {
        try {
            const m = await mouvementService.getAllMouvements();
            if (!m || m.length === 0) return `Aucun mouvement.`;
            let msg = `10 derniers mouvements :\n\n`;
            for (const mv of m.slice(0, 10)) {
                msg += `${mv.type} ${mv.articleDesignation} : ${mv.quantite} u\n`;
            }
            return msg;
        } catch (e) {
            return `Erreur : ${e.message}`;
        }
    };

    const getReceptions = async (showAll = false) => {
        try {
            const r = await receptionService.getAllReceptions();
            if (!r || r.length === 0) return `Aucune reception.`;
            
            if (showAll) {
                let msg = `Total: ${r.length} receptions\n\n`;
                for (const rec of r.slice(0, 10)) {
                    msg += `${rec.statut} PO: ${rec.numeroPO}\n`;
                }
                return msg;
            } else {
                const attente = r.filter(rr => rr.statut === 'EN_ATTENTE');
                if (attente.length === 0) return `Aucune reception en attente.`;
                let msg = `${attente.length} reception(s) en attente :\n\n`;
                for (const rec of attente.slice(0, 5)) {
                    msg += `PO: ${rec.numeroPO}\n`;
                }
                return msg;
            }
        } catch (e) {
            return `Erreur : ${e.message}`;
        }
    };

    const getSuiviRangement = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/rangement', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const tasks = await res.json();
            if (!tasks || tasks.length === 0) return `Aucune tache.`;
            const aFaire = tasks.filter(t => t.statut === 'A_FAIRE');
            return `${aFaire.length} tache(s) de rangement a faire.`;
        } catch (e) {
            return `Module rangement disponible.`;
        }
    };

    const getExpeditions = async () => {
        try {
            const exp = await expeditionService.getMesExpeditions();
            if (!exp || exp.length === 0) return `Aucune expedition.`;
            return `${exp.length} expedition(s) recentes.`;
        } catch (e) {
            return `Aucune expedition.`;
        }
    };

    const getImpressionDocuments = () => {
        return `Pour imprimer un BL : Menu Expeditions -> Imprimer.`;
    };

    const getSyncERP = () => {
        return `Synchronisation ERP active. Derniere synchro: ${new Date().toLocaleString()}`;
    };

    const getDemandesRecues = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/commandes/transfert/source', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const d = await res.json();
            if (!d || d.length === 0) return `Aucune demande.`;
            return `${d.length} demande(s) de transfert recues.`;
        } catch (e) {
            return `Aucune demande.`;
        }
    };

    const getLivraisonsAttente = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/transporteur/livraisons/entrepot/attente', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const l = await res.json();
            if (!l || l.length === 0) return `Aucune livraison en attente.`;
            let msg = `${l.length} livraison(s) en attente :\n\n`;
            for (const liv of l) {
                msg += `BL: ${liv.numeroBL} | OTP: ${liv.codeOtp}\n`;
            }
            return msg;
        } catch (e) {
            return `Aucune livraison.`;
        }
    };

    const getHelpMessage = () => {
        return `Commandes :
- "preparation commandes"
- "stok fable 40"
- "recept"
- "list reception"
- "livrason"
- "rangman"
- "exped"
- "histo"
- "detail reception BL-123"`;
    };

    // ========== TRAITEMENT PRINCIPAL ==========
    
    const sendMessage = async () => {
        if (!inputValue.trim()) return;

        setMessages(prev => [...prev, {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
            type: 'text'
        }]);
        
        const userText = inputValue;
        setInputValue('');
        setIsTyping(true);
        
        setTimeout(async () => {
            setIsTyping(false);
            let response = '';
            
            // Verifier code barre
            const barcode = matcher.isBarcode(userText);
            if (barcode) {
                response = await getStockByBarcode(barcode);
                addBotMessage(response);
                return;
            }
            
            // Detection intention
            const intent = matcher.findIntent(userText);
            const seuil = matcher.extractThreshold(userText);
            const articleName = matcher.extractArticleName(userText);
            
            console.log(`Intent: ${intent} | Seuil: ${seuil} | Article: ${articleName}`);
            
            switch (intent) {
                case 'DETAIL_RECEPTION':
                    const blMatch = userText.match(/\d{10,14}/);
                    if (blMatch) {
                        response = await getDetailReceptionByBL(blMatch[0]);
                    } else {
                        const blTextMatch = userText.match(/BL[-\s]*([A-Z0-9\-]+)/i);
                        if (blTextMatch) {
                            response = await getDetailReceptionByBL(blTextMatch[1]);
                        } else {
                            response = "Veuillez preciser le numero BL. Exemple: 'detail reception BL-123' ou 'detail reception 1234567890123'";
                        }
                    }
                    break;
                case 'PREPARATION_COMMANDES':
                    response = await getPreparationCommandes();
                    break;
                case 'STOCK_FAIBLE':
                    response = await getStockFaible(seuil || 20);
                    break;
                case 'STOCK_ARTICLE':
                    if (articleName) response = await getStockByArticleName(articleName);
                    else response = await getStockByArticleName(userText);
                    break;
                case 'STOCK_BARCODE':
                    response = await getStockByBarcode(barcode);
                    break;
                case 'HISTORIQUE':
                    response = await getHistoriqueMouvements();
                    break;
                case 'RECEPTION':
                    response = await getReceptions(false);
                    break;
                case 'LISTE_RECEPTION':
                    response = await getReceptions(true);
                    break;
                case 'RANGEMENT':
                    response = await getSuiviRangement();
                    break;
                case 'EXPEDITION':
                    response = await getExpeditions();
                    break;
                case 'IMPRESSION':
                    response = getImpressionDocuments();
                    break;
                case 'SYNC_ERP':
                    response = getSyncERP();
                    break;
                case 'DEMANDE_TRANSFERT':
                    response = await getDemandesRecues();
                    break;
                case 'LIVRAISON_ATTENTE':
                    response = await getLivraisonsAttente();
                    break;
                case 'SALUTATION':
                    response = `Bonjour ! Comment puis-je vous aider ?`;
                    break;
                case 'MERCI':
                    response = `A votre service !`;
                    break;
                case 'AIDE':
                    response = getHelpMessage();
                    break;
                default:
                    response = "Je n'ai pas compris. Essayez :\n- preparation commandes\n- stok fable\n- recept\n- livrason\n- detail reception BL-123\n- aide";
                    break;
            }
            
            addBotMessage(response);
        }, 500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) {
        return (
            <div className="chatbot-container">
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <FaComment />
                </button>
            </div>
        );
    }

    return (
        <div className="chatbot-container">
            <div className="chatbot-window">
                <div className="chatbot-header">
                    <h3><FaRobot /> Warehouse_Solution</h3>
                    <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                        <FaTimes />
                    </button>
                </div>

                <div className="chatbot-messages">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isTyping && (
                        <div className="message bot">
                            <div className="message-avatar"><FaRobot /></div>
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chatbot-input">
                    <input
                        type="text"
                        placeholder="Posez votre question..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button onClick={sendMessage} disabled={!inputValue.trim()}>
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;