import React, { useState, useEffect } from 'react';
import { 
    getCommandesTransfertSource, 
    accepterDemandeTransfert, 
    refuserDemandeTransfert 
} from '../../services/commandeService';
import { FaClipboard } from "react-icons/fa";
import { FaInbox } from "react-icons/fa";
import { FaSyncAlt } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import './DemandesRecuesList.css';

const DemandesRecuesList = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const userRole = localStorage.getItem('role');
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';

    useEffect(() => {
        if (isResponsable) {
            loadDemandes();
        }
    }, [isResponsable]);

    const loadDemandes = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getCommandesTransfertSource();
            setDemandes(data);
        } catch (err) {
            console.error('Erreur chargement demandes:', err);
            setError('Erreur lors du chargement des demandes');
        } finally {
            setLoading(false);
        }
    };

    const handleAccepter = async (id) => {
        if (!window.confirm('Acceptez-vous cette demande de transfert ?')) return;
        
        setActionLoading(id);
        setError('');
        setSuccess('');
        
        try {
            await accepterDemandeTransfert(id);
            setSuccess('✅ Demande acceptée avec succès');
            loadDemandes();
        } catch (err) {
            console.error('Erreur acceptation:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'acceptation');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefuser = async (id) => {
        if (!window.confirm('Refusez-vous cette demande de transfert ?')) return;
        
        setActionLoading(id);
        setError('');
        setSuccess('');
        
        try {
            await refuserDemandeTransfert(id);
            setSuccess('❌ Demande refusée');
            loadDemandes();
        } catch (err) {
            console.error('Erreur refus:', err);
            setError(err.response?.data?.message || 'Erreur lors du refus');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRowClick = (demande) => {
        setSelectedDemande(demande);
        setShowDetailModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedDemande(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatutBadge = (statut) => {
        const classes = {
            'EN_ATTENTE': 'badge-warning',
            'VALIDEE': 'badge-success',
            'EXPEDIEE': 'badge-info',
            'REFUSEE': 'badge-danger'
        };
        const labels = {
            'EN_ATTENTE': 'En attente',
            'VALIDEE': 'Acceptée',
            'EXPEDIEE': 'Expédiée',
            'REFUSEE': 'Refusée'
        };
        return <span className={`badge ${classes[statut] || 'badge-secondary'}`}>{labels[statut] || statut}</span>;
    };

    if (!isResponsable) {
        return (
            <div className="demandes-recues-container">
                <div className="alert error">
                    Vous n'avez pas les droits pour accéder à cette page.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="demandes-recues-container">
                <div className="loading">Chargement des demandes...</div>
            </div>
        );
    }

    return (
        <div className="demandes-recues-container">
            <div className="header">
                <h2><FaClipboard /> Demandes de transfert reçues</h2>
                <button className="btn-refresh" onClick={loadDemandes}>
                    <FaSyncAlt /> Actualiser
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {demandes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><FaInbox /></div>
                    <h3>Aucune demande reçue</h3>
                    <p>Les demandes de transfert d'autres entrepôts apparaîtront ici.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="demandes-table">
                        <thead>
                            <tr>
                                <th>N° Demande</th>
                                <th>Entrepôt demandeur</th>
                                <th>Article</th>
                                <th>Quantité</th>
                                <th>Date demande</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demandes.map((demande) => (
                                <tr 
                                    key={demande.id} 
                                    className="clickable-row"
                                    onClick={() => handleRowClick(demande)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td style={{ fontWeight: 'bold' }}>{demande.numeroCommande}</td>
                                    <td>
                                        {demande.entrepotDestinationNom || 
                                         (demande.entrepotDestinationId ? `Entrepôt #${demande.entrepotDestinationId}` : '-')}
                                    </td>
                                    <td>
                                        {demande.lignes && demande.lignes.length > 0 ? (
                                            <div className="article-info">
                                                <span className="article-name">
                                                    {demande.lignes[0].articleDesignation || demande.lignes[0].articleCode}
                                                </span>
                                                {demande.lignes.length > 1 && (
                                                    <span className="more-articles">+{demande.lignes.length - 1}</span>
                                                )}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {demande.lignes && demande.lignes.length > 0 ? (
                                            <span className="quantite-badge">{demande.lignes[0].quantite} unités</span>
                                        ) : '-'}
                                    </td>
                                    <td>{formatDate(demande.dateCommande)}</td>
                                    <td>{getStatutBadge(demande.statut)}</td>
                                    <td className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                        {demande.statut === 'EN_ATTENTE' && (
                                            <>
                                                <button
                                                    className="btn-accepter"
                                                    onClick={() => handleAccepter(demande.id)}
                                                    disabled={actionLoading === demande.id}
                                                >
                                                    {actionLoading === demande.id ? '...' : '✅ Accepter'}
                                                </button>
                                                <button
                                                    className="btn-refuser"
                                                    onClick={() => handleRefuser(demande.id)}
                                                    disabled={actionLoading === demande.id}
                                                >
                                                    {actionLoading === demande.id ? '...' : '❌ Refuser'}
                                                </button>
                                            </>
                                        )}
                                        {demande.statut !== 'EN_ATTENTE' && (
                                            <span className="status-indicator">
                                                {demande.statut === 'VALIDEE' && '✓ Traitée'}
                                                {demande.statut === 'EXPEDIEE' && '📦 Expédiée'}
                                                {demande.statut === 'REFUSEE' && '✗ Refusée'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de détails */}
            {showDetailModal && selectedDemande && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📋 Détails de la demande</h3>
                            <button className="modal-close" onClick={handleCloseModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h4>Informations générales</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>N° Demande :</label>
                                        <span>{selectedDemande.numeroCommande}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Statut :</label>
                                        <span>{getStatutBadge(selectedDemande.statut)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Date demande :</label>
                                        <span>{formatDate(selectedDemande.dateCommande)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Entrepôt demandeur :</label>
                                        <span>{selectedDemande.entrepotDestinationNom || `Entrepôt #${selectedDemande.entrepotDestinationId}`}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Entrepôt fournisseur :</label>
                                        <span>{selectedDemande.entrepotSourceNom || `Entrepôt #${selectedDemande.entrepotSourceId}`}</span>
                                    </div>
                                    {selectedDemande.notes && (
                                        <div className="detail-item">
                                            <label>Notes :</label>
                                            <span>{selectedDemande.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Articles demandés</h4>
                                <table className="detail-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Désignation</th>
                                            <th>Quantité demandée</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDemande.lignes?.map((ligne, idx) => (
                                            <tr key={idx}>
                                                <td>{ligne.articleCode}</td>
                                                <td>{ligne.articleDesignation}</td>
                                                <td className="quantite-cell">{ligne.quantite} unités</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {selectedDemande.statut === 'EN_ATTENTE' && (
                                <>
                                    <button 
                                        className="btn-accepter" 
                                        onClick={() => {
                                            handleAccepter(selectedDemande.id);
                                            handleCloseModal();
                                        }}
                                    >
                                        ✅ Accepter
                                    </button>
                                    <button 
                                        className="btn-refuser" 
                                        onClick={() => {
                                            handleRefuser(selectedDemande.id);
                                            handleCloseModal();
                                        }}
                                    >
                                        ❌ Refuser
                                    </button>
                                </>
                            )}
                            <button className="btn-close" onClick={handleCloseModal}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemandesRecuesList;