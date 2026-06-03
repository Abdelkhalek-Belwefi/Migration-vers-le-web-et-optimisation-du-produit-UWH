import React, { useState, useEffect } from 'react';
import { getLivraisonsEntrepotAttente } from '../../services/commandeService';
import { FaTruck, FaKey, FaBox, FaSyncAlt, FaClipboardList, FaHourglassHalf } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import './LivraisonsAttenteList.css';

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
        if (isOperateur) { loadLivraisons(); }
    }, [isOperateur]);

    useEffect(() => {
        if (!isOperateur) return;
        const interval = setInterval(() => { loadLivraisons(); }, 30000);
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
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatutBadge = (statut) => {
        switch (statut) {
            case 'ASSIGNEE':   return <span className="la-badge la-badge--assigned">🚚 Assignée</span>;
            case 'EN_COURS':   return <span className="la-badge la-badge--inprogress">🔄 En cours</span>;
            case 'LIVREE':     return <span className="la-badge la-badge--delivered">✅ Livrée</span>;
            default:           return <span className="la-badge">{statut}</span>;
        }
    };

    const handleShowOtp = async (livraison) => {
        setSelectedLivraison(livraison);
        setShowOtpModal(true);
        if (livraison.expeditionId) {
            setLoadingArticles(true);
            try {
                const token = localStorage.getItem('token');
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
            <div className="la-page">
                <div className="la-alert la-alert--error">Vous n'avez pas les droits pour accéder à cette page.</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="la-page">
                <div className="la-loading">Chargement des livraisons en attente...</div>
            </div>
        );
    }

    return (
        <div className="la-page">
            <div className="la-topbar">
                <h2 className="la-topbar-title"><FaBox /> Livraisons en attente</h2>
                <button className="la-btn-refresh" onClick={loadLivraisons}>
                    <FaSyncAlt /> Actualiser
                </button>
            </div>

            {error   && <div className="la-alert la-alert--error">{error}</div>}
            {success && <div className="la-alert la-alert--success">{success}</div>}

            {livraisons.length === 0 ? (
                <div className="la-empty">
                    <div className="la-empty-icon"><MdLocalShipping /></div>
                    <h3>Aucune livraison en attente</h3>
                    <p>Les livraisons apparaîtront ici lorsqu'un transporteur sera assigné.</p>
                </div>
            ) : (
                <div className="la-grid">
                    {livraisons.map((livraison) => (
                        <div key={livraison.id} className="la-card">
                            <div className="la-card-head">
                                <div className="la-card-bl">
                                    <FaTruck className="la-card-bl-icon" />
                                    <span>BL: {livraison.numeroBL}</span>
                                </div>
                                {getStatutBadge(livraison.statut)}
                            </div>

                            <div className="la-card-body">
                                <div className="la-info-row">
                                    <span className="la-info-label">Client / Entrepôt :</span>
                                    <span className="la-info-value">{livraison.clientNom}</span>
                                </div>
                                <div className="la-info-row">
                                    <span className="la-info-label">Adresse :</span>
                                    <span className="la-info-value">{livraison.adresseLivraison || 'Non spécifiée'}</span>
                                </div>
                                <div className="la-info-row">
                                    <span className="la-info-label">Transporteur :</span>
                                    <span className="la-info-value">{livraison.transporteurNom}</span>
                                </div>
                                <div className="la-info-row">
                                    <span className="la-info-label">Date d'assignation :</span>
                                    <span className="la-info-value">{formatDate(livraison.dateAssignation)}</span>
                                </div>
                            </div>

                            <div className="la-card-foot">
                                <button className="la-btn-otp" onClick={() => handleShowOtp(livraison)}>
                                    <FaKey /> Voir le code OTP
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showOtpModal && selectedLivraison && (
                <div className="la-modal-wrap" onClick={closeOtpModal}>
                    <div className="la-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="la-modal-head">
                            <h3><FaKey /> Code OTP — Livraison</h3>
                            <button className="la-modal-close" onClick={closeOtpModal}>✕</button>
                        </div>
                        <div className="la-modal-body">
                            <div className="la-otp-info">
                                <p><strong>BL:</strong> {selectedLivraison.numeroBL}</p>
                                <p><strong>Client / Entrepôt:</strong> {selectedLivraison.clientNom}</p>
                                <p><strong>Transporteur:</strong> {selectedLivraison.transporteurNom}</p>
                                <p><strong>Statut:</strong> {selectedLivraison.statut}</p>
                                <p><strong>Date d'assignation:</strong> {formatDate(selectedLivraison.dateAssignation)}</p>
                            </div>

                            {loadingArticles ? (
                                <p className="la-articles-loading"><FaHourglassHalf /> Chargement des articles...</p>
                            ) : articles && articles.length > 0 ? (
                                <>
                                    <div className="la-articles-title"><FaClipboardList /> Articles à recevoir</div>
                                    <table className="la-table">
                                        <thead>
                                            <tr>
                                                <th>Code</th>
                                                <th>Désignation</th>
                                                <th>Quantité</th>
                                                <th>Lot</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {articles.map((ligne, idx) => (
                                                <tr key={idx}>
                                                    <td>{ligne.articleCode || ligne.code || '-'}</td>
                                                    <td>{ligne.articleDesignation || ligne.designation || '-'}</td>
                                                    <td className="la-table-center">{ligne.quantite || '-'}</td>
                                                    <td>{ligne.lot || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <p className="la-articles-empty">Aucun article disponible</p>
                            )}

                            <div className="la-otp-block">
                                <div className="la-otp-block-label">Code de validation à donner au transporteur :</div>
                                <div className="la-otp-code">{selectedLivraison.codeOtp}</div>
                                <button className="la-btn-copy" onClick={() => copyToClipboard(selectedLivraison.codeOtp)}>
                                    <FaClipboardList /> Copier le code
                                </button>
                            </div>
                            <div className="la-otp-warning">
                                <p>⚠️ Ce code est à usage unique. Le transporteur devra le saisir pour valider la livraison.</p>
                            </div>
                        </div>
                        <div className="la-modal-foot">
                            <button className="la-btn-close" onClick={closeOtpModal}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivraisonsAttenteList;