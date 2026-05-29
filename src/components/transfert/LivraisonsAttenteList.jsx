import React, { useState, useEffect } from 'react';
import { getLivraisonsEntrepotAttente } from '../../services/commandeService';
import { FaTruck, FaClock, FaCheckCircle, FaMapMarkerAlt, FaHashtag, FaCalendarAlt } from 'react-icons/fa';
import { FaClipboardList } from 'react-icons/fa';
import './LivraisonsAttenteList.css';
import { FaBox } from "react-icons/fa";
import { FaSyncAlt } from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";
import { FaKey } from 'react-icons/fa';
import { FaHourglassHalf } from 'react-icons/fa';

const LivraisonsAttenteList = () => {
    const [livraisons, setLivraisons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedLivraison, setSelectedLivraison] = useState(null);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(false);

    const userRole = localStorage.getItem('role');
    const isOperateur = userRole === 'OPERATEUR_ENTREPOT' || userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';

    useEffect(() => {
        if (isOperateur) {
            loadLivraisons();
        }
    }, [isOperateur]);

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

    const handleShowOtp = async (livraison) => {
        setSelectedLivraison(livraison);
        setShowOtpModal(true);
        
        // Récupérer les articles depuis la commande via l'API
        if (livraison.expeditionId) {
            setLoadingArticles(true);
            try {
                const token = localStorage.getItem('token');
                // D'abord récupérer l'expédition pour avoir commandeId
                const expeditionRes = await fetch(`http://localhost:8080/api/expeditions/${livraison.expeditionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const expedition = await expeditionRes.json();
                
                if (expedition.commandeId) {
                    const commandeRes = await fetch(`http://localhost:8080/api/commandes/${expedition.commandeId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const commande = await commandeRes.json();
                    setArticles(commande.lignes || []);
                } else {
                    setArticles([]);
                }
            } catch (err) {
                console.error('Erreur chargement articles:', err);
                setArticles([]);
            } finally {
                setLoadingArticles(false);
            }
        } else {
            setArticles([]);
            setLoadingArticles(false);
        }
    };

    const closeOtpModal = () => {
        setShowOtpModal(false);
        setSelectedLivraison(null);
        setArticles([]);
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
                <h2><FaBox /> Livraisons en attente</h2>
                <button className="btn-refresh" onClick={loadLivraisons}>
                    <FaSyncAlt /> Actualiser
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {livraisons.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><MdLocalShipping /></div>
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
                                    <FaKey /> Voir le code OTP
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal OTP avec articles */}
            {showOtpModal && selectedLivraison && (
                <div className="modal-overlay" onClick={closeOtpModal}>
                    <div className="otp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h3><FaKey /> Code OTP - Livraison</h3>
                            <button className="modal-close" onClick={closeOtpModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="otp-info">
                                <p><strong>BL:</strong> {selectedLivraison.numeroBL}</p>
                                <p><strong>Client / Entrepôt:</strong> {selectedLivraison.clientNom}</p>
                                <p><strong>Transporteur:</strong> {selectedLivraison.transporteurNom}</p>
                                <p><strong>Statut:</strong> {selectedLivraison.statut}</p>
                                <p><strong>Date d'assignation:</strong> {formatDate(selectedLivraison.dateAssignation)}</p>
                            </div>

                            {/* Tableau des articles */}
                            {loadingArticles ? (
                                <p style={{ textAlign: 'center', marginTop: '15px' }}><FaHourglassHalf /> Chargement des articles...</p>
                            ) : articles && articles.length > 0 ? (
                                <>
                                    <h4 style={{ marginTop: '15px', marginBottom: '10px' }}><FaClipboardList /> Articles à recevoir</h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Code</th>
                                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Désignation</th>
                                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Quantité</th>
                                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Lot</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {articles.map((ligne, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ligne.articleCode || ligne.code || '-'}</td>
                                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ligne.articleDesignation || ligne.designation || '-'}</td>
                                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{ligne.quantite || '-'}</td>
                                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ligne.lot || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <p style={{ color: '#999', fontStyle: 'italic', marginTop: '15px' }}>Aucun article disponible</p>
                            )}

                            <div className="otp-code-container">
                                <div className="otp-code-label">Code de validation à donner au transporteur :</div>
                                <div className="otp-code-value">{selectedLivraison.codeOtp}</div>
                                <button 
                                    className="btn-copy-otp"
                                    onClick={() => copyToClipboard(selectedLivraison.codeOtp)}
                                >
                                    <FaClipboardList /> Copier le code
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