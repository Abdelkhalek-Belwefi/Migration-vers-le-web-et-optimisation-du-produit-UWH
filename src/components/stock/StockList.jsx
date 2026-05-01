import React, { useState, useEffect, useRef } from 'react';
import { 
    FaPrint, 
    FaSortAmountDown, 
    FaSortAmountUp, 
    FaSearch, 
    FaBarcode,
    FaTimes,
    FaFilter,
    FaQrcode,
    FaBoxes,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';
import { stockService } from '../../services/stockService';
import { articleService } from '../../services/articleService';
import StockDetailModal from './StockDetailModal';
import StockTransferForm from './StockTransferForm';
import './styles/StockList.css';

const StockList = () => {
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [stockToTransfer, setStockToTransfer] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: 'emplacement',
        direction: 'asc'
    });
    const [searchParams, setSearchParams] = useState({
        articleId: '',
        lot: '',
        emplacement: '',
        statut: ''
    });

    // États pour le mode de filtre
    const [filterMode, setFilterMode] = useState('normal');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [scanParams, setScanParams] = useState({
        lotScan: '',
        emplacementScan: '',
        articleCodeScan: ''
    });
    const [scanLoading, setScanLoading] = useState(false);
    const lotScanRef = useRef(null);
    const emplacementScanRef = useRef(null);
    const articleScanRef = useRef(null);

    // ========== NOUVEAUX ÉTATS POUR L'AMÉLIORATION SCAN ARTICLE ==========
    const [scannedArticle, setScannedArticle] = useState(null);        // { id, code, designation, quantiteTotale }
    const [scannedArticleStocks, setScannedArticleStocks] = useState([]); // liste des stocks détaillés
    const [showStockTableForScanned, setShowStockTableForScanned] = useState(false);
    // ====================================================================

    const userRole = localStorage.getItem('role');
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';

    useEffect(() => {
        fetchStocks();
    }, []);

    useEffect(() => {
        applySort();
    }, [stocks, sortConfig]);

    const fetchStocks = async () => {
        try {
            setLoading(true);
            const data = await stockService.getAllStocks();
            // 🔹 FILTRER LES STOCKS À 0
            const filteredData = data.filter(stock => stock.quantite > 0);
            setStocks(filteredData);
            setFilteredStocks(filteredData);
            setError('');
        } catch (err) {
            setError('Erreur lors du chargement des stocks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applySort = () => {
        const sorted = [...stocks].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'dateReception' || sortConfig.key === 'dateExpiration') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredStocks(sorted);
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Recherche normale
    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const params = {};
            if (searchParams.articleId) params.articleId = searchParams.articleId;
            if (searchParams.lot) params.lot = searchParams.lot;
            if (searchParams.emplacement) params.emplacement = searchParams.emplacement;
            if (searchParams.statut) params.statut = searchParams.statut;

            const data = await stockService.searchStocks(params);
            // 🔹 FILTRER LES STOCKS À 0
            const filteredData = data.filter(stock => stock.quantite > 0);
            setStocks(filteredData);
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

    // Réinitialisation complète (y compris le nouveau scan article)
    const handleReset = () => {
        setSearchParams({
            articleId: '',
            lot: '',
            emplacement: '',
            statut: ''
        });
        setScanParams({
            lotScan: '',
            emplacementScan: '',
            articleCodeScan: ''
        });
        // Réinitialiser les états du scan article amélioré
        setScannedArticle(null);
        setScannedArticleStocks([]);
        setShowStockTableForScanned(false);
        fetchStocks();
    };

    // ========== GESTION DU SCAN AVEC AMÉLIORATION POUR L'ARTICLE ==========
    const handleScan = async (field, value) => {
        if (!value || value.trim() === '') return;
        setScanLoading(true);
        try {
            setScanParams(prev => ({ ...prev, [field]: value }));

            // Cas du scan par CODE ARTICLE (amélioration demandée)
            if (field === 'articleCodeScan') {
                // 1. Récupérer l'article via son code barre
                const article = await articleService.findByCode(value);
                if (!article) {
                    setError('Aucun article trouvé avec ce code');
                    setScanLoading(false);
                    return;
                }

                // 2. Récupérer tous les stocks de cet article
                const stocksByArticle = await stockService.getStocksByArticle(article.id);
                // 🔹 FILTRER LES STOCKS À 0
                const filteredStocksByArticle = stocksByArticle.filter(s => s.quantite > 0);
                
                // 3. Calculer la quantité totale
                const quantiteTotale = filteredStocksByArticle.reduce((sum, s) => sum + s.quantite, 0);
                
                // 4. Mettre à jour les états : afficher la carte récap
                setScannedArticle({
                    id: article.id,
                    code: article.codeArticleERP,
                    designation: article.designation,
                    quantiteTotale: quantiteTotale
                });
                setScannedArticleStocks(filteredStocksByArticle);
                setShowStockTableForScanned(false);  // tableau caché au départ
                setError('');
                
                // Optionnel : vider le champ après scan
                if (articleScanRef.current) articleScanRef.current.value = '';
                return;
            }

            // Pour les scans LOT ou EMPLACEMENT : comportement inchangé
            const params = {};
            if (field === 'lotScan') params.lot = value;
            if (field === 'emplacementScan') params.emplacement = value;

            const data = await stockService.searchStocks(params);
            // 🔹 FILTRER LES STOCKS À 0
            const filteredData = data.filter(stock => stock.quantite > 0);
            setStocks(filteredData);
            setError('');
            
            // Réinitialiser l'affichage du scan article amélioré
            setScannedArticle(null);
            setScannedArticleStocks([]);
            setShowStockTableForScanned(false);

        } catch (err) {
            setError('Erreur lors de la recherche par scan');
            console.error(err);
        } finally {
            setScanLoading(false);
        }
    };

    const handleScanKeyPress = (e, field) => {
        if (e.key === 'Enter') {
            handleScan(field, e.target.value);
            e.target.value = '';
        }
    };

    const handleScanBlur = (e, field) => {
        if (e.target.value.trim() !== '') {
            handleScan(field, e.target.value);
            e.target.value = '';
        }
    };

    // Afficher le tableau détaillé au clic sur la carte récap
    const handleScannedArticleClick = () => {
        setShowStockTableForScanned(true);
    };

    // Fermer le détail du scan article
    const handleCloseScannedSummary = () => {
        setScannedArticle(null);
        setScannedArticleStocks([]);
        setShowStockTableForScanned(false);
    };
    // ==================================================================

    // Autres fonctions (inchangées)
    const handleRowClick = (stock) => {
        setSelectedStock(stock);
        setShowDetailModal(true);
    };

    const handleChangerStatut = async (id, nouveauStatut) => {
        if (!nouveauStatut) return;
        if (!window.confirm(`Voulez-vous changer le statut en ${getStatutLabel(nouveauStatut)} ?`)) return;
        try {
            setLoading(true);
            const updated = await stockService.changerStatut(id, nouveauStatut);
            setStocks(stocks.map(s => s.id === id ? updated : s));
            setFilteredStocks(filteredStocks.map(s => s.id === id ? updated : s));
            setSuccess('Statut mis à jour avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors du changement de statut');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = (stock) => {
        setStockToTransfer(stock);
        setShowTransferForm(true);
        setShowDetailModal(false);
    };

    const handleTransferSuccess = () => {
        setShowTransferForm(false);
        fetchStocks();
        setSuccess('Transfert effectué avec succès');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handlePrint = (stock) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Fiche Stock - Lot ${stock.lot}</title>
                    <style>
                        body { font-family: Arial; padding: 20px; }
                        h1 { color: #4361ee; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background: #f8f9fa; }
                    </style>
                </head>
                <body>
                    <h1>Fiche de stock</h1>
                    <table>
                        <tr><th>ID</th><td>${stock.id}</td></tr>
                        <tr><th>Article</th><td>${stock.articleDesignation} (${stock.articleCode})</td></tr>
                        <tr><th>Lot</th><td>${stock.lot}</td></tr>
                        <tr><th>Emplacement</th><td>${stock.emplacement}</td></tr>
                        <tr><th>Quantité</th><td>${stock.quantite}</td></tr>
                        <tr><th>Statut</th><td>${stock.statut}</td></tr>
                        <tr><th>Date réception</th><td>${stock.dateReception ? new Date(stock.dateReception).toLocaleDateString() : '-'}</td></tr>
                        <tr><th>Date expiration</th><td>${stock.dateExpiration ? new Date(stock.dateExpiration).toLocaleDateString() : '-'}</td></tr>
                    </table>
                    <p style="margin-top: 30px;">Imprimé le ${new Date().toLocaleString()}</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handlePrintList = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Liste des stocks</title>
                    <style>
                        body { font-family: Arial; padding: 20px; }
                        h1 { color: #4361ee; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background: #f8f9fa; }
                        .disponible { color: #28a745; font-weight: bold; }
                        .reserve { color: #ffc107; font-weight: bold; }
                        .bloque { color: #dc3545; font-weight: bold; }
                        .qualite { color: #fd7e14; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Liste des stocks</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Article</th>
                                <th>Lot</th>
                                <th>Emplacement</th>
                                <th>Quantité</th>
                                <th>Statut</th>
                                <th>Réception</th>
                                <th>Expiration</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredStocks.map(s => `
                                <tr>
                                    <td>${s.id}</td>
                                    <td>${s.articleDesignation}</td>
                                    <td>${s.lot}</td>
                                    <td>${s.emplacement}</td>
                                    <td>${s.quantite}</td>
                                    <td class="${s.statut.toLowerCase()}">${s.statut}</td>
                                    <td>${s.dateReception ? new Date(s.dateReception).toLocaleDateString() : '-'}</td>
                                    <td>${s.dateExpiration ? new Date(s.dateExpiration).toLocaleDateString() : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <p style="margin-top: 30px;">Imprimé le ${new Date().toLocaleString()}</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const getStatutClass = (statut) => {
        switch (statut) {
            case 'DISPONIBLE': return 'badge-disponible';
            case 'RESERVE': return 'badge-reserve';
            case 'BLOQUE': return 'badge-bloque';
            case 'QUALITE': return 'badge-qualite';
            default: return '';
        }
    };

    const getStatutLabel = (statut) => {
        switch (statut) {
            case 'DISPONIBLE': return 'Disponible';
            case 'RESERVE': return 'Réservé';
            case 'BLOQUE': return 'Bloqué';
            case 'QUALITE': return 'Contrôle qualité';
            default: return statut;
        }
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSortAmountDown className="sort-icon inactive" />;
        return sortConfig.direction === 'asc' 
            ? <FaSortAmountUp className="sort-icon active" />
            : <FaSortAmountDown className="sort-icon active" />;
    };

    if (loading) return <div className="loading">Chargement des stocks...</div>;

    return (
        <div className="stock-list-container">
            <div className="header">
                <h2>Consultation des Stocks</h2>
                <div className="header-actions">
                    <button className="btn-print-list" onClick={handlePrintList}>
                        <FaPrint /> Imprimer
                    </button>
                </div>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {/* Sélecteur de mode de filtre */}
            <div className="filter-mode-bar">
                <button
                    className={`filter-mode-btn ${filterMode === 'normal' ? 'active' : ''}`}
                    onClick={() => setFilterMode('normal')}
                >
                    <FaFilter /> Normal
                </button>
                <button
                    className={`filter-mode-btn ${filterMode === 'scan' ? 'active' : ''}`}
                    onClick={() => setFilterMode('scan')}
                >
                    <FaQrcode /> Scan
                </button>
            </div>

            {/* Panneau de filtre actif */}
            <div className="filter-panel">
                {filterMode === 'normal' && (
                    <div className="filter-normal">
                        <form onSubmit={handleSearch} className="filter-form">
                            <div className="filter-row">
                                <input
                                    type="text"
                                    name="articleId"
                                    placeholder="ID Article"
                                    value={searchParams.articleId}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="lot"
                                    placeholder="Lot"
                                    value={searchParams.lot}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="emplacement"
                                    placeholder="Emplacement"
                                    value={searchParams.emplacement}
                                    onChange={handleInputChange}
                                />
                                <select name="statut" value={searchParams.statut} onChange={handleInputChange}>
                                    <option value="">Statut</option>
                                    <option value="DISPONIBLE">Disponible</option>
                                    <option value="RESERVE">Réservé</option>
                                    <option value="BLOQUE">Bloqué</option>
                                    <option value="QUALITE">Contrôle qualité</option>
                                </select>
                                <button type="submit" className="btn-search">Rechercher</button>
                                <button type="button" className="btn-reset" onClick={handleReset}>Réinitialiser</button>
                            </div>
                        </form>
                    </div>
                )}

                {filterMode === 'scan' && (
                    <div className="filter-scan">
                        <div className="scan-fields">
                            <div className="scan-field">
                                <label>Lot</label>
                                <div className="scan-input-wrapper">
                                    <FaBarcode className="scan-icon" />
                                    <input
                                        ref={lotScanRef}
                                        type="text"
                                        placeholder="Scanner le lot"
                                        onKeyPress={(e) => handleScanKeyPress(e, 'lotScan')}
                                        onBlur={(e) => handleScanBlur(e, 'lotScan')}
                                        disabled={scanLoading}
                                    />
                                    {scanLoading && <span className="scan-spinner" />}
                                </div>
                            </div>
                            <div className="scan-field">
                                <label>Emplacement</label>
                                <div className="scan-input-wrapper">
                                    <FaBarcode className="scan-icon" />
                                    <input
                                        ref={emplacementScanRef}
                                        type="text"
                                        placeholder="Scanner l'emplacement"
                                        onKeyPress={(e) => handleScanKeyPress(e, 'emplacementScan')}
                                        onBlur={(e) => handleScanBlur(e, 'emplacementScan')}
                                        disabled={scanLoading}
                                    />
                                    {scanLoading && <span className="scan-spinner" />}
                                </div>
                            </div>
                            <div className="scan-field">
                                <label>Code article</label>
                                <div className="scan-input-wrapper">
                                    <FaBarcode className="scan-icon" />
                                    <input
                                        ref={articleScanRef}
                                        type="text"
                                        placeholder="Scanner l'article"
                                        onKeyPress={(e) => handleScanKeyPress(e, 'articleCodeScan')}
                                        onBlur={(e) => handleScanBlur(e, 'articleCodeScan')}
                                        disabled={scanLoading}
                                    />
                                    {scanLoading && <span className="scan-spinner" />}
                                </div>
                            </div>
                        </div>
                        <div className="scan-actions">
                            <button type="button" className="btn-reset" onClick={handleReset}>Effacer tout</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ========== CARTE RÉCAPITULATIVE APRÈS SCAN ARTICLE ========== */}
            {scannedArticle && (
                <div className="scanned-article-summary" onClick={handleScannedArticleClick}>
                    <div className="summary-icon">
                        <FaBoxes />
                    </div>
                    <div className="summary-details">
                        <h3>{scannedArticle.designation}</h3>
                        <p>Code : {scannedArticle.code}</p>
                        <p className="total-quantity">Quantité totale en stock : <strong>{scannedArticle.quantiteTotale}</strong></p>
                    </div>
                    <div className="summary-action">
                        <span className="click-hint">Cliquez pour voir le détail des emplacements</span>
                        {showStockTableForScanned ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    <button 
                        className="close-summary" 
                        onClick={(e) => { e.stopPropagation(); handleCloseScannedSummary(); }}
                        title="Fermer"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            {/* ========== TABLEAU DÉTAILLÉ DES STOCKS POUR L'ARTICLE SCANNÉ ========== */}
            {scannedArticle && showStockTableForScanned && (
                <div className="scanned-stock-table-container">
                    <div className="scanned-stock-header">
                        <h4>Détail des stocks pour {scannedArticle.designation}</h4>
                        <button className="btn-close-table" onClick={() => setShowStockTableForScanned(false)}>
                            <FaTimes /> Masquer
                        </button>
                    </div>
                    <div className="table-container">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>Lot</th>
                                    <th>Emplacement</th>
                                    <th>Quantité</th>
                                    <th>Statut</th>
                                    <th>Date réception</th>
                                    <th>Date expiration</th>
                                    {isResponsable && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {scannedArticleStocks.map(stock => (
                                    <tr 
                                        key={stock.id} 
                                        onClick={() => handleRowClick(stock)}
                                        className="clickable-row"
                                    >
                                        <td>{stock.lot}</td>
                                        <td>{stock.emplacement}</td>
                                        <td>{stock.quantite}</td>
                                        <td>
                                            <span className={`badge ${getStatutClass(stock.statut)}`}>
                                                {getStatutLabel(stock.statut)}
                                            </span>
                                        </td>
                                        <td>{stock.dateReception ? new Date(stock.dateReception).toLocaleDateString() : '-'}</td>
                                        <td>{stock.dateExpiration ? new Date(stock.dateExpiration).toLocaleDateString() : '-'}</td>
                                        {isResponsable && (
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    onChange={(e) => handleChangerStatut(stock.id, e.target.value)}
                                                    defaultValue=""
                                                    className="statut-select"
                                                >
                                                    <option value="" disabled>Changer</option>
                                                    <option value="DISPONIBLE">Disponible</option>
                                                    <option value="RESERVE">Réservé</option>
                                                    <option value="BLOQUE">Bloqué</option>
                                                    <option value="QUALITE">Contrôle qualité</option>
                                                </select>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {scannedArticleStocks.length === 0 && (
                                    <tr>
                                        <td colSpan={isResponsable ? 7 : 6} className="no-data">
                                            Aucun stock trouvé pour cet article.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tableau principal des stocks - affiché uniquement si aucun scan article n'est actif */}
            {!scannedArticle && (
                <div className="table-container">
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
                                <th onClick={() => handleSort('articleDesignation')}>Article {getSortIcon('articleDesignation')}</th>
                                <th onClick={() => handleSort('articleCode')}>Code {getSortIcon('articleCode')}</th>
                                <th onClick={() => handleSort('lot')}>Lot {getSortIcon('lot')}</th>
                                <th onClick={() => handleSort('emplacement')}>Emplacement {getSortIcon('emplacement')}</th>
                                <th onClick={() => handleSort('quantite')}>Qté {getSortIcon('quantite')}</th>
                                <th onClick={() => handleSort('dateReception')}>Réception {getSortIcon('dateReception')}</th>
                                <th onClick={() => handleSort('dateExpiration')}>Expiration {getSortIcon('dateExpiration')}</th>
                                <th onClick={() => handleSort('statut')}>Statut {getSortIcon('statut')}</th>
                                {isResponsable && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.map(stock => (
                                <tr 
                                    key={stock.id} 
                                    onClick={() => handleRowClick(stock)}
                                    className="clickable-row"
                                >
                                    <td>{stock.id}</td>
                                    <td>{stock.articleDesignation}</td>
                                    <td>{stock.articleCode}</td>
                                    <td>{stock.lot}</td>
                                    <td>{stock.emplacement}</td>
                                    <td>{stock.quantite}</td>
                                    <td>{stock.dateReception ? new Date(stock.dateReception).toLocaleDateString() : '-'}</td>
                                    <td>{stock.dateExpiration ? new Date(stock.dateExpiration).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <span className={`badge ${getStatutClass(stock.statut)}`}>
                                            {getStatutLabel(stock.statut)}
                                        </span>
                                    </td>
                                    {isResponsable && (
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <select
                                                onChange={(e) => handleChangerStatut(stock.id, e.target.value)}
                                                defaultValue=""
                                                className="statut-select"
                                            >
                                                <option value="" disabled>Changer</option>
                                                <option value="DISPONIBLE">Disponible</option>
                                                <option value="RESERVE">Réservé</option>
                                                <option value="BLOQUE">Bloqué</option>
                                                <option value="QUALITE">Contrôle qualité</option>
                                            </select>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals (inchangés) */}
            {showDetailModal && (
                <StockDetailModal
                    stock={selectedStock}
                    onClose={() => setShowDetailModal(false)}
                    onPrint={handlePrint}
                    onTransfer={handleTransfer}
                />
            )}

            {showTransferForm && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <StockTransferForm
                            stock={stockToTransfer}
                            onSuccess={handleTransferSuccess}
                            onCancel={() => setShowTransferForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockList;