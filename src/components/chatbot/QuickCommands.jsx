// src/components/chatbot/QuickCommands.jsx
import React from 'react';
import { 
    FaBoxes, FaExclamationTriangle, FaExchangeAlt, 
    FaClipboardList, FaTruck, FaHourglassHalf, 
    FaCheckCircle, FaUsers, FaEnvelope, FaBoxOpen,
    FaWarehouse, FaBell
} from 'react-icons/fa';
import './QuickCommands.css';

const QuickCommands = ({ role, onCommandClick }) => {
    
    // Commandes pour RESPONSABLE_ENTREPOT
    const getResponsableCommands = () => [
        { id: 1, label: ' Voir les stocks', command: 'stock', icon: <FaBoxes />, description: 'Consulter tous les stocks' },
        { id: 2, label: ' Stocks faibles', command: 'stok fable 20', icon: <FaExclamationTriangle />, description: 'Voir les stocks sous seuil (20 unités)' },
        { id: 3, label: ' Demandes transfert', command: 'demandes recues', icon: <FaExchangeAlt />, description: 'Voir les demandes de transfert reçues' },
        { id: 4, label: ' Commandes à expédier', command: 'commandes a expédier', icon: <FaTruck />, description: 'Commandes prêtes à être expédiées (VALIDEE)' },  // ← CORRECTION ICI
        { id: 5, label: ' Rangement à faire', command: 'rangement a faire', icon: <FaHourglassHalf />, description: 'Tâches de rangement en attente' },
        { id: 6, label: ' Rangement en cours', command: 'rangement en cours', icon: <FaExchangeAlt />, description: 'Tâches de rangement en cours' },
        { id: 7, label: ' Rangement terminé', command: 'rangement termine', icon: <FaCheckCircle />, description: 'Tâches de rangement terminées' },
        { id: 8, label: ' Réceptions en attente', command: 'recept', icon: <FaClipboardList />, description: 'Réceptions en attente de validation' },
        { id: 9, label: ' Liste réceptions', command: 'list reception', icon: <FaClipboardList />, description: 'Toutes les réceptions' },
        { id: 10, label: ' Aide', command: 'aide', icon: <FaBell />, description: 'Voir l\'aide contextuelle' }
    ];

    // Commandes pour OPERATEUR_ENTREPOT
    const getOperateurCommands = () => [
        { id: 1, label: ' Rangement à faire', command: 'rangement a faire', icon: <FaHourglassHalf />, description: 'Tâches de rangement en attente' },
        { id: 2, label: ' Rangement en cours', command: 'rangement en cours', icon: <FaExchangeAlt />, description: 'Tâches de rangement en cours' },
        { id: 3, label: ' Rangement terminé', command: 'rangement termine', icon: <FaCheckCircle />, description: 'Tâches de rangement terminées' },
        { id: 4, label: ' Livraisons en attente', command: 'livraisons attente', icon: <FaTruck />, description: 'Livraisons en attente de validation' },
        { id: 5, label: ' Commandes à préparer', command: 'preparation commandes', icon: <FaBoxOpen />, description: 'Commandes client à préparer' },
        { id: 6, label: ' Aide', command: 'aide', icon: <FaBell />, description: 'Voir l\'aide contextuelle' }
    ];

    // Commandes pour TRANSPORTEUR
    const getTransporteurCommands = () => [
        { id: 1, label: ' Livraisons assignées', command: 'livraisons assignees', icon: <FaTruck />, description: 'Voir mes livraisons en cours' },
        { id: 2, label: ' Aide', command: 'aide', icon: <FaBell />, description: 'Voir l\'aide contextuelle' }
    ];

    // Commandes pour SERVICE_COMMERCIAL
    const getCommercialCommands = () => [
        { id: 1, label: ' Liste des clients', command: 'clients', icon: <FaUsers />, description: 'Consulter tous les clients' },
        { id: 2, label: ' Rechercher client par email', command: 'client email', icon: <FaEnvelope />, description: 'Rechercher un client par email' },
        { id: 3, label: ' Aide', command: 'aide', icon: <FaBell />, description: 'Voir l\'aide contextuelle' }
    ];

    // Sélectionner les commandes selon le rôle
    let commands = [];
    switch (role) {
        case 'RESPONSABLE_ENTREPOT':
            commands = getResponsableCommands();
            break;
        case 'OPERATEUR_ENTREPOT':
            commands = getOperateurCommands();
            break;
        case 'TRANSPORTEUR':
            commands = getTransporteurCommands();
            break;
        case 'SERVICE_COMMERCIAL':
            commands = getCommercialCommands();
            break;
        default:
            commands = [{ id: 1, label: ' Aide', command: 'aide', icon: <FaBell />, description: 'Voir l\'aide' }];
    }

    return (
        <div className="quick-commands">
            <div className="quick-commands-header">
                <span> COMMANDES RAPIDES</span>
                <span className="quick-commands-sub">Cliquez sur un bouton pour exécuter la commande</span>
            </div>
            <div className="quick-commands-grid">
                {commands.map((cmd) => (
                    <button
                        key={cmd.id}
                        className="quick-command-btn"
                        onClick={() => onCommandClick(cmd.command)}
                        title={cmd.description}
                    >
                        <span className="quick-command-icon">{cmd.icon}</span>
                        <span className="quick-command-label">{cmd.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickCommands;