import React, { useState, useEffect } from 'react';
import { mouvementService } from '../../services/mouvementService';
import { stockService } from '../../services/stockService';
import './styles/StockMovementForm.css';

const StockMovementForm = ({ stock, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        type: 'ENTREE',
        quantite: 0,
        motif: '',
        commentaire: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const motifs = [
        { value: 'RECEPTION', label: 'Réception fournisseur' },
        { value: 'VENTE', label: 'Vente client' },
        { value: 'TRANSFERT', label: 'Transfert interne' },
        { value: 'CORRECTION', label: 'Correction inventaire' },
        { value: 'RETOUR', label: 'Retour client' },
        { value: 'QUALITE', label: 'Prélèvement qualité' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (formData.type === 'ENTREE') {
                result = await mouvementService.entreeStock(
                    stock.id,
                    formData.quantite,
                    formData.motif,
                    formData.commentaire
                );
            } else {
                result = await mouvementService.sortieStock(
                    stock.id,
                    formData.quantite,
                    formData.motif,
                    formData.commentaire
                );
            }
            setSuccess('Mouvement enregistré avec succès !');
            setTimeout(() => {
                if (onSuccess) onSuccess(result);
            }, 1500);
        } catch (err) {
            setError(err.message || 'Erreur lors du mouvement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="movement-form-container">
            <h3>{formData.type === 'ENTREE' ? '➕ Entrée de stock' : '➖ Sortie de stock'}</h3>
            
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <div className="stock-info">
                <p><strong>Article:</strong> {stock.articleDesignation}</p>
                <p><strong>Lot:</strong> {stock.lot}</p>
                <p><strong>Emplacement:</strong> {stock.emplacement}</p>
                <p><strong>Quantité actuelle:</strong> {stock.quantite}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Type de mouvement *</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        required
                    >
                        <option value="ENTREE">➕ Entrée en stock</option>
                        <option value="SORTIE">➖ Sortie de stock</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Quantité *</label>
                    <input
                        type="number"
                        value={formData.quantite}
                        onChange={(e) => setFormData({...formData, quantite: parseInt(e.target.value)})}
                        min="1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Motif *</label>
                    <select
                        value={formData.motif}
                        onChange={(e) => setFormData({...formData, motif: e.target.value})}
                        required
                    >
                        <option value="">Sélectionner un motif</option>
                        {motifs.map(m => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Commentaire (optionnel)</label>
                    <textarea
                        value={formData.commentaire}
                        onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                        rows="3"
                        placeholder="Informations complémentaires..."
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>
                        Annuler
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Traitement...' : 'Valider le mouvement'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StockMovementForm;