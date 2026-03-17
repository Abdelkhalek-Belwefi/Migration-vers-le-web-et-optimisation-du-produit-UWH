// ArticleList.js - Version corrigée et optimisée
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
import AddArticleModal from './AddArticleModal';
import './styles/ArticleList.css';

const ArticleList = () => {
    // États principaux
    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // États des modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // États de recherche
    const [searchParams, setSearchParams] = useState({
        code: '',
        designation: '',
        category: '',
        actif: ''
    });
    
    // État pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Rôle utilisateur
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'ADMINISTRATEUR';
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT';
    const canModify = isAdmin || isResponsable;

    // Chargement initial des articles
    useEffect(() => {
        fetchArticles();
    }, []);

    // Mise à jour des articles filtrés quand les articles ou les paramètres de recherche changent
    useEffect(() => {
        filterArticles();
    }, [articles, searchParams]);

    /**
     * Récupère tous les articles depuis l'API
     */
    const fetchArticles = async () => {
        try {
            setLoading(true);
            setError('');
            
            console.log('🔄 Chargement des articles...');
            const data = await articleService.getAllArticles();
            
            console.log('📋 Articles chargés:', data.length);
            
            // Vérification des données reçues
            if (data && data.length > 0) {
                console.log('✅ Premier article:', data[0]);
                console.log('🔍 Clés disponibles:', Object.keys(data[0]));
            }
            
            setArticles(data);
            setFilteredArticles(data);
            
        } catch (err) {
            console.error('❌ Erreur chargement:', err);
            setError(err.message || 'Erreur lors du chargement des articles');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Filtre les articles selon les critères de recherche
     */
    const filterArticles = () => {
        let filtered = [...articles];
        
        // Filtre par code (recherche dans codeERP, GTIN et numSerie)
        if (searchParams.code) {
            const searchTerm = searchParams.code.toLowerCase();
            filtered = filtered.filter(article => 
                (article.codeArticleERP && article.codeArticleERP.toLowerCase().includes(searchTerm)) ||
                (article.gtin && article.gtin.includes(searchTerm)) ||
                (article.numSerie && article.numSerie.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filtre par désignation/nom
        if (searchParams.designation) {
            const searchTerm = searchParams.designation.toLowerCase();
            filtered = filtered.filter(article => 
                article.designation && article.designation.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filtre par catégorie
        if (searchParams.category) {
            filtered = filtered.filter(article => 
                article.category && article.category.toLowerCase() === searchParams.category.toLowerCase()
            );
        }
        
        // Filtre par statut
        if (searchParams.actif !== '') {
            const isActive = searchParams.actif === 'true';
            filtered = filtered.filter(article => article.actif === isActive);
        }
        
        setFilteredArticles(filtered);
        setCurrentPage(1); // Reset à la première page après filtrage
    };

    /**
     * Gère la recherche avancée via l'API
     */
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
            
            console.log('🔍 Recherche avec paramètres:', params);
            
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

    /**
     * Gère les changements dans les champs de recherche
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Réinitialise tous les filtres de recherche
     */
    const handleReset = () => {
        setSearchParams({
            code: '',
            designation: '',
            category: '',
            actif: ''
        });
        fetchArticles(); // Recharge tous les articles
    };

    /**
     * Active un article
     */
    const handleActiver = async (id) => {
        try {
            setLoading(true);
            const updatedArticle = await articleService.activerArticle(id);
            
            setArticles(prev => prev.map(a => 
                a.id === id ? updatedArticle : a
            ));
            
            setSuccess('✅ Article activé avec succès');
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            console.error('❌ Erreur activation:', err);
            setError(err.message || "Erreur lors de l'activation");
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Désactive un article
     */
    const handleDesactiver = async (id) => {
        try {
            setLoading(true);
            const updatedArticle = await articleService.desactiverArticle(id);
            
            setArticles(prev => prev.map(a => 
                a.id === id ? updatedArticle : a
            ));
            
            setSuccess('✅ Article désactivé avec succès');
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            console.error('❌ Erreur désactivation:', err);
            setError(err.message || 'Erreur lors de la désactivation');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Prépare l'édition d'un article
     */
    const handleEdit = (article) => {
        console.log('✏️ Édition article:', article);
        setEditingArticle(article);
        setShowEditModal(true);
    };

    /**
     * Gère la mise à jour d'un article
     */
    const handleUpdate = async (updatedArticle) => {
        try {
            console.log('📝 Mise à jour reçue:', updatedArticle);
            
            // Mise à jour de la liste
            setArticles(prev => prev.map(a => 
                a.id === updatedArticle.id ? updatedArticle : a
            ));
            
            setShowEditModal(false);
            setEditingArticle(null);
            setSuccess('✅ Article modifié avec succès');
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            console.error('❌ Erreur modification:', err);
            setError(err.message || 'Erreur lors de la modification');
            setTimeout(() => setError(''), 3000);
        }
    };

    /**
     * Supprime un article
     */
    const handleDelete = async (id) => {
        // Confirmation de suppression
        if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
            return;
        }
        
        try {
            setLoading(true);
            console.log('🗑️ Suppression article id:', id);
            
            await articleService.deleteArticle(id);
            
            // Mise à jour de la liste
            setArticles(prev => prev.filter(a => a.id !== id));
            
            setSuccess('✅ Article supprimé avec succès');
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            console.error('❌ Erreur suppression:', err);
            
            // Message d'erreur plus explicite
            if (err.response?.status === 403) {
                setError('⛔ Vous n\'avez pas les droits pour supprimer cet article');
            } else if (err.response?.status === 404) {
                setError('❌ Article non trouvé');
            } else {
                setError(err.message || 'Erreur lors de la suppression');
            }
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Gère l'ajout d'un nouvel article
     */
    const handleArticleAdded = (newArticle) => {
        console.log('➕ Nouvel article ajouté:', newArticle);
        setArticles(prev => [...prev, newArticle]);
        setSuccess('✅ Article ajouté avec succès');
        setTimeout(() => setSuccess(''), 3000);
    };

    /**
     * Formate le GTIN pour l'affichage
     */
    const formatGTIN = (gtin) => {
        if (!gtin) return '-';
        if (gtin.length === 14) {
            return gtin.replace(/(\d{1})(\d{6})(\d{6})(\d{1})/, '$1 $2 $3 $4');
        }
        return gtin;
    };

    /**
     * Affiche le numéro de série avec gestion des cas vides
     */
    const displayNumSerie = (article) => {
        if (article.numSerie && article.numSerie.trim() !== '') {
            return article.numSerie;
        }
        return <span className="empty-value">-</span>;
    };

    /**
     * Pagination - Calcul des articles à afficher
     */
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

    /**
     * Change de page
     */
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Affichage du chargement
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
            {/* En-tête */}
            <div className="header">
                <div className="header-title">
                    <h2>
                         Articles
                        {filteredArticles.length > 0 && (
                            <span className="item-count">({filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''})</span>
                        )}
                    </h2>
                </div>
                
                {isAdmin && (
                    <button 
                        className="btn-add" 
                        onClick={() => setShowAddModal(true)}
                        disabled={loading}
                    >
                        <FaPlus /> Nouvel article
                    </button>
                )}
            </div>

            {/* Messages d'alerte */}
            {error && (
                <div className="alert error">
                    <FaExclamationTriangle /> {error}
                </div>
            )}
            
            {success && (
                <div className="alert success">
                    <FaCheck /> {success}
                </div>
            )}

            {/* Formulaire de recherche */}
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    

                    
                    <input
                        type="text"
                        name="category"
                        placeholder="Catégorie"
                        value={searchParams.category}
                        onChange={handleInputChange}
                        disabled={loading}
                        list="categories"
                    />
                    <datalist id="categories">
                        {[...new Set(articles.map(a => a.category).filter(Boolean))].map(cat => (
                            <option key={cat} value={cat} />
                        ))}
                    </datalist>
                    
                    <select 
                        name="actif" 
                        value={searchParams.actif} 
                        onChange={handleInputChange}
                        disabled={loading}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="true">Actifs uniquement</option>
                        <option value="false">Inactifs uniquement</option>
                    </select>
                    
                    <button 
                        type="submit" 
                        className="btn-search"
                        disabled={loading}
                    >
                        <FaSearch /> Rechercher
                    </button>
                    
                    <button 
                        type="button" 
                        className="btn-reset"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        <FaUndo /> Réinitialiser
                    </button>
                </form>
            </div>

            {/* Tableau des articles */}
            {filteredArticles.length === 0 ? (
                <div className="empty-state">
                    <FaBoxOpen className="empty-icon" />
                    <h3>Aucun article trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche ou ajoutez un nouvel article.</p>
                    {isAdmin && (
                        <button 
                            className="btn-add"
                            onClick={() => setShowAddModal(true)}
                        >
                            <FaPlus /> Ajouter un article
                        </button>
                    )}
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
                                        <td className="gtin-cell" title={article.gtin}>
                                            {formatGTIN(article.gtin)}
                                        </td>
                                        <td className="serial-cell" title={article.numSerie}>
                                            {displayNumSerie(article)}
                                        </td>
                                        <td className="designation-cell">{article.designation}</td>
                                        <td>{article.category || '-'}</td>
                                        <td>{article.uniteMesure || '-'}</td>
                                        <td className="number-cell">{article.poids?.toFixed(3)}</td>
                                        <td className="number-cell">{article.volume?.toFixed(3)}</td>
                                        <td className="lot-cell">{article.lotDefaut || '-'}</td>
                                        <td className="number-cell">{article.dureeExpirationJours || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${article.actif ? 'active' : 'inactive'}`}>
                                                {article.actif ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            {/* Boutons activation/désactivation */}
                                            {canModify && (
                                                <>
                                                    {article.actif ? (
                                                        <button
                                                            className="btn-deactivate"
                                                            onClick={() => handleDesactiver(article.id)}
                                                            title="Désactiver l'article"
                                                            disabled={loading}
                                                        >
                                                            <FaPause />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn-activate"
                                                            onClick={() => handleActiver(article.id)}
                                                            title="Activer l'article"
                                                            disabled={loading}
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            
                                            {/* Boutons modification/suppression (Admin uniquement) */}
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleEdit(article)}
                                                        title="Modifier l'article"
                                                        disabled={loading}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(article.id)}
                                                        title="Supprimer l'article"
                                                        disabled={loading}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="page-btn"
                            >
                                Précédent
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                    disabled={loading}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                                className="page-btn"
                            >
                                Suivant
                            </button>
                        </div>
                    )}
                </>
            )}

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