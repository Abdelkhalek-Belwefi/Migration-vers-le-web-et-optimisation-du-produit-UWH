import React, { useState, useEffect, useRef } from 'react';
import { FaComment, FaTimes, FaRobot, FaPaperPlane } from 'react-icons/fa';
import ChatMessage from './ChatMessage';
import QuickCommands from './QuickCommands';
import { stockService } from '../../services/stockService';
import { articleService } from '../../services/articleService';
import { receptionService } from '../../services/receptionService';
import { mouvementService } from '../../services/mouvementService';
import * as expeditionService from '../../services/expeditionService';
import { getAllClients } from '../../services/clientService';
import { getCommandesTransfertRecues } from '../../services/commandeService';
import './ChatBot.css';

// ========== MOTEUR DE FUZZY MATCHING ==========
class AdvancedIntentMatcher {
    constructor() {
        this.intents = {
            STOCK_BARCODE: { keywords: ['codebarre', 'barcode', 'scan', 'gtin'], patterns: [/^\d{8,14}$/], weight: 100 },
            STOCK_ARTICLE: { keywords: ['stockde', 'quantitede', 'combien', 'article', 'produit', 'stock'], patterns: [/stock\s*(de|du)/i], weight: 90 },
            STOCK_FAIBLE: { keywords: ['stockfaible', 'stockbas', 'rupture', 'reappro', 'faible', 'critique', 'alertestock', 'manque'], patterns: [], weight: 85 },
            PREPARATION_COMMANDES: { keywords: ['preparation', 'commandes', 'preparer', 'prepa', 'pick', 'a expedier'], patterns: [/preparation\s*de\s*commandes/i], weight: 90 },
            COMMANDES_A_EXPEDIER: { keywords: ['commandes a expédier', 'commandes à expédier', 'a expédier', 'à expédier', 'expeditions', 'expéditions'], patterns: [], weight: 90 },
            RECEPTION: { keywords: ['reception', 'recept', 'po'], patterns: [], weight: 85 },
            LISTE_RECEPTION: { keywords: ['listereception', 'list reception'], patterns: [/liste\s*de\s*reception/i], weight: 90 },
            RANGEMENT_A_FAIRE: { keywords: ['rangement a faire'], patterns: [], weight: 85 },
            RANGEMENT_EN_COURS: { keywords: ['rangement en cours'], patterns: [], weight: 85 },
            RANGEMENT_TERMINE: { keywords: ['rangement termine'], patterns: [], weight: 85 },
            EXPEDITION: { keywords: ['expedition', 'expedie'], patterns: [], weight: 80 },
            DEMANDE_TRANSFERT: { keywords: ['demandes recues', 'transfert recu'], patterns: [], weight: 75 },
            LIVRAISON_ATTENTE: { keywords: ['livraisons attente'], patterns: [], weight: 85 },
            LIVRAISONS_ASSIGNEES: { keywords: ['livraisons assignees'], patterns: [], weight: 85 },
            RAPIDE: { keywords: ['rapide', 'commandes rapides', 'menu rapide', 'boutons'], patterns: [/^rapide$/, /^boutons$/], weight: 95 },
            SALUTATION: { keywords: ['bonjour', 'salut', 'hello'], patterns: [], weight: 95 },
            AIDE: { keywords: ['aide', 'help'], patterns: [], weight: 90 },
            MERCI: { keywords: ['merci', 'thanks'], patterns: [], weight: 85 },
            LISTE_CLIENTS: { keywords: ['clients'], patterns: [], weight: 85 },
            CLIENT_EMAIL: { keywords: ['client email'], patterns: [], weight: 85 }
        };
        
        this.corrections = {
            'stok': 'stock', 'recepton': 'reception', 'livrason': 'livraison',
            'historik': 'historique', 'rangemant': 'rangement', 'prepa': 'preparation'
        };
    }

    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = a[j - 1] === b[i - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i-1][j] + 1, matrix[i][j-1] + 1, matrix[i-1][j-1] + cost);
            }
        }
        return matrix[b.length][a.length];
    }

    similarity(word1, word2) {
        const distance = this.levenshteinDistance(word1.toLowerCase(), word2.toLowerCase());
        const maxLen = Math.max(word1.length, word2.length);
        return maxLen === 0 ? 1 : 1 - distance / maxLen;
    }

    normalize(text) {
        let normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/g, ' ').trim();
        return normalized.split(/\s+/).map(w => this.corrections[w] || w).join(' ');
    }

    fuzzyContains(text, keyword, threshold = 0.65) {
        const words = this.normalize(text).split(/\s+/);
        const normKeyword = this.normalize(keyword);
        return words.some(word => this.similarity(word, normKeyword) >= threshold);
    }

    extractNumber(text) { return text.match(/\d{8,14}/)?.[0] || null; }
    extractThreshold(text) { return text.match(/[<:]\s*(\d+)|faible\s*[<:]?\s*(\d+)/i)?.[1] || null; }
    extractArticleName(text) { return text.match(/stock\s+(?:de|du)\s+(.+)/i)?.[1]?.trim() || null; }
    extractClientEmail(text) { return text.match(/client email\s+([^\s]+@[^\s]+)/i)?.[1] || null; }

    findIntent(text) {
        const normalized = this.normalize(text);
        
        // RAPIDE doit afficher les boutons (QuickCommands)
        if (normalized === 'rapide' || normalized === 'boutons' || normalized.includes('commandes rapides') || normalized.includes('menu rapide')) {
            return 'RAPIDE';
        }
        
        if (normalized.includes('rangement a faire')) return 'RANGEMENT_A_FAIRE';
        if (normalized.includes('rangement en cours')) return 'RANGEMENT_EN_COURS';
        if (normalized.includes('rangement termine')) return 'RANGEMENT_TERMINE';
        if (normalized.includes('demandes recues')) return 'DEMANDE_TRANSFERT';
        if (normalized.includes('livraisons assignees')) return 'LIVRAISONS_ASSIGNEES';
        if (normalized.includes('livraisons attente')) return 'LIVRAISON_ATTENTE';
        if (normalized.includes('clients')) return 'LISTE_CLIENTS';
        if (normalized.includes('client email')) return 'CLIENT_EMAIL';
        
        // Détection pour COMMANDES_A_EXPEDIER (responsable)
        if (this.fuzzyContains(normalized, 'expédier') || this.fuzzyContains(normalized, 'a expédier') || normalized.includes('commandes a expédier')) {
            return 'COMMANDES_A_EXPEDIER';
        }
        
        if (this.fuzzyContains(normalized, 'preparation') || this.fuzzyContains(normalized, 'commande')) return 'PREPARATION_COMMANDES';
        
        if (normalized.includes('stock')) {
            if (this.fuzzyContains(normalized, 'faible') || this.fuzzyContains(normalized, 'bas')) return 'STOCK_FAIBLE';
            return 'STOCK_ARTICLE';
        }
        
        if (this.fuzzyContains(normalized, 'reception')) return 'RECEPTION';
        if (normalized.includes('list reception')) return 'LISTE_RECEPTION';
        if (this.fuzzyContains(normalized, 'expedition')) return 'EXPEDITION';
        
        if (this.fuzzyContains(normalized, 'bonjour')) return 'SALUTATION';
        if (this.fuzzyContains(normalized, 'merci')) return 'MERCI';
        if (this.fuzzyContains(normalized, 'aide')) return 'AIDE';
        
        return 'INCONNU';
    }

    isBarcode(text) { const num = this.extractNumber(text); return num && num.length >= 8 && num.length <= 14 ? num : null; }
}

const matcher = new AdvancedIntentMatcher();

const ChatBot = ({ userRole, userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickCommands, setShowQuickCommands] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ id: Date.now(), text: getWelcomeMessage(userRole), sender: 'bot', timestamp: new Date(), type: 'text' }]);
        }
    }, [userRole]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const getWelcomeMessage = (role) => {
        const roleNames = {
            'RESPONSABLE_ENTREPOT': 'Responsable d\'entrepôt',
            'OPERATEUR_ENTREPOT': 'Opérateur',
            'TRANSPORTEUR': 'Transporteur',
            'SERVICE_COMMERCIAL': 'Commercial',
            'ADMINISTRATEUR': 'Administrateur'
        };
        return `🌟 Bonjour ${roleNames[role] || 'Utilisateur'} ! 🌟

Je suis WMS Smart-Assist , votre assistant intelligent dédié à la gestion d'entrepôt.

📋 Tapez "rapide" pour voir les boutons de commandes rapides.
❓ Tapez "aide" pour obtenir la liste détaillée des commandes.`;
    };

    const checkPermission = (allowedRoles) => {
        if (!allowedRoles.includes(userRole)) {
            const roleNames = {
                'RESPONSABLE_ENTREPOT': 'Responsable d\'entrepôt',
                'OPERATEUR_ENTREPOT': 'Opérateur',
                'TRANSPORTEUR': 'Transporteur',
                'SERVICE_COMMERCIAL': 'Commercial',
                'ADMINISTRATEUR': 'Administrateur'
            };
            return `⛔ ACCÈS NON AUTORISÉ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 Vous êtes connecté en tant que : **${roleNames[userRole] || userRole}**

❌ Cette fonctionnalité est réservée aux : **${allowedRoles.map(r => roleNames[r] || r).join(' ou ')}**

💡 Tapez "aide" pour voir vos commandes disponibles.`;
        }
        return null;
    };

    // ========== AIDE TEXTUELLE (commande "aide") ==========
    const getHelpByRole = (role) => {
        const helps = {
            'RESPONSABLE_ENTREPOT': `COMMANDES DISPONIBLES (Responsable d'entrepôt)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 GESTION DES STOCKS
• "stock" → Vue d'ensemble des stocks
• "stock de [code article]" → Stock d'un article spécifique
• "stok fable [seuil]" → Stocks sous seuil (ex: stok fable 20)

EXPÉDITIONS
• "commandes a expédier" → Commandes prêtes à être expédiées (statut VALIDEE)

RÉCEPTIONS
• "recept" → Réceptions en attente
• "list reception" → Liste complète des réceptions

TRANSFERTS & RANGEMENT
• "demandes recues" → Demandes de transfert reçues
• "rangement a faire" → Tâches de rangement à faire
• "rangement en cours" → Tâches en cours
• "rangement termine" → Tâches terminées

AUTRES
• "rapide" → Afficher les boutons de commandes rapides
• "aide" → Cette aide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Exemple : "commandes a expédier"`,

            'OPERATEUR_ENTREPOT': `📋 **COMMANDES DISPONIBLES** (Opérateur)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 RANGEMENT
• "rangement a faire" → Tâches à faire
• "rangement en cours" → Tâches en cours
• "rangement termine" → Tâches terminées

LIVRAISONS
• "livraisons attente" → Livraisons en attente

COMMANDES
• "preparation commandes" → Commandes client à préparer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,

            'TRANSPORTEUR': `COMMANDES DISPONIBLES (Transporteur)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIVRAISONS
• "livraisons assignees" → Mes livraisons en cours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,

            'SERVICE_COMMERCIAL': `📋 COMMANDES DISPONIBLES (Service Commercial)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESTION DES CLIENTS
• "clients" → Liste des clients
• "client email [email]" → Rechercher un client par email

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        };
        return helps[role] || helps['RESPONSABLE_ENTREPOT'];
    };

    const addBotMessage = (text) => {
        setMessages(prev => [...prev, { id: Date.now(), text: text, sender: 'bot', timestamp: new Date(), type: 'text' }]);
    };

    const handleQuickCommand = (command) => {
        setShowQuickCommands(false);
        setMessages(prev => [...prev, { id: Date.now(), text: command, sender: 'user', timestamp: new Date(), type: 'text' }]);
        setTimeout(() => processCommand(command), 100);
    };

    // ========== AFFICHER LES BOUTONS (commande "rapide") ==========
    const showButtons = () => {
        setShowQuickCommands(true);
        setTimeout(() => {
            setShowQuickCommands(true);
        }, 100);
    };

    // ========== NOUVELLE FONCTION : Commandes à expédier pour le responsable ==========
    const getCommandesAExpedier = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/commandes/a-expedier', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const commandes = await res.json();
            
            if (!commandes || commandes.length === 0) {
                return `COMMANDES À EXPÉDIER

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Aucune commande prête à être expédiée.

Toutes les commandes préparées ont déjà été expédiées.`;
            }
            
            let msg = `🚚 **COMMANDES À EXPÉDIER (${commandes.length})**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            for (const cmd of commandes.slice(0, 10)) {
                msg += `┌ N° ${cmd.numeroCommande}\n`;
                msg += `├ Client : ${cmd.clientNom || 'Client inconnu'}\n`;
                msg += `├ Date : ${new Date(cmd.dateCommande).toLocaleDateString()}\n`;
                msg += `└ Articles : ${cmd.lignes?.length || 0} article(s)\n\n`;
            }
            
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Accédez au module "Expéditions" pour expédier ces commandes.`;
            return msg;
        } catch (e) {
            return `🚚 Service expéditions disponible dans le menu principal.`;
        }
    };

    // ========== FONCTIONS MÉTIER ==========
    
    const getStockByBarcode = async (barcode) => {
        try {
            let article = null;
            try { article = await articleService.findByGTIN(barcode); } catch(e) {}
            if (!article) try { article = await articleService.getArticleByCodeERP(barcode); } catch(e) {}
            if (!article) return `Aucun article trouvé

Aucun article ne correspond au code-barres : \`${barcode}\`

💡 Vérifiez que le code-barres est lisible et que l'article existe dans la base.`;
            
            const stocks = await stockService.getStocksByArticle(article.id);
            const total = stocks.filter(s => s.quantite > 0).reduce((s, sum) => s + sum.quantite, 0);
            const emplacements = stocks.filter(s => s.quantite > 0).map(s => `${s.emplacement} (${s.quantite} u)`).join(', ');
            
            return `RECHERCHE PAR CODE-BARRES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE TROUVÉ
• Désignation : ${article.designation}
• Code ERP : ${article.codeArticleERP}
• GTIN : ${article.gtin || 'Non spécifié'}

STOCK TOTAL
• Quantité : ${total} unités
• Emplacements : ${emplacements || 'Aucun'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        } catch (e) { return `Erreur : ${e.message}`; }
    };

    const getStockByArticleName = async (name) => {
        try {
            const articles = await articleService.getAllArticles();
            const matches = articles.filter(a => 
                a.designation.toLowerCase().includes(name.toLowerCase()) ||
                (a.codeArticleERP && a.codeArticleERP.toLowerCase().includes(name.toLowerCase()))
            );
            
            if (matches.length === 0) return `❌ **Aucun article trouvé**

Aucun article ne correspond à : \`${name}\`

💡 Suggestions : Vérifiez l'orthographe ou utilisez le code article (ex: ART-001)`;
            
            let msg = `RECHERCHE STOCK

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Recherche : "${name}"
📊 Résultats : ${matches.length} article(s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            for (const a of matches.slice(0, 5)) {
                const stocks = await stockService.getStocksByArticle(a.id);
                const total = stocks.filter(s => s.quantite > 0).reduce((s, sum) => s + sum.quantite, 0);
                msg += `📌 **${a.designation}**\n`;
                msg += `   Code : ${a.codeArticleERP}\n`;
                msg += `   Stock : ${total} unités\n\n`;
            }
            
            if (matches.length > 5) msg += `... et ${matches.length - 5} autres articles\n\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Tapez "stock de [code]" pour plus de détails.`;
            return msg;
        } catch (e) { return `❌ **Erreur** : ${e.message}`; }
    };

    const getAllStocksSummary = async () => {
        try {
            const stocks = await stockService.getAllStocks();
            const articlesUniques = [...new Set(stocks.map(s => s.articleId))].length;
            const totalQuantite = stocks.reduce((sum, s) => sum + s.quantite, 0);
            const emplacementsUtilises = [...new Set(stocks.map(s => s.emplacement))].length;
            
            return `RÉCAPITULATIF DES STOCKS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 **INFORMATIONS GÉNÉRALES**
• Références distinctes : ${articlesUniques}
• Unités totales : ${totalQuantite}
• Emplacements utilisés : ${emplacementsUtilises}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 **Pour voir le stock d'un article spécifique** :
   Tapez "stock de [code article]"
   Exemple : \`stock de ART-001\`

⚠️ **Pour voir les stocks faibles** :
   Tapez "stok fable [seuil]"
   Exemple : \`stok fable 20\``;
        } catch (e) { return `📊 Service stocks disponible dans le menu "Consultation Stock".`; }
    };

    const getStockFaible = async (seuil = 20) => {
        try {
            const stocks = await stockService.getAllStocks();
            const faibles = stocks.filter(s => s.quantite > 0 && s.quantite < seuil);
            
            if (faibles.length === 0) return `✅ **STOCKS SAINS**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aucun stock inférieur à ${seuil} unités.

Tous les stocks sont suffisants.`;
            
            faibles.sort((a, b) => a.quantite - b.quantite);
            const critiques = faibles.filter(s => s.quantite <= 10).length;
            const alertes = faibles.filter(s => s.quantite > 10 && s.quantite <= seuil).length;
            
            let msg = `⚠️ **ALERTE STOCKS FAIBLES**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **RÉSUMÉ**
• Stock critique (≤10) : ${critiques} article(s)
• Stock faible (<${seuil}) : ${alertes} article(s)
• **Total** : ${faibles.length} article(s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            for (const s of faibles.slice(0, 10)) {
                const niveau = s.quantite <= 5 ? '🔴 CRITIQUE' : (s.quantite <= 10 ? '🟠 ALERTE' : '🟡 FAIBLE');
                msg += `📌 **${s.articleDesignation}**\n`;
                msg += `   ${niveau}\n`;
                msg += `   Quantité : ${s.quantite} unités\n`;
                msg += `   Lot : ${s.lot}\n`;
                msg += `   Emplacement : ${s.emplacement}\n\n`;
            }
            
            if (faibles.length > 10) msg += `... et ${faibles.length - 10} autres articles\n\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Action recommandée : Déclarez un besoin de réapprovisionnement.`;
            return msg;
        } catch (e) { return `❌ **Erreur** : ${e.message}`; }
    };

    const getPreparationCommandes = async () => {
        try {
            const [clientRes, transfertRes] = await Promise.all([
                fetch('http://localhost:8080/api/commandes/statut/EN_ATTENTE', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
                fetch('http://localhost:8080/api/commandes/transfert/preparer', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            ]);
            const commandesClient = await clientRes.json();
            const commandesTransfert = await transfertRes.json();
            const totalClient = commandesClient?.length || 0;
            const totalTransfert = commandesTransfert?.length || 0;
            const total = totalClient + totalTransfert;
            
            if (total === 0) return `📦 **COMMANDES À PRÉPARER**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Aucune commande en attente de préparation.

Toutes les commandes ont été traitées.`;
            
            let msg = `📦 **COMMANDES À PRÉPARER**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **RÉSUMÉ**
• Commandes client : ${totalClient}
• Transferts : ${totalTransfert}
• **Total** : ${total}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            if (totalClient > 0) {
                msg += `**📋 COMMANDES CLIENT (${totalClient})**\n`;
                for (const cmd of commandesClient.slice(0, 10)) {
                    msg += `\n┌ **N° ${cmd.numeroCommande}**\n`;
                    msg += `├ Client : ${cmd.clientNom || 'Client inconnu'}\n`;
                    msg += `├ Date : ${new Date(cmd.dateCommande).toLocaleDateString()}\n`;
                    msg += `└ Articles : ${cmd.lignes?.length || 0} article(s)\n`;
                }
                if (totalClient > 10) msg += `\n... et ${totalClient - 10} autres commandes client\n`;
            }
            
            if (totalTransfert > 0) {
                msg += `\n**🔄 TRANSFERTS (${totalTransfert})**\n`;
                for (const cmd of commandesTransfert.slice(0, 5)) {
                    msg += `\n┌ **N° ${cmd.numeroCommande}**\n`;
                    msg += `├ Depuis : ${cmd.entrepotSourceNom || 'Entrepôt source'}\n`;
                    msg += `├ Vers : ${cmd.entrepotDestinationNom || 'Entrepôt destination'}\n`;
                    msg += `└ Articles : ${cmd.lignes?.length || 0} article(s)\n`;
                }
                if (totalTransfert > 5) msg += `\n... et ${totalTransfert - 5} autres transferts\n`;
            }
            
            msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Accédez au module "Préparation de commandes" pour traiter ces commandes.`;
            return msg;
        } catch (e) { return `📦 Service commandes disponible dans le menu.`; }
    };

    const getReceptions = async (showAll = false) => {
        try {
            const r = await receptionService.getAllReceptions();
            if (!r?.length) return `📥 **RÉCEPTIONS**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Aucune réception trouvée.`;
            
            if (showAll) {
                const validees = r.filter(rr => rr.statut === 'VALIDEE').length;
                const attente = r.filter(rr => rr.statut === 'EN_ATTENTE').length;
                let msg = `📥 **LISTE DES RÉCEPTIONS**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **RÉSUMÉ**
• Validées : ${validees}
• En attente : ${attente}
• Total : ${r.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                for (const rec of r.slice(0, 10)) {
                    const statusIcon = rec.statut === 'VALIDEE' ? '✅' : '⏳';
                    msg += `${statusIcon} **PO: ${rec.numeroPO}**\n`;
                    msg += `   Fournisseur : ${rec.fournisseur || 'Non spécifié'}\n`;
                    msg += `   Date : ${new Date(rec.dateReception).toLocaleDateString()}\n`;
                    msg += `   Statut : ${rec.statut === 'VALIDEE' ? 'Validée' : 'En attente'}\n\n`;
                }
                if (r.length > 10) msg += `... et ${r.length - 10} autres réceptions\n`;
                return msg;
            } else {
                const attente = r.filter(rr => rr.statut === 'EN_ATTENTE');
                if (attente.length === 0) return `✅ **RÉCEPTIONS EN ATTENTE**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aucune réception en attente de validation.`;
                
                let msg = `⏳ **RÉCEPTIONS EN ATTENTE (${attente.length})**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                for (const rec of attente.slice(0, 5)) {
                    msg += `📌 **PO: ${rec.numeroPO}**\n`;
                    msg += `   Fournisseur : ${rec.fournisseur || 'Non spécifié'}\n`;
                    msg += `   Date : ${new Date(rec.dateReception).toLocaleDateString()}\n`;
                    msg += `   Lignes : ${rec.lignes?.length || 0} article(s)\n\n`;
                }
                if (attente.length > 5) msg += `... et ${attente.length - 5} autres réceptions\n`;
                msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Pour plus de détails : "detail reception [PO]"`;
                return msg;
            }
        } catch (e) { return `📥 Service réceptions disponible.`; }
    };

    const getSuiviRangement = async (statut = 'A_FAIRE') => {
        try {
            const res = await fetch(`http://localhost:8080/api/rangement/statut/${statut}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const tasks = await res.json();
            const labels = { 'A_FAIRE': 'À FAIRE', 'EN_COURS': 'EN COURS', 'TERMINEE': 'TERMINÉES' };
            const icons = { 'A_FAIRE': '⏳', 'EN_COURS': '🔄', 'TERMINEE': '✅' };
            
            if (!tasks?.length) return `${icons[statut]} **TÂCHES DE RANGEMENT ${labels[statut]}**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Aucune tâche ${labels[statut].toLowerCase()}.`;
            
            let msg = `${icons[statut]} **TÂCHES DE RANGEMENT ${labels[statut]} (${tasks.length})**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            for (const task of tasks.slice(0, 10)) {
                msg += `📌 **${task.articleDesignation}**\n`;
                msg += `   Quantité : ${task.quantite} u\n`;
                if (task.lot) msg += `   Lot : ${task.lot}\n`;
                if (task.emplacementSource) msg += `   Source : ${task.emplacementSource}\n`;
                if (task.emplacementDestination) msg += `   Destination : ${task.emplacementDestination}\n`;
                msg += `\n`;
            }
            if (tasks.length > 10) msg += `... et ${tasks.length - 10} autres tâches\n`;
            return msg;
        } catch (e) { return `📋 Service rangement disponible.`; }
    };

    const getExpeditions = async () => {
        try {
            const exp = await expeditionService.getMesExpeditions();
            if (!exp?.length) return `🚚 **EXPÉDITIONS**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Aucune expédition récente.`;
            
            let msg = `🚚 **EXPÉDITIONS RÉCENTES (${exp.length})**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            for (const e of exp.slice(0, 5)) {
                msg += `📌 **BL: ${e.numeroBL}**\n`;
                msg += `   Client : ${e.clientNom || 'N/A'}\n`;
                msg += `   Transporteur : ${e.transporteur || 'Non spécifié'}\n`;
                msg += `   Date : ${new Date(e.dateExpedition).toLocaleDateString()}\n\n`;
            }
            return msg;
        } catch (e) { return `🚚 Service expéditions disponible.`; }
    };

    const getDemandesRecues = async () => {
        try {
            const demandes = await getCommandesTransfertRecues();
            if (!demandes?.length) return `📭 **DEMANDES DE TRANSFERT**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Aucune demande de transfert reçue.`;
            
            let msg = `📨 **DEMANDES DE TRANSFERT REÇUES (${demandes.length})**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            for (const d of demandes.slice(0, 5)) {
                msg += `📌 **N° ${d.numeroCommande}**\n`;
                if (d.entrepotDestinationNom) msg += `   Demandé par : ${d.entrepotDestinationNom}\n`;
                if (d.entrepotSourceNom) msg += `   Entrepôt source : ${d.entrepotSourceNom}\n`;
                if (d.lignes && d.lignes.length > 0) {
                    msg += `   Article : ${d.lignes[0].articleDesignation}\n`;
                    msg += `   Quantité : ${d.lignes[0].quantite} u\n`;
                    if (d.lignes.length > 1) msg += `   + ${d.lignes.length - 1} autre(s) article(s)\n`;
                }
                msg += `\n`;
            }
            if (demandes.length > 5) msg += `... et ${demandes.length - 5} autres demandes\n`;
            return msg;
        } catch (e) { return `📭 Service demandes de transfert disponible.`; }
    };

    const getLivraisonsAttente = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/transporteur/livraisons/entrepot/attente', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const l = await res.json();
            if (!l?.length) return `🚚 **LIVRAISONS EN ATTENTE**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Aucune livraison en attente.`;
            
            let msg = `🚚 **LIVRAISONS EN ATTENTE (${l.length})**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            for (const liv of l) {
                msg += `📌 **BL: ${liv.numeroBL}**\n`;
                msg += `   OTP : ${liv.codeOtp}\n`;
                if (liv.clientNom) msg += `   Client : ${liv.clientNom}\n`;
                if (liv.adresseLivraison) msg += `   Adresse : ${liv.adresseLivraison}\n`;
                msg += `\n`;
            }
            return msg;
        } catch (e) { return `🚚 Service livraisons disponible.`; }
    };

    const getLivraisonsAssignees = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/transporteur/livraisons/en-cours', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const l = await res.json();
            if (!l?.length) return `🚚 **MES LIVRAISONS**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Aucune livraison assignée.`;
            
            let msg = `🚚 **MES LIVRAISONS (${l.length})**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            for (const liv of l) {
                msg += `📌 **BL: ${liv.numeroBL}**\n`;
                msg += `   Client : ${liv.clientNom}\n`;
                msg += `   Adresse : ${liv.adresseLivraison}\n`;
                msg += `   Assignée le : ${new Date(liv.dateAssignation).toLocaleDateString()}\n\n`;
            }
            return msg;
        } catch (e) { return `🚚 Service livraisons disponible.`; }
    };

    const getListeClients = async () => {
        try {
            const clients = await getAllClients();
            if (!clients?.length) return `👥 **LISTE DES CLIENTS**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Aucun client trouvé.`;
            
            let msg = `👥 **LISTE DES CLIENTS (${clients.length})**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            for (const client of clients.slice(0, 10)) {
                msg += `📌 **${client.prenom} ${client.nom}**\n`;
                msg += `   Email : ${client.email}\n`;
                if (client.telephone) msg += `   Téléphone : ${client.telephone}\n`;
                if (client.ville) msg += `   Ville : ${client.ville}\n`;
                msg += `\n`;
            }
            if (clients.length > 10) msg += `... et ${clients.length - 10} autres clients\n\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Pour rechercher un client : "client email [email]"`;
            return msg;
        } catch (e) { return `👥 Service clients disponible.`; }
    };

    const getClientByEmail = async (email) => {
        try {
            const clients = await getAllClients();
            const client = clients.find(c => c.email === email);
            if (!client) return `❌ **CLIENT NON TROUVÉ**

Aucun client ne correspond à l'email : \`${email}\`

💡 Tapez "clients" pour voir la liste complète.`;
            
            let msg = `👤 **DÉTAILS DU CLIENT**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Nom complet : ${client.prenom} ${client.nom}
• Email : ${client.email}
${client.telephone ? `• Téléphone : ${client.telephone}` : ''}
${client.adresse ? `• Adresse : ${client.adresse}` : ''}
${client.ville ? `• Ville : ${client.ville}` : ''}
${client.codePostal ? `• Code postal : ${client.codePostal}` : ''}
${client.pays ? `• Pays : ${client.pays}` : ''}
${client.latitude && client.longitude ? `• GPS : ${client.latitude}, ${client.longitude}` : ''}
• Client depuis : ${new Date(client.createdAt).toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            return msg;
        } catch (e) { return `❌ **Erreur** : ${e.message}`; }
    };

    const getSuggestionMessage = (role) => {
        const suggestions = {
            'RESPONSABLE_ENTREPOT': ['📦 stock', '⚠️ stok fable 20', '🚚 commandes a expédier', '📥 recept', '📋 rangement a faire', '⚡ rapide'],
            'OPERATEUR_ENTREPOT': ['📋 rangement a faire', '🔄 rangement en cours', '✅ rangement termine', '🚚 livraisons attente'],
            'TRANSPORTEUR': ['🚚 livraisons assignees'],
            'SERVICE_COMMERCIAL': ['👥 clients', '📧 client email x@y.com']
        };
        let msg = `❌ **Je n'ai pas compris votre demande.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 **Commandes suggérées :**

`;
        (suggestions[role] || suggestions['RESPONSABLE_ENTREPOT']).forEach(cmd => { msg += `   ${cmd}\n`; });
        msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Tapez **"rapide"** pour voir les boutons de commandes rapides.
💡 Tapez **"aide"** pour voir la liste détaillée des commandes.`;
        return msg;
    };

    const processCommand = async (commandText) => {
        setIsTyping(true);
        setTimeout(async () => {
            setIsTyping(false);
            let response = '';
            
            const barcode = matcher.isBarcode(commandText);
            if (barcode) {
                const perm = checkPermission(['RESPONSABLE_ENTREPOT', 'ADMINISTRATEUR']);
                if (perm) response = perm;
                else response = await getStockByBarcode(barcode);
                addBotMessage(response);
                return;
            }
            
            const intent = matcher.findIntent(commandText);
            const seuil = matcher.extractThreshold(commandText);
            const articleName = matcher.extractArticleName(commandText);
            const clientEmail = matcher.extractClientEmail(commandText);
            
            switch (intent) {
                // ========== RAPIDE : afficher les boutons ==========
                case 'RAPIDE':
                    setShowQuickCommands(true);
                    response = `⚡ **COMMANDES RAPIDES**

Cliquez sur les boutons ci-dessous pour exécuter les commandes rapidement.`;
                    addBotMessage(response);
                    break;
                
                case 'RECEPTION': response = await getReceptions(false); break;
                case 'LISTE_RECEPTION': response = await getReceptions(true); break;
                case 'STOCK_FAIBLE':
                case 'STOCK_ARTICLE':
                case 'STOCK_BARCODE':
                    const stockPerm = checkPermission(['RESPONSABLE_ENTREPOT', 'ADMINISTRATEUR']);
                    if (stockPerm) response = stockPerm;
                    else if (intent === 'STOCK_FAIBLE') response = await getStockFaible(seuil || 20);
                    else if (intent === 'STOCK_ARTICLE') {
                        if (articleName) response = await getStockByArticleName(articleName);
                        else if (commandText.trim() === 'stock') response = await getAllStocksSummary();
                        else response = "📦 **Exemple** : stock de ART-001";
                    } else response = await getStockByBarcode(barcode);
                    break;
                case 'PREPARATION_COMMANDES':
                    const prepPerm = checkPermission(['OPERATEUR_ENTREPOT', 'ADMINISTRATEUR']);
                    response = prepPerm || await getPreparationCommandes();
                    break;
                case 'COMMANDES_A_EXPEDIER':
                    const expPerm = checkPermission(['RESPONSABLE_ENTREPOT', 'ADMINISTRATEUR']);
                    response = expPerm || await getCommandesAExpedier();
                    break;
                case 'RANGEMENT_A_FAIRE': response = await getSuiviRangement('A_FAIRE'); break;
                case 'RANGEMENT_EN_COURS': response = await getSuiviRangement('EN_COURS'); break;
                case 'RANGEMENT_TERMINE': response = await getSuiviRangement('TERMINEE'); break;
                case 'DEMANDE_TRANSFERT':
                    const transPerm = checkPermission(['RESPONSABLE_ENTREPOT', 'ADMINISTRATEUR']);
                    response = transPerm || await getDemandesRecues();
                    break;
                case 'LIVRAISONS_ASSIGNEES':
                    const transPerm2 = checkPermission(['TRANSPORTEUR', 'ADMINISTRATEUR']);
                    response = transPerm2 || await getLivraisonsAssignees();
                    break;
                case 'LIVRAISON_ATTENTE':
                    const attPerm = checkPermission(['RESPONSABLE_ENTREPOT', 'OPERATEUR_ENTREPOT', 'ADMINISTRATEUR']);
                    response = attPerm || await getLivraisonsAttente();
                    break;
                case 'EXPEDITION':
                    const expPermOld = checkPermission(['RESPONSABLE_ENTREPOT', 'ADMINISTRATEUR']);
                    response = expPermOld || await getExpeditions();
                    break;
                case 'LISTE_CLIENTS':
                    const clientPerm = checkPermission(['SERVICE_COMMERCIAL', 'ADMINISTRATEUR']);
                    response = clientPerm || await getListeClients();
                    break;
                case 'CLIENT_EMAIL':
                    const clientPerm2 = checkPermission(['SERVICE_COMMERCIAL', 'ADMINISTRATEUR']);
                    if (clientPerm2) response = clientPerm2;
                    else if (clientEmail) response = await getClientByEmail(clientEmail);
                    else response = "👤 **Exemple** : client email client@exemple.com";
                    break;
                case 'SALUTATION': response = `👋 Bonjour ! Je suis WMS Smart-Assist.\n\nComment puis-je vous aider aujourd'hui ?\n\n💡 Tapez "rapide" pour voir les boutons de commandes rapides.\n💡 Tapez "aide" pour voir la liste des commandes.`; break;
                case 'MERCI': response = `🙏 **Avec plaisir !**\n\nN'hésitez pas si vous avez d'autres questions.`; break;
                case 'AIDE': response = getHelpByRole(userRole); break;
                default: response = getSuggestionMessage(userRole); break;
            }
            if (intent !== 'RAPIDE') {
                addBotMessage(response);
            }
        }, 500);
    };

    const sendMessage = async () => {
        if (!inputValue.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), text: inputValue, sender: 'user', timestamp: new Date(), type: 'text' }]);
        const userText = inputValue;
        setInputValue('');
        await processCommand(userText);
    };

    const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    if (!isOpen) {
        return (
            <div className="chatbot-container">
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}><FaComment /></button>
            </div>
        );
    }

    return (
        <div className="chatbot-container">
            <div className="chatbot-window">
                <div className="chatbot-header">
                    <h3><FaRobot /> WMS Smart-Assist</h3>
                    <button className="chatbot-close" onClick={() => setIsOpen(false)}><FaTimes /></button>
                </div>
                <div className="chatbot-messages">
                    {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
                    {showQuickCommands && (messages.length <= 1 || messages[messages.length - 1]?.text === '⚡ **COMMANDES RAPIDES**\n\nCliquez sur les boutons ci-dessous pour exécuter les commandes rapidement.') && (
                        <div className="message bot">
                            <div className="message-avatar"><FaRobot /></div>
                            <div className="message-content">
                                <QuickCommands role={userRole} onCommandClick={handleQuickCommand} />
                            </div>
                        </div>
                    )}
                    {isTyping && (
                        <div className="message bot">
                            <div className="message-avatar"><FaRobot /></div>
                            <div className="typing-indicator"><span></span><span></span><span></span></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chatbot-input">
                    <input type="text" placeholder="💬 Posez votre question..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} />
                    <button onClick={sendMessage} disabled={!inputValue.trim()}><FaPaperPlane /></button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;