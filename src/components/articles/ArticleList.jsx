// ArticleList.js - Version corrigée (gestion des erreurs catégories)
import React, { useState, useEffect, useCallback } from 'react';
import { 
    FaEdit, 
    FaTrash, 
    FaCheck, 
    FaPause,
    FaSearch,
    FaUndo,
    FaPlus,
    FaBarcode,
    FaHashtag,
    FaExclamationTriangle,
    FaBoxOpen,
    FaSync
} from 'react-icons/fa';
import { articleService } from '../../services/articleService';
import { categoryService } from '../../services/categoryService';
import AddArticleModal from './AddArticleModal';
import './styles/ArticleList.css';

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
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
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    const [categoriesList, setCategoriesList] = useState([]); // toujours un tableau
    
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'ADMINISTRATEUR';
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT';
    const canModify = isAdmin || isResponsable;

    useEffect(() => {
        fetchArticles();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterArticles();
    }, [articles, searchParams]);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await articleService.getAllArticles();
            setArticles(data);
            setFilteredArticles(data);
        } catch (err) {
            console.error('❌ Erreur chargement:', err);
            setError(err.message || 'Erreur lors du chargement des articles');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            // S'assurer que c'est un tableau
            setCategoriesList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('❌ Erreur chargement des catégories:', err);
            setCategoriesList([]); // fallback sûr
        }
    };

    const filterArticles = () => {
        let filtered = [...articles];
        
        if (searchParams.code) {
            const searchTerm = searchParams.code.toLowerCase();
            filtered = filtered.filter(article => 
                (article.codeArticleERP && article.codeArticleERP.toLowerCase().includes(searchTerm)) ||
                (article.gtin && article.gtin.includes(searchTerm)) ||
                (article.numSerie && article.numSerie.toLowerCase().includes(searchTerm))
            );
        }
        
        if (searchParams.designation) {
            const searchTerm = searchParams.designation.toLowerCase();
            filtered = filtered.filter(article => 
                article.designation && article.designation.toLowerCase().includes(searchTerm)
            );
        }
        
        if (searchParams.category) {
            filtered = filtered.filter(article => 
                article.category && article.category === searchParams.category
            );
        }
        
        if (searchParams.actif !== '') {
            const isActive = searchParams.actif === 'true';
            filtered = filtered.filter(article => article.actif === isActive);
        }
        
        setFilteredArticles(filtered);
        setCurrentPage(1);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            const params = {};
            if (searchParams.code) params.code = searchParams.code;
            if (searchParams.designation) params.designation = searchParams.designation;
            if (searchParams.category) params.category = searchParams.category;
            if (searchParams.actif !== '') params.actif = searchParams.actif === 'true';
            
            const data = await articleService.searchArticles(params);
            setArticles(data);
            setSuccess(`Recherche terminée : ${data.length} résultat(s)`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('❌ Erreur recherche:', err);
            setError(err.message || 'Erreur lors de la recherche');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setSearchParams({ code: '', designation: '', category: '', actif: '' });
        fetchArticles();
    };

    const handleActiver = async (id) => {
        try {
            setLoading(true);
            const updated = await articleService.activerArticle(id);
            setArticles(prev => prev.map(a => a.id === id ? updated : a));
            setSuccess('✅ Article activé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || "Erreur lors de l'activation");
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDesactiver = async (id) => {
        try {
            setLoading(true);
            const updated = await articleService.desactiverArticle(id);
            setArticles(prev => prev.map(a => a.id === id ? updated : a));
            setSuccess('✅ Article désactivé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors de la désactivation');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (article) => {
        setEditingArticle(article);
        setShowEditModal(true);
    };

    const handleUpdate = async (updatedArticle) => {
        try {
            setArticles(prev => prev.map(a => a.id === updatedArticle.id ? updatedArticle : a));
            setShowEditModal(false);
            setEditingArticle(null);
            setSuccess('✅ Article modifié avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors de la modification');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet article ?')) return;
        try {
            setLoading(true);
            await articleService.deleteArticle(id);
            setArticles(prev => prev.filter(a => a.id !== id));
            setSuccess('✅ Article supprimé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            if (err.response?.status === 403) setError('⛔ Droits insuffisants');
            else if (err.response?.status === 404) setError('❌ Article non trouvé');
            else setError(err.message || 'Erreur lors de la suppression');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleArticleAdded = (newArticle) => {
        setArticles(prev => [...prev, newArticle]);
        setSuccess('✅ Article ajouté avec succès');
        setTimeout(() => setSuccess(''), 3000);
    };

    const formatGTIN = (gtin) => {
        if (!gtin) return '-';
        if (gtin.length === 14) return gtin.replace(/(\d{1})(\d{6})(\d{6})(\d{1})/, '$1 $2 $3 $4');
        return gtin;
    };

    const displayNumSerie = (article) => article.numSerie?.trim() ? article.numSerie : <span className="empty-value">-</span>;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading && articles.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement des articles...</p>
            </div>
        );
    }

    return (
        <div className="article-list-container">
            <div className="header">
                <div className="header-title">
                    <h2>Articles {filteredArticles.length > 0 && <span className="item-count">({filteredArticles.length})</span>}</h2>
                </div>
                {isAdmin && (
                    <button className="btn-add" onClick={() => setShowAddModal(true)} disabled={loading}>
                        <FaPlus /> Nouvel article
                    </button>
                )}
            </div>

            {error && <div className="alert error"><FaExclamationTriangle /> {error}</div>}
            {success && <div className="alert success"><FaCheck /> {success}</div>}

            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <select
                        name="category"
                        value={searchParams.category}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="category-select"
                    >
                        <option value="">Toutes les catégories</option>
                        {Array.isArray(categoriesList) && categoriesList.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>

                    <select name="actif" value={searchParams.actif} onChange={handleInputChange} disabled={loading}>
                        <option value="">Tous les statuts</option>
                        <option value="true">Actifs</option>
                        <option value="false">Inactifs</option>
                    </select>

                    <button type="submit" className="btn-search" disabled={loading}><FaSearch /> Rechercher</button>
                    <button type="button" className="btn-reset" onClick={handleReset} disabled={loading}><FaUndo /> Réinitialiser</button>
                </form>
            </div>

            {filteredArticles.length === 0 ? (
                <div className="empty-state">
                    <FaBoxOpen className="empty-icon" />
                    <h3>Aucun article trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche ou ajoutez un nouvel article.</p>
                    {isAdmin && <button className="btn-add" onClick={() => setShowAddModal(true)}><FaPlus /> Ajouter un article</button>}
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="articles-table">
                            <thead>
                                <tr>
                                    <th>Code ERP</th>
                                    <th>GTIN (GS1)</th>
                                    <th><FaHashtag /> N° Série</th>
                                    <th>Nom</th>
                                    <th>Catégorie</th>
                                    <th>Unité</th>
                                    <th>Poids (kg)</th>
                                    <th>Volume (m³)</th>
                                    <th>Lot défaut</th>
                                    <th>Expiration (j)</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(article => (
                                    <tr key={article.id} className={!article.actif ? 'inactive-row' : ''}>
                                        <td className="code-cell">{article.codeArticleERP}</td>
                                        <td className="gtin-cell" title={article.gtin}>{formatGTIN(article.gtin)}</td>
                                        <td className="serial-cell" title={article.numSerie}>{displayNumSerie(article)}</td>
                                        <td className="designation-cell">{article.designation}</td>
                                        <td>{article.category || '-'}</td>
                                        <td>{article.uniteMesure || '-'}</td>
                                        <td className="number-cell">{article.poids?.toFixed(3)}</td>
                                        <td className="number-cell">{article.volume?.toFixed(3)}</td>
                                        <td className="lot-cell">{article.lotDefaut || '-'}</td>
                                        <td className="number-cell">{article.dureeExpirationJours || '-'}</td>
                                        <td><span className={`status-badge ${article.actif ? 'active' : 'inactive'}`}>{article.actif ? 'Actif' : 'Inactif'}</span></td>
                                        <td className="actions">
                                            {canModify && (
                                                <>
                                                    {article.actif ? (
                                                        <button className="btn-deactivate" onClick={() => handleDesactiver(article.id)} title="Désactiver" disabled={loading}><FaPause /></button>
                                                    ) : (
                                                        <button className="btn-activate" onClick={() => handleActiver(article.id)} title="Activer" disabled={loading}><FaCheck /></button>
                                                    )}
                                                </>
                                            )}
                                            {isAdmin && (
                                                <>
                                                    <button className="btn-edit" onClick={() => handleEdit(article)} title="Modifier" disabled={loading}><FaEdit /></button>
                                                    <button className="btn-delete" onClick={() => handleDelete(article.id)} title="Supprimer" disabled={loading}><FaTrash /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1 || loading} className="page-btn">Précédent</button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i+1} onClick={() => paginate(i+1)} className={`page-btn ${currentPage === i+1 ? 'active' : ''}`} disabled={loading}>{i+1}</button>
                            ))}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || loading} className="page-btn">Suivant</button>
                        </div>
                    )}
                </>
            )}

            <AddArticleModal show={showAddModal} onClose={() => setShowAddModal(false)} onArticleAdded={handleArticleAdded} roles={{ isAdmin, isResponsable }} />
            {showEditModal && editingArticle && (
                <AddArticleModal show={showEditModal} onClose={() => { setShowEditModal(false); setEditingArticle(null); }} onArticleAdded={handleUpdate} articleToEdit={editingArticle} isEditMode={true} roles={{ isAdmin, isResponsable }} />
            )}
        </div>
    );
};

export default ArticleList;