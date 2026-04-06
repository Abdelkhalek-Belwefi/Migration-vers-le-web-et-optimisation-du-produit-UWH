import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { categoryService } from '../../services/categoryService';
import './CategoryManagement.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch (err) {
            setError('Erreur lors du chargement des catégories');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name.trim()) {
            setError('Le nom est obligatoire');
            return;
        }

        try {
            if (editingCategory) {
                await categoryService.updateCategory(editingCategory.id, formData);
                setSuccess('Catégorie modifiée avec succès');
            } else {
                await categoryService.createCategory(formData);
                setSuccess('Catégorie créée avec succès');
            }
            setFormData({ name: '', description: '' });
            setShowForm(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const handleEdit = (cat) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, description: cat.description || '' });
        setShowForm(true);
    };

    const handleDelete = async (cat) => {
        if (!window.confirm(`Supprimer la catégorie "${cat.name}" ?`)) return;
        try {
            await categoryService.deleteCategory(cat.id);
            setSuccess('Catégorie supprimée');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setError('');
    };

    if (loading) return <div className="cat-mgt-loading">Chargement des catégories...</div>;

    return (
        <div className="cat-mgt-container">
            <div className="cat-mgt-header">
                <h2>Gestion des catégories</h2>
                {!showForm && (
                    <button className="cat-mgt-btn-add" onClick={() => setShowForm(true)}>
                        <FaPlus /> Nouvelle catégorie
                    </button>
                )}
            </div>

            {error && <div className="cat-mgt-alert error">{error}</div>}
            {success && <div className="cat-mgt-alert success">{success}</div>}

            {showForm && (
                <div className="cat-mgt-form-card">
                    <h3>{editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="cat-mgt-form-group">
                            <label>Nom *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="cat-mgt-form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>
                        <div className="cat-mgt-form-actions">
                            <button type="button" className="cat-mgt-btn-cancel" onClick={handleCancel}>
                                <FaTimes /> Annuler
                            </button>
                            <button type="submit" className="cat-mgt-btn-submit">
                                <FaSave /> {editingCategory ? 'Modifier' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="cat-mgt-table-wrapper">
                <table className="cat-mgt-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td>{cat.name}</td>
                                <td>{cat.description || '-'}</td>
                                <td>
                                    <button className="cat-mgt-btn-edit" onClick={() => handleEdit(cat)}>
                                        <FaEdit />
                                    </button>
                                    <button className="cat-mgt-btn-delete" onClick={() => handleDelete(cat)}>
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

export default CategoryManagement;