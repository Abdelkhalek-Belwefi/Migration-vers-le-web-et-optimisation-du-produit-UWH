// src/components/commercial/CommandeForm.jsx
import React, { useState, useEffect } from 'react';
import * as clientService from '../../services/clientService';   // ← import namespace
import * as articleService from '../../services/articleService'; // ← import namespace
import { createCommande, updateCommande } from '../../services/commandeService';
import LigneCommandeForm from './LigneCommandeForm';

const CommandeForm = ({ commande, onSuccess, onCancel }) => {
    const [clients, setClients] = useState([]);
    const [articles, setArticles] = useState([]);
    const [formData, setFormData] = useState({
        clientId: commande?.clientId || '',
        dateLivraisonSouhaitee: commande?.dateLivraisonSouhaitee || '',
        notes: commande?.notes || '',
        lignes: commande?.lignes?.map(l => ({
            articleId: l.articleId,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire
        })) || []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [clientsData, articlesData] = await Promise.all([
                    clientService.getAllClients(),
                    articleService.getAllArticles()
                ]);
                setClients(clientsData);
                setArticles(articlesData);
            } catch (err) {
                setError('Erreur de chargement des données');
                console.error(err);
            }
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddLigne = () => {
        setFormData({
            ...formData,
            lignes: [...formData.lignes, { articleId: '', quantite: 1, prixUnitaire: '' }]
        });
    };

    const handleLigneChange = (index, field, value) => {
        const newLignes = [...formData.lignes];
        newLignes[index][field] = value;
        setFormData({ ...formData, lignes: newLignes });
    };

    const handleRemoveLigne = (index) => {
        const newLignes = formData.lignes.filter((_, i) => i !== index);
        setFormData({ ...formData, lignes: newLignes });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.clientId) {
            setError('Veuillez sélectionner un client');
            return;
        }
        if (formData.lignes.length === 0) {
            setError('Ajoutez au moins un article');
            return;
        }

        const payload = {
            clientId: parseInt(formData.clientId),
            dateLivraisonSouhaitee: formData.dateLivraisonSouhaitee || null,
            notes: formData.notes || '',
            lignes: formData.lignes.map(l => ({
                articleId: parseInt(l.articleId),
                quantite: parseInt(l.quantite) || 1,
                prixUnitaire: l.prixUnitaire ? parseFloat(l.prixUnitaire) : null
            }))
        };

        setLoading(true);
        setError('');
        try {
            if (commande) {
                await updateCommande(commande.id, payload);
            } else {
                await createCommande(payload);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="commande-form">
            <h3>{commande ? 'Modifier la commande' : 'Nouvelle commande'}</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Client *</label>
                    <select
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Sélectionner un client</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Date de livraison souhaitée</label>
                    <input
                        type="date"
                        name="dateLivraisonSouhaitee"
                        value={formData.dateLivraisonSouhaitee}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="2"
                    />
                </div>

                <h4>Articles</h4>
                {formData.lignes.map((ligne, index) => (
                    <LigneCommandeForm
                        key={index}
                        ligne={ligne}
                        index={index}
                        articles={articles}
                        onChange={handleLigneChange}
                        onRemove={handleRemoveLigne}
                    />
                ))}

                <button type="button" className="btn-add-ligne" onClick={handleAddLigne}>
                    + Ajouter un article
                </button>

                <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={onCancel}>
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommandeForm;