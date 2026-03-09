import React, { useState, useEffect } from 'react';
import { receptionService } from '../../services/receptionService';
import ReceptionLineForm from './ReceptionLineForm';
import './styles/ReceptionDetail.css';

const ReceptionDetail = ({ receptionId, onBack, onValidate }) => {
    const [reception, setReception] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showLineForm, setShowLineForm] = useState(false);
    const [editingLine, setEditingLine] = useState(null);

    const userRole = localStorage.getItem('role');
    const isOperateur = userRole === 'OPERATEUR_ENTREPOT' || userRole === 'ADMINISTRATEUR';
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';
    const isEnAttente = reception?.statut === 'EN_ATTENTE';

    useEffect(() => {
        loadReception();
    }, [receptionId]);

    const loadReception = async () => {
        try {
            setLoading(true);
            const data = await receptionService.getReceptionById(receptionId);
            setReception(data);
            setError('');
        } catch (err) {
            setError('Erreur lors du chargement de la réception');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleValider = async () => {
        if (!window.confirm('Valider cette réception ? Cette action est irréversible.')) return;
        
        try {
            await onValidate(receptionId);
            setSuccess('Réception validée avec succès !');
            loadReception();
        } catch (err) {
            setError('Erreur lors de la validation');
        }
    };

    const handleLineAdded = () => {
        loadReception();
        setShowLineForm(false);
        setEditingLine(null);
    };

    const getStatutClass = (statut) => {
        switch(statut) {
            case 'EN_ATTENTE': return 'badge-warning';
            case 'VALIDEE': return 'badge-success';
            case 'ANNULEE': return 'badge-danger';
            default: return '';
        }
    };

    const getStatutLabel = (statut) => {
        switch(statut) {
            case 'EN_ATTENTE': return 'En attente';
            case 'VALIDEE': return 'Validée';
            case 'ANNULEE': return 'Annulée';
            default: return statut;
        }
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (!reception) return <div className="not-found">Réception non trouvée</div>;

    return (
        <div className="reception-detail-container">
            <div className="header">
                <h2>📋 Réception {reception.numeroPO}</h2>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <div className="reception-info-card">
                <h3>Informations générales</h3>
                <div className="info-grid">
                    <div className="info-row">
                        <span className="label">N° Bon de commande :</span>
                        <span className="value">{reception.numeroPO}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Fournisseur :</span>
                        <span className="value">{reception.fournisseur || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Bon de livraison :</span>
                        <span className="value">{reception.bonLivraison || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Date réception :</span>
                        <span className="value">
                            {new Date(reception.dateReception).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="label">Statut :</span>
                        <span className={`badge ${getStatutClass(reception.statut)}`}>
                            {getStatutLabel(reception.statut)}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="label">Créé par :</span>
                        <span className="value">{reception.createurNom || '-'}</span>
                    </div>
                    {reception.valideurNom && (
                        <div className="info-row">
                            <span className="label">Validé par :</span>
                            <span className="value">{reception.valideurNom}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="reception-lines-section">
                <div className="section-header">
                    <h3>Articles reçus</h3>
                    {isEnAttente && isOperateur && (
                        <button 
                            className="btn-add-line"
                            onClick={() => {
                                setEditingLine(null);
                                setShowLineForm(true);
                            }}
                        >
                            ➕ Ajouter un article
                        </button>
                    )}
                </div>

                {showLineForm && (
                    <ReceptionLineForm
                        receptionId={receptionId}
                        onLineAdded={handleLineAdded}
                        onCancel={() => {
                            setShowLineForm(false);
                            setEditingLine(null);
                        }}
                        editingLine={editingLine}
                    />
                )}

                <div className="table-container">
                    <table className="lines-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Qté commandée</th>
                                <th>Qté reçue</th>
                                <th>Lot</th>
                                <th>Emplacement</th>
                                <th>Statut</th>
                                {isEnAttente && isOperateur && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {reception.lignes.map(line => (
                                <tr key={line.id}>
                                    <td>{line.articleCode} - {line.articleDesignation}</td>
                                    <td>{line.quantiteAttendue}</td>
                                    <td className={line.quantiteRecue < line.quantiteAttendue ? 'partial' : 'complete'}>
                                        {line.quantiteRecue}
                                    </td>
                                    <td>{line.lot || '-'}</td>
                                    <td>{line.emplacementDestination || '-'}</td>
                                    <td>
                                        <span className={`line-status ${line.statut?.toLowerCase()}`}>
                                            {line.statut || 'EN_ATTENTE'}
                                        </span>
                                    </td>
                                    {isEnAttente && isOperateur && (
                                        <td>
                                            <button 
                                                className="btn-edit"
                                                onClick={() => {
                                                    setEditingLine(line);
                                                    setShowLineForm(true);
                                                }}
                                            >
                                                ✏️
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isEnAttente && isResponsable && (
                <div className="validation-section">
                    <button 
                        className="btn-validate-large"
                        onClick={handleValider}
                    >
                        ✅ Valider la réception
                    </button>
                    <p className="validation-info">
                        La validation générera automatiquement les tâches de rangement et mettra à jour le stock.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReceptionDetail;