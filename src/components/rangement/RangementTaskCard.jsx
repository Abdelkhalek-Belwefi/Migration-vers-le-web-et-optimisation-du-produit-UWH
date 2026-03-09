import React, { useState } from 'react';
import { FaPlay, FaCheck, FaMapMarkerAlt, FaBox, FaCalendarAlt } from 'react-icons/fa';
import './styles/RangementTaskCard.css';

const RangementTaskCard = ({ task, onStart, onComplete }) => {
    const [scanEmplacement, setScanEmplacement] = useState('');
    const [showScan, setShowScan] = useState(false);
    const [loading, setLoading] = useState(false);

    // Vérifier si l'utilisateur a les droits d'action
    const canAct = onStart !== null && onComplete !== null;

    const handleStart = async () => {
        setLoading(true);
        try {
            await onStart(task.id);
        } catch (error) {
            console.error('Erreur lors du démarrage:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!scanEmplacement) {
            alert('Veuillez scanner ou saisir l\'emplacement');
            return;
        }
        setLoading(true);
        try {
            await onComplete(task.id, scanEmplacement);
            setShowScan(false);
            setScanEmplacement('');
        } catch (error) {
            console.error('Erreur lors de la fin du rangement:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatutLabel = () => {
        switch(task.statut) {
            case 'A_FAIRE': return 'À faire';
            case 'EN_COURS': return 'En cours';
            case 'TERMINEE': return 'Terminée';
            default: return task.statut;
        }
    };

    const getStatutClass = () => {
        switch(task.statut) {
            case 'A_FAIRE': return 'badge-warning';
            case 'EN_COURS': return 'badge-info';
            case 'TERMINEE': return 'badge-success';
            default: return '';
        }
    };

    return (
        <div className={`task-card ${task.statut.toLowerCase().replace('_', '-')}`}>
            <div className="task-header">
                <h3>{task.articleDesignation}</h3>
                <span className={`badge ${getStatutClass()}`}>
                    {getStatutLabel()}
                </span>
            </div>

            <div className="task-details">
                <div className="detail-row">
                    <FaBox className="icon" />
                    <span className="label">Lot:</span>
                    <span className="value">{task.lot || '-'}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Quantité:</span>
                    <span className="value quantity">{task.quantite}</span>
                </div>
                <div className="detail-row">
                    <FaMapMarkerAlt className="icon" />
                    <span className="label">Destination:</span>
                    <span className="value destination">{task.emplacementDestination}</span>
                </div>
                {task.emplacementSource && (
                    <div className="detail-row">
                        <span className="label">Source:</span>
                        <span className="value">{task.emplacementSource}</span>
                    </div>
                )}
                {task.createdAt && (
                    <div className="detail-row">
                        <FaCalendarAlt className="icon" />
                        <span className="label">Créé le:</span>
                        <span className="value">{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {/* Actions pour l'opérateur uniquement */}
            {canAct && task.statut === 'A_FAIRE' && (
                <button 
                    className="btn-start"
                    onClick={handleStart}
                    disabled={loading}
                >
                    <FaPlay /> {loading ? 'Démarrage...' : 'Commencer le rangement'}
                </button>
            )}

            {canAct && task.statut === 'EN_COURS' && (
                <div className="complete-section">
                    {!showScan ? (
                        <button 
                            className="btn-scan"
                            onClick={() => setShowScan(true)}
                            disabled={loading}
                        >
                            📷 Scanner l'emplacement
                        </button>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Scannez l'emplacement..."
                                value={scanEmplacement}
                                onChange={(e) => setScanEmplacement(e.target.value)}
                                autoFocus
                                className="scan-input"
                                disabled={loading}
                            />
                            <button 
                                className="btn-complete"
                                onClick={handleComplete}
                                disabled={loading || !scanEmplacement}
                            >
                                <FaCheck /> {loading ? 'Confirmation...' : 'Confirmer le rangement'}
                            </button>
                            <button 
                                className="btn-cancel-scan"
                                onClick={() => setShowScan(false)}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Message pour le responsable (pas d'actions) */}
            {!canAct && task.statut === 'A_FAIRE' && (
                <div className="info-message">
                    ⏳ En attente d'un opérateur
                </div>
            )}
            {!canAct && task.statut === 'EN_COURS' && (
                <div className="info-message">
                    🔄 En cours de traitement
                </div>
            )}
            {!canAct && task.statut === 'TERMINEE' && (
                <div className="info-message">
                    ✅ Rangement terminé
                </div>
            )}
        </div>
    );
};

export default RangementTaskCard;