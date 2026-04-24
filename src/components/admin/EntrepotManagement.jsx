import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import entrepotService from '../../services/entrepotService ';
import './EntrepotManagement.css';

const EntrepotManagement = () => {
    const [entrepots, setEntrepots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingEntrepot, setEditingEntrepot] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        ville: '',
        codePostal: '',
        pays: '',
        responsableNom: '',
        telephone: '',
        email: '',
        actif: true
    });

    useEffect(() => {
        fetchEntrepots();
    }, []);

    const fetchEntrepots = async () => {
        try {
            setLoading(true);
            const data = await entrepotService.getAllEntrepots();
            setEntrepots(data);
        } catch (err) {
            setError('Erreur lors du chargement des entrepôts');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.nom.trim()) {
            setError('Le nom est obligatoire');
            return;
        }

        try {
            if (editingEntrepot) {
                await entrepotService.updateEntrepot(editingEntrepot.id, formData);
                setSuccess('Entrepôt modifié avec succès');
            } else {
                await entrepotService.createEntrepot(formData);
                setSuccess('Entrepôt créé avec succès');
            }
            resetForm();
            fetchEntrepots();
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
        }
    };

    const handleEdit = (entrepot) => {
        setEditingEntrepot(entrepot);
        setFormData({
            nom: entrepot.nom || '',
            adresse: entrepot.adresse || '',
            ville: entrepot.ville || '',
            codePostal: entrepot.codePostal || '',
            pays: entrepot.pays || '',
            responsableNom: entrepot.responsableNom || '',
            telephone: entrepot.telephone || '',
            email: entrepot.email || '',
            actif: entrepot.actif !== undefined ? entrepot.actif : true
        });
        setShowForm(true);
    };

    const handleDelete = async (entrepot) => {
        if (!window.confirm(`Supprimer l'entrepôt "${entrepot.nom}" ?`)) return;
        try {
            await entrepotService.deleteEntrepot(entrepot.id);
            setSuccess('Entrepôt supprimé');
            fetchEntrepots();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            nom: '',
            adresse: '',
            ville: '',
            codePostal: '',
            pays: '',
            responsableNom: '',
            telephone: '',
            email: '',
            actif: true
        });
        setShowForm(false);
        setEditingEntrepot(null);
        setError('');
    };

    if (loading) return <div className="entrepot_management-loading">Chargement des entrepôts...</div>;

    return (
        <div className="entrepot_management-container">
            <div className="entrepot_management-header">
                <h2>Gestion des entrepôts</h2>
                {!showForm && (
                    <button className="entrepot_management-btn-add" onClick={() => setShowForm(true)}>
                        <FaPlus /> Nouvel entrepôt
                    </button>
                )}
            </div>

            {error && <div className="entrepot_management-alert error">{error}</div>}
            {success && <div className="entrepot_management-alert success">{success}</div>}

            {showForm && (
                <div className="entrepot_management-form-card">
                    <h3>{editingEntrepot ? "Modifier l'entrepôt" : 'Ajouter un entrepôt'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="entrepot_management-form-group">
                            <label>Nom *</label>
                            <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} required />
                        </div>
                        <div className="entrepot_management-form-group">
                            <label>Adresse</label>
                            <input type="text" name="adresse" value={formData.adresse} onChange={handleInputChange} />
                        </div>
                        <div className="entrepot_management-form-group">
                            <label>Ville</label>
                            <input type="text" name="ville" value={formData.ville} onChange={handleInputChange} />
                        </div>
                        <div className="entrepot_management-form-group">
                            <label>Code Postal</label>
                            <input type="text" name="codePostal" value={formData.codePostal} onChange={handleInputChange} />
                        </div>
                        <div className="entrepot_management-form-group">
                            <label>Pays</label>
                            <input type="text" name="pays" value={formData.pays} onChange={handleInputChange} />
                        </div>
                        <div className="entrepot_management-form-group">
                            <label>Responsable (nom)</label>
                            <input type="text" name="responsableNom" value={formData.responsableNom} onChange={handleInputChange} />
                        </div>
                        <div className="entrepot_management-form-group">
                            <label>Téléphone</label>
                            <input type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} />
                        </div>
                        <div className="entrepot_management-form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div className="entrepot_management-form-group">
                            <label>
                                <input type="checkbox" name="actif" checked={formData.actif} onChange={handleInputChange} />
                                {' '}Actif
                            </label>
                        </div>
                        <div className="entrepot_management-form-actions">
                            <button type="button" className="entrepot_management-btn-cancel" onClick={resetForm}>
                                <FaTimes /> Annuler
                            </button>
                            <button type="submit" className="entrepot_management-btn-submit">
                                <FaSave /> {editingEntrepot ? 'Modifier' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="entrepot_management-table-wrapper">
                <table className="entrepot_management-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Ville</th>
                            <th>Responsable</th>
                            <th>Actif</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entrepots.map(ent => (
                            <tr key={ent.id}>
                                <td>{ent.id}</td>
                                <td>{ent.nom}</td>
                                <td>{ent.ville || '-'}</td>
                                <td>{ent.responsableNom || '-'}</td>
                                <td>{ent.actif ? 'Oui' : 'Non'}</td>
                                <td>
                                    <button className="entrepot_management-btn-edit" onClick={() => handleEdit(ent)}>
                                        <FaEdit />
                                    </button>
                                    <button className="entrepot_management-btn-delete" onClick={() => handleDelete(ent)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EntrepotManagement;