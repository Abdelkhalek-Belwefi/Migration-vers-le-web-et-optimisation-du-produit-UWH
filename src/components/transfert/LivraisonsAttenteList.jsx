import React, { useState, useEffect } from 'react';
import { getLivraisonsEntrepotAttente } from '../../services/commandeService';
import { FaTruck, FaClock, FaCheckCircle, FaMapMarkerAlt, FaHashtag, FaCalendarAlt } from 'react-icons/fa';
import './LivraisonsAttenteList.css';

const LivraisonsAttenteList = () => {
    const [livraisons, setLivraisons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedLivraison, setSelectedLivraison] = useState(null);
    const [showOtpModal, setShowOtpModal] = useState(false);

    const userRole = localStorage.getItem('role');
    const isOperateur = userRole === 'OPERATEUR_ENTREPOT' || userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';

    useEffect(() => {
        if (isOperateur) {
            loadLivraisons();
        }
    }, [isOperateur]);

    // Recharger toutes les 30 secondes
    useEffect(() => {
        if (!isOperateur) return;
        const interval = setInterval(() => {
            loadLivraisons();
        }, 30000);
        return () => clearInterval(interval);
    }, [isOperateur]);

    const loadLivraisons = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getLivraisonsEntrepotAttente();
            setLivraisons(data);
        } catch (err) {
            console.error('Erreur chargement livraisons:', err);
            setError('Erreur lors du chargement des livraisons en attente');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatutBadge = (statut) => {
        switch (statut) {
            case 'ASSIGNEE':
                return <span className="status-badge status-assignee">🚚 Assignée</span>;
            case 'EN_COURS':
                return <span className="status-badge status-en-cours">🔄 En cours</span>;
            case 'LIVREE':
                return <span className="status-badge status-livree">✅ Livrée</span>;
            default:
                return <span className="status-badge">{statut}</span>;
        }
    };

    const handleShowOtp = (livraison) => {
        setSelectedLivraison(livraison);
        setShowOtpModal(true);
    };

    const closeOtpModal = () => {
        setShowOtpModal(false);
        setSelectedLivraison(null);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccess('✅ Code OTP copié dans le presse-papier !');
        setTimeout(() => setSuccess(''), 3000);
    };

    if (!isOperateur) {
        return (
            <div className="livraisons-attente-container">
                <div className="alert error">
                    Vous n'avez pas les droits pour accéder à cette page.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="livraisons-attente-container">
                <div className="loading">Chargement des livraisons en attente...</div>
            </div>
        );
    }

    return (
        <div className="livraisons-attente-container">
            <div className="header">
                <h2>📦 Livraisons en attente</h2>
                <button className="btn-refresh" onClick={loadLivraisons}>
                    🔄 Actualiser
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {livraisons.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🚚</div>
                    <h3>Aucune livraison en attente</h3>
                    <p>Les livraisons apparaîtront ici lorsqu'un transporteur sera assigné.</p>
                </div>
            ) : (
                <div className="livraisons-grid">
                    {livraisons.map((livraison) => (
                        <div key={livraison.id} className="livraison-card">
                            <div className="card-header">
                                <div className="bl-number">
                                    <FaTruck className="header-icon" />
                                    <span>BL: {livraison.numeroBL}</span>
                                </div>
                                {getStatutBadge(livraison.statut)}
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Client / Entrepôt :</span>
                                    <span className="info-value">{livraison.clientNom}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Adresse :</span>
                                    <span className="info-value">{livraison.adresseLivraison || 'Non spécifiée'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Transporteur :</span>
                                    <span className="info-value">{livraison.transporteurNom}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Date d'assignation :</span>
                                    <span className="info-value">{formatDate(livraison.dateAssignation)}</span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <button 
                                    className="btn-show-otp"
                                    onClick={() => handleShowOtp(livraison)}
                                >
                                    🔑 Voir le code OTP
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal pour afficher l'OTP */}
            {showOtpModal && selectedLivraison && (
                <div className="modal-overlay" onClick={closeOtpModal}>
                    <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔑 Code OTP - Livraison</h3>
                            <button className="modal-close" onClick={closeOtpModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="otp-info">
                                <p><strong>BL:</strong> {selectedLivraison.numeroBL}</p>
                                <p><strong>Client / Entrepôt:</strong> {selectedLivraison.clientNom}</p>
                                <p><strong>Transporteur:</strong> {selectedLivraison.transporteurNom}</p>
                            </div>
                            <div className="otp-code-container">
                                <div className="otp-code-label">Code de validation à donner au transporteur :</div>
                                <div className="otp-code-value">{selectedLivraison.codeOtp}</div>
                                <button 
                                    className="btn-copy-otp"
                                    onClick={() => copyToClipboard(selectedLivraison.codeOtp)}
                                >
                                    📋 Copier le code
                                </button>
                            </div>
                            <div className="otp-instruction">
                                <p>⚠️ Ce code est à usage unique. Le transporteur devra le saisir pour valider la livraison.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close" onClick={closeOtpModal}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivraisonsAttenteList;