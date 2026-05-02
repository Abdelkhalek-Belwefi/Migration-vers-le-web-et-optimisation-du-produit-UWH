import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import entrepotService from '../../services/entrepotService ';
import MapPickerModal from './MapPickerModal';
import './EntrepotManagement.css';

const EntrepotManagement = () => {
    const [entrepots, setEntrepots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingEntrepot, setEditingEntrepot] = useState(null);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        ville: '',
        codePostal: '',
        pays: '',
        responsableNom: '',
        telephone: '',
        email: '',
        actif: true,
        latitude: null,
        longitude: null
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

    const handleLocationSelect = (location) => {
        setFormData({
            ...formData,
            adresse: location.address,
            latitude: location.lat,
            longitude: location.lng
        });
        setShowMapPicker(false);
        setSuccess(`📍 Position sélectionnée: ${location.address}`);
        setTimeout(() => setSuccess(''), 3000);
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
            actif: entrepot.actif !== undefined ? entrepot.actif : true,
            latitude: entrepot.latitude || null,
            longitude: entrepot.longitude || null
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
            actif: true,
            latitude: null,
            longitude: null
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
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input 
                                    type="text" 
                                    name="adresse" 
                                    value={formData.adresse} 
                                    onChange={handleInputChange} 
                                    style={{ flex: 1 }}
                                    placeholder="Adresse de l'entrepôt"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowMapPicker(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #4361ee, #3a56d4)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <FaMapMarkerAlt /> Choisir sur la carte
                                </button>
                            </div>
                            <small className="field-hint">
                                Cliquez sur le bouton pour sélectionner l'emplacement sur la carte
                            </small>
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
                        {formData.latitude && formData.longitude && (
                            <div className="entrepot_management-form-group">
                                <label>Coordonnées GPS</label>
                                <div style={{ background: '#f0f9ff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                                    📍 Latitude: {formData.latitude} | Longitude: {formData.longitude}
                                </div>
                            </div>
                        )}
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

            {showMapPicker && (
                <MapPickerModal
                    onClose={() => setShowMapPicker(false)}
                    onSelect={handleLocationSelect}
                    initialAddress={formData.adresse}
                />
            )}
        </div>
    );
};

export default EntrepotManagement;