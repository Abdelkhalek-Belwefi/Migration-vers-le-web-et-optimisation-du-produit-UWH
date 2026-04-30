import React, { useState, useEffect } from 'react';
import { 
    getCommandesTransfertSource, 
    accepterDemandeTransfert, 
    refuserDemandeTransfert 
} from '../../services/commandeService';
import './DemandesRecuesList.css';

const DemandesRecuesList = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

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
            // Récupère les commandes où l'entrepôt SOURCE = entrepôt de l'utilisateur
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
                <h2>📋 Demandes de transfert reçues</h2>
                <button className="btn-refresh" onClick={loadDemandes}>
                    🔄 Actualiser
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {demandes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
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
                                <tr key={demande.id}>
                                    <td><strong>{demande.numeroCommande}</strong></td>
                                    <td>
                                        {demande.entrepotDestination?.nom || 
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
                                    <td>
                                        {demande.statut === 'EN_ATTENTE' && (
                                            <div className="action-buttons">
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
                                            </div>
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
        </div>
    );
};

export default DemandesRecuesList;