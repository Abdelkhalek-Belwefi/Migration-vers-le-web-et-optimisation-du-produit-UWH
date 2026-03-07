import React, { useState, useEffect } from 'react';
import { mouvementService } from '../../services/mouvementService';
import { stockService } from '../../services/stockService';
import './styles/StockTransferForm.css';

const StockTransferForm = ({ stock, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        emplacementDestination: '',
        quantite: 1, // Valeur par défaut sécurisée
        motif: 'TRANSFERT',
        commentaire: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [emplacementsExistants, setEmplacementsExistants] = useState([]);

    useEffect(() => {
        const fetchEmplacements = async () => {
            try {
                const stocks = await stockService.getAllStocks();
                const emplacements = [...new Set(stocks.map(s => s.emplacement))];
                setEmplacementsExistants(emplacements);
            } catch (err) {
                console.error('Erreur chargement emplacements:', err);
            }
        };
        fetchEmplacements();
    }, []);

    // Mettre à jour la quantité quand le stock change
    useEffect(() => {
        if (stock && stock.quantite) {
            setFormData(prev => ({
                ...prev,
                quantite: 1 // Toujours commencer par 1
            }));
        }
    }, [stock]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        // Gérer les valeurs vides ou non numériques
        if (value === '' || value === null || value === undefined) {
            setFormData({ ...formData, quantite: 1 });
            return;
        }
        
        const parsed = parseInt(value, 10);
        // Vérifier que c'est un nombre valide
        if (!isNaN(parsed) && parsed > 0) {
            setFormData({ ...formData, quantite: parsed });
        } else {
            setFormData({ ...formData, quantite: 1 });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation côté frontend
        if (!formData.emplacementDestination.trim()) {
            setError("L'emplacement destination est requis");
            setLoading(false);
            return;
        }

        if (formData.quantite <= 0 || formData.quantite > stock.quantite) {
            setError(`La quantité doit être entre 1 et ${stock.quantite}`);
            setLoading(false);
            return;
        }

        try {
            console.log('Envoi du transfert:', {
                stockIdSource: stock.id,
                emplacementDestination: formData.emplacementDestination,
                quantite: formData.quantite,
                motif: formData.motif,
                commentaire: formData.commentaire
            });

            const result = await mouvementService.transfererStock(
                stock.id,
                formData.emplacementDestination,
                formData.quantite,
                formData.motif,
                formData.commentaire
            );
            
            console.log('✅ Résultat transfert:', result);
            setSuccess('Transfert effectué avec succès !');
            setTimeout(() => {
                if (onSuccess) onSuccess(result);
            }, 1500);
        } catch (err) {
            console.error('❌ Erreur transfert:', err);
            
            // Afficher un message d'erreur plus précis
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Erreur lors du transfert');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!stock) return null;

    return (
        <div className="transfer-form-container">
            <h3>🔄 Transfert de stock</h3>
            
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <div className="stock-info-card">
                <h4>Stock source</h4>
                <p><strong>Article:</strong> {stock.articleDesignation || '-'}</p>
                <p><strong>Code:</strong> {stock.articleCode || '-'}</p>
                <p><strong>Lot:</strong> {stock.lot || '-'}</p>
                <p><strong>Emplacement actuel:</strong> <span className="emplacement-badge">{stock.emplacement || '-'}</span></p>
                <p><strong>Quantité disponible:</strong> <span className="quantite-badge">{stock.quantite || 0}</span></p>
                <p><strong>Statut:</strong> <span className={`statut-badge statut-${stock.statut?.toLowerCase()}`}>
                    {stock.statut || '-'}
                </span></p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Emplacement destination *</label>
                    <input
                        type="text"
                        name="emplacementDestination"
                        value={formData.emplacementDestination}
                        onChange={handleInputChange}
                        required
                        list="emplacements-list"
                        placeholder="Ex: RAYON-B-05"
                    />
                    <datalist id="emplacements-list">
                        {emplacementsExistants.map(emp => (
                            <option key={emp} value={emp} />
                        ))}
                    </datalist>
                    <small>Entrez un nouvel emplacement ou choisissez dans la liste</small>
                </div>

                <div className="form-group">
                    <label>Quantité à transférer * (max: {stock.quantite || 0})</label>
                    <input
                        type="number"
                        name="quantite"
                        value={formData.quantite}
                        onChange={handleQuantityChange}
                        min="1"
                        max={stock.quantite || 1}
                        step="1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Motif du transfert *</label>
                    <select
                        name="motif"
                        value={formData.motif}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="TRANSFERT">🔄 Transfert interne</option>
                        <option value="REORGANISATION">📦 Réorganisation</option>
                        <option value="RETOUR_QUALITE">✅ Retour de contrôle qualité</option>
                        <option value="PRELEVEMENT">🔬 Prélèvement</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Commentaire (optionnel)</label>
                    <textarea
                        name="commentaire"
                        value={formData.commentaire}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Raison détaillée du transfert..."
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        className="btn-submit" 
                        disabled={loading || formData.quantite > (stock.quantite || 0) || formData.quantite <= 0}
                    >
                        {loading ? 'Transfert en cours...' : '✅ Confirmer le transfert'}
                    </button>
                </div>
            </form>

            <div className="transfer-info">
                <h4>Récapitulatif</h4>
                <p>Après transfert :</p>
                <ul>
                    <li><strong>Emplacement source ({stock.emplacement || '?'}) :</strong> {(stock.quantite || 0) - formData.quantite} unités restantes</li>
                    <li><strong>Emplacement destination ({formData.emplacementDestination || '?'}) :</strong> {formData.quantite} unités ajoutées</li>
                </ul>
            </div>
        </div>
    );
};

export default StockTransferForm;