import React, { useState, useEffect } from 'react';
import { getAllEntrepots } from '../../services/entrepotService ';
import { createCommandeTransfert } from '../../services/commandeService';
import { stockService } from '../../services/stockService';
import './DeclarerTransfertModal.css';

const DeclarerTransfertModal = ({ stock, onClose, onSuccess }) => {
    const [entrepots, setEntrepots] = useState([]);
    const [selectedEntrepotId, setSelectedEntrepotId] = useState('');
    const [quantiteDemandee, setQuantiteDemandee] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingStock, setLoadingStock] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stockSource, setStockSource] = useState(null);

    const userEntrepotId = localStorage.getItem('entrepotId');
    const userRole = localStorage.getItem('role');
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';

    useEffect(() => {
        if (isResponsable && stock) {
            loadEntrepots();
            setQuantiteDemandee(1);
            setStockSource(null);
            setSelectedEntrepotId('');
        }
    }, [stock, isResponsable]);

    const loadEntrepots = async () => {
        try {
            setLoading(true);
            const data = await getAllEntrepots();
            // Filtrer pour ne pas afficher l'entrepôt actuel
            const filteredEntrepots = data.filter(
                e => e.id.toString() !== userEntrepotId
            );
            setEntrepots(filteredEntrepots);
        } catch (err) {
            console.error('Erreur chargement entrepôts:', err);
            setError('Erreur lors du chargement des entrepôts');
        } finally {
            setLoading(false);
        }
    };

    const loadStockSource = async (entrepotId) => {
        if (!entrepotId || !stock?.articleId) return;
        
        setLoadingStock(true);
        setStockSource(null);
        setError('');
        
        try {
            const data = await stockService.getStockByArticleAndEntrepot(stock.articleId, entrepotId);
            setStockSource(data);
            // Réinitialiser la quantité si elle dépasse le stock disponible
            if (quantiteDemandee > data.quantite) {
                setQuantiteDemandee(data.quantite > 0 ? data.quantite : 1);
            }
        } catch (err) {
            console.error('Erreur chargement stock source:', err);
            setError(`Aucun stock disponible pour cet article dans l'entrepôt sélectionné`);
            setStockSource(null);
        } finally {
            setLoadingStock(false);
        }
    };

    const handleEntrepotChange = (e) => {
        const newId = e.target.value;
        setSelectedEntrepotId(newId);
        if (newId) {
            loadStockSource(newId);
        } else {
            setStockSource(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedEntrepotId) {
            setError('Veuillez sélectionner un entrepôt');
            return;
        }

        if (!stockSource) {
            setError('Veuillez attendre le chargement du stock disponible');
            return;
        }

        if (quantiteDemandee <= 0) {
            setError('La quantité doit être supérieure à 0');
            return;
        }

        if (quantiteDemandee > stockSource.quantite) {
            setError(`Quantité demandée (${quantiteDemandee}) supérieure au stock disponible (${stockSource.quantite})`);
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Logique CORRECTE :
            // - entrepotSourceId = l'entrepôt qui VA FOURNIR les articles
            // - entrepotDestinationId = l'entrepôt qui DEMANDE
            const commandeData = {
                typeCommande: 'TRANSFERT',
                entrepotSourceId: parseInt(selectedEntrepotId),
                entrepotDestinationId: parseInt(userEntrepotId),
                lignes: [
                    {
                        articleId: stock.articleId,
                        quantite: parseInt(quantiteDemandee),
                        prixUnitaire: 0
                    }
                ],
                notes: `Demande de transfert pour réapprovisionnement : ${stock.articleDesignation} (lot: ${stock.lot})`
            };

            console.log('📤 Données envoyées:', JSON.stringify(commandeData, null, 2));
            console.log('selectedEntrepotId:', selectedEntrepotId);
            console.log('userEntrepotId:', userEntrepotId);
            console.log('Stock source:', stockSource);

            await createCommandeTransfert(commandeData);
            
            setSuccess('✅ Demande de transfert envoyée avec succès !');
            
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Erreur création commande transfert:', err);
            console.error('Réponse erreur:', err.response?.data);
            setError(err.response?.data?.message || 'Erreur lors de la création de la demande');
        } finally {
            setLoading(false);
        }
    };

    if (!stock) return null;

    // Calcul de la quantité maximale disponible
    const maxQuantite = stockSource?.quantite || 0;
    const stockDisponible = stockSource?.quantite || 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="declarer-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>📤 Déclarer un besoin de réapprovisionnement</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="stock-info-card">
                        <h4>Article à réapprovisionner</h4>
                        <div className="info-row">
                            <span className="label">Article :</span>
                            <span className="value">{stock.articleDesignation}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Code :</span>
                            <span className="value">{stock.articleCode}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Lot :</span>
                            <span className="value">{stock.lot || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Emplacement :</span>
                            <span className="value">{stock.emplacement}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Stock actuel (dans cet entrepôt) :</span>
                            <span className={`value stock-quantite ${stock.quantite <= 10 ? 'critique' : ''}`}>
                                {stock.quantite} unités
                            </span>
                        </div>
                    </div>

                    {error && <div className="alert error">{error}</div>}
                    {success && <div className="alert success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Entrepôt fournisseur (à qui demander) *</label>
                            <select
                                value={selectedEntrepotId}
                                onChange={handleEntrepotChange}
                                required
                                disabled={loading || loadingStock || entrepots.length === 0}
                            >
                                <option value="">-- Sélectionner un entrepôt --</option>
                                {entrepots.map(ent => (
                                    <option key={ent.id} value={ent.id}>
                                        {ent.nom} ({ent.ville})
                                    </option>
                                ))}
                            </select>
                            {entrepots.length === 0 && !loading && (
                                <small className="field-hint warning">
                                    ⚠️ Aucun autre entrepôt disponible
                                </small>
                            )}
                            {loadingStock && (
                                <small className="field-hint">
                                    ⏳ Chargement du stock disponible...
                                </small>
                            )}
                        </div>

                        {stockSource && (
                            <div className="form-group">
                                <label>Quantité demandée *</label>
                                <input
                                    type="number"
                                    value={quantiteDemandee}
                                    onChange={(e) => setQuantiteDemandee(parseInt(e.target.value) || 1)}
                                    min="1"
                                    max={maxQuantite}
                                    required
                                    disabled={loading || loadingStock || !stockSource}
                                />
                                <small className="field-hint">
                                    Stock disponible dans l'entrepôt sélectionné : <strong>{stockDisponible}</strong> unités
                                </small>
                                {quantiteDemandee > stockDisponible && (
                                    <small className="field-hint warning">
                                        ⚠️ La quantité demandée dépasse le stock disponible !
                                    </small>
                                )}
                            </div>
                        )}

                        {!stockSource && selectedEntrepotId && !loadingStock && (
                            <div className="alert error">
                                Aucun stock disponible pour cet article dans l'entrepôt sélectionné.
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                className="btn-submit" 
                                disabled={loading || entrepots.length === 0 || !stockSource || quantiteDemandee > stockDisponible}
                            >
                                {loading ? 'Envoi en cours...' : '📦 Envoyer la demande'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeclarerTransfertModal;