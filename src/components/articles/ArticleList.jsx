import React, { useState, useEffect } from 'react';
import { 
    FaEdit, 
    FaTrash, 
    FaCheck, 
    FaPause,
    FaSearch,
    FaUndo,
    FaPlus,
    FaBarcode
} from 'react-icons/fa';
import { articleService } from '../../services/articleService';
import AddArticleModal from './AddArticleModal';
import './styles/ArticleList.css';

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchParams, setSearchParams] = useState({
        code: '',
        designation: '',
        category: '',
        actif: ''
    });

    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'ADMINISTRATEUR';
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT';
    const canModify = isAdmin || isResponsable; // Responsable peut activer/désactiver

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const data = await articleService.getAllArticles();
            setArticles(data);
            setError('');
        } catch (err) {
            setError('Erreur lors du chargement des articles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const params = {};
            if (searchParams.code) params.code = searchParams.code; // Recherche par code/GS1
            if (searchParams.designation) params.designation = searchParams.designation;
            if (searchParams.category) params.category = searchParams.category; // Filtre catégorie
            if (searchParams.actif !== '') params.actif = searchParams.actif === 'true';
            
            const data = await articleService.searchArticles(params);
            setArticles(data);
            setError('');
        } catch (err) {
            setError('Erreur lors de la recherche');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setSearchParams({
            ...searchParams,
            [e.target.name]: e.target.value
        });
    };

    const handleReset = () => {
        setSearchParams({
            code: '',
            designation: '',
            category: '',
            actif: ''
        });
        fetchArticles();
    };

    // Activation (disponible pour Admin et Responsable)
    const handleActiver = async (id) => {
        try {
            const updatedArticle = await articleService.activerArticle(id);
            setArticles(articles.map(a => a.id === id ? updatedArticle : a));
            setSuccess('Article activé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError("Erreur lors de l'activation");
            setTimeout(() => setError(''), 3000);
        }
    };

    // Désactivation (disponible pour Admin et Responsable)
    const handleDesactiver = async (id) => {
        try {
            const updatedArticle = await articleService.desactiverArticle(id);
            setArticles(articles.map(a => a.id === id ? updatedArticle : a));
            setSuccess('Article désactivé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors de la désactivation');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Modification (Admin uniquement)
    const handleEdit = (article) => {
        setEditingArticle(article);
        setShowEditModal(true);
    };

    const handleUpdate = async (updatedArticle) => {
        try {
            const result = await articleService.updateArticle(updatedArticle.id, updatedArticle);
            setArticles(articles.map(a => a.id === result.id ? result : a));
            setShowEditModal(false);
            setEditingArticle(null);
            setSuccess('Article modifié avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors de la modification');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Suppression (Admin uniquement)
    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            return;
        }
        try {
            await articleService.deleteArticle(id);
            setArticles(articles.filter(a => a.id !== id));
            setSuccess('Article supprimé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors de la suppression');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleArticleAdded = (newArticle) => {
        setArticles([...articles, newArticle]);
        setSuccess('Article ajouté avec succès');
        setTimeout(() => setSuccess(''), 3000);
    };

    const formatGTIN = (gtin) => {
        if (!gtin) return '-';
        // Formatage du GTIN pour lisibilité (ex: 0 123456 789012 3)
        return gtin.replace(/(\d{1})(\d{6})(\d{6})(\d{1})/, '$1 $2 $3 $4');
    };

    if (loading) return <div className="loading">Chargement des articles...</div>;

    return (
        <div className="article-list-container">
            <div className="header">
                <h2>Catalogue Articles</h2>
                {isAdmin && (
                    <button className="btn-add" onClick={() => setShowAddModal(true)}>
                        <FaPlus /> Nouvel article
                    </button>
                )}
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {/* Formulaire de recherche */}
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <FaBarcode className="search-icon" />
                        <input
                            type="text"
                            name="code"
                            placeholder="📷 Scanner code GS1 / Code ERP"
                            value={searchParams.code}
                            onChange={handleInputChange}
                            title="Scannez un code GS1 - le GTIN sera automatiquement extrait"
                        />
                    </div>
                    <input
                        type="text"
                        name="designation"
                        placeholder="Désignation"
                        value={searchParams.designation}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="category"
                        placeholder="Catégorie"
                        value={searchParams.category}
                        onChange={handleInputChange}
                    />
                    <select name="actif" value={searchParams.actif} onChange={handleInputChange}>
                        <option value="">Tous</option>
                        <option value="true">Actifs</option>
                        <option value="false">Inactifs</option>
                    </select>
                    <button type="submit" className="btn-search">
                        <FaSearch /> Rechercher
                    </button>
                    <button type="button" className="btn-reset" onClick={handleReset}>
                        <FaUndo /> Réinitialiser
                    </button>
                </form>
            </div>

            {/* Tableau des articles */}
            <div className="table-container">
                <table className="articles-table">
                    <thead>
                        <tr>
                            <th>Code ERP</th>
                            <th>GTIN (GS1)</th>
                            <th>Désignation</th>
                            <th>Catégorie</th>
                            <th>Unité</th>
                            <th>Poids (kg)</th>
                            <th>Volume (m³)</th>
                            <th>Lot défaut</th>
                            <th>Expiration (jours)</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map(article => (
                            <tr key={article.id}>
                                <td>{article.codeArticleERP}</td>
                                <td className="gtin-cell" title={article.gtin}>
                                    {formatGTIN(article.gtin)}
                                </td>
                                <td>{article.designation}</td>
                                <td>{article.category}</td>
                                <td>{article.uniteMesure}</td>
                                <td>{article.poids}</td>
                                <td>{article.volume}</td>
                                <td>{article.lotDefaut || '-'}</td>
                                <td>{article.dureeExpirationJours || '-'}</td>
                                <td>
                                    <span className={`status-badge ${article.actif ? 'active' : 'inactive'}`}>
                                        {article.actif ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="actions">
                                    {/* Admin et Responsable peuvent activer/désactiver */}
                                    {canModify && (
                                        <>
                                            {article.actif ? (
                                                <button
                                                    className="btn-deactivate"
                                                    onClick={() => handleDesactiver(article.id)}
                                                    title="Désactiver"
                                                >
                                                    <FaPause />
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-activate"
                                                    onClick={() => handleActiver(article.id)}
                                                    title="Activer"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}
                                        </>
                                    )}
                                    
                                    {/* Admin uniquement peut modifier et supprimer */}
                                    {isAdmin && (
                                        <>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(article)}
                                                title="Modifier"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(article.id)}
                                                title="Supprimer"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal d'ajout */}
            <AddArticleModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onArticleAdded={handleArticleAdded}
                roles={{ isAdmin, isResponsable }}
            />

            {/* Modal d'édition */}
            {showEditModal && editingArticle && (
                <AddArticleModal
                    show={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingArticle(null);
                    }}
                    onArticleAdded={handleUpdate}
                    articleToEdit={editingArticle}
                    isEditMode={true}
                    roles={{ isAdmin, isResponsable }}
                />
            )}
        </div>
    );
};

export default ArticleList;