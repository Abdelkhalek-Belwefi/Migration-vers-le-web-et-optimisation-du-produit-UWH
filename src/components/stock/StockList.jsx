import React, { useState, useEffect } from 'react';
import { FaPrint, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { stockService } from '../../services/stockService';
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
            setStocks(data);
            setFilteredStocks(data);
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

            // Gestion spéciale pour les dates
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
            setStocks(data);
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
            articleId: '',
            lot: '',
            emplacement: '',
            statut: ''
        });
        fetchStocks();
    };

    const handleRowClick = (stock) => {
        setSelectedStock(stock);
        setShowDetailModal(true);
    };

    const handleChangerStatut = async (id, nouveauStatut) => {
        if (!nouveauStatut) return;
        
        if (!window.confirm(`Voulez-vous changer le statut en ${getStatutLabel(nouveauStatut)} ?`)) {
            return;
        }
        
        try {
            setLoading(true);
            const updated = await stockService.changerStatut(id, nouveauStatut);
            
            setStocks(stocks.map(s => s.id === id ? updated : s));
            setFilteredStocks(filteredStocks.map(s => s.id === id ? updated : s));
            
            setSuccess('Statut mis à jour avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors du changement de statut');
            console.error(err);
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
                        <FaPrint /> Imprimer la liste
                    </button>
                </div>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
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
                        <option value="">Tous les statuts</option>
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="RESERVE">Réservé</option>
                        <option value="BLOQUE">Bloqué</option>
                        <option value="QUALITE">Contrôle qualité</option>
                    </select>
                    <button type="submit" className="btn-search">Rechercher</button>
                    <button type="button" className="btn-reset" onClick={handleReset}>Réinitialiser</button>
                </form>
            </div>

            <div className="table-container">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')}>
                                ID {getSortIcon('id')}
                            </th>
                            <th onClick={() => handleSort('articleDesignation')}>
                                Article {getSortIcon('articleDesignation')}
                            </th>
                            <th onClick={() => handleSort('articleCode')}>
                                Code {getSortIcon('articleCode')}
                            </th>
                            <th onClick={() => handleSort('lot')}>
                                Lot {getSortIcon('lot')}
                            </th>
                            <th onClick={() => handleSort('emplacement')}>
                                Emplacement {getSortIcon('emplacement')}
                            </th>
                            <th onClick={() => handleSort('quantite')}>
                                Quantité {getSortIcon('quantite')}
                            </th>
                            <th onClick={() => handleSort('statut')}>
                                Statut {getSortIcon('statut')}
                            </th>
                            <th onClick={() => handleSort('dateReception')}>
                                Date réception {getSortIcon('dateReception')}
                            </th>
                            <th onClick={() => handleSort('dateExpiration')}>
                                Date expiration {getSortIcon('dateExpiration')}
                            </th>
                            {isResponsable && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStocks.map(stock => (
                            <tr 
                                key={stock.id} 
                                onClick={() => handleRowClick(stock)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{stock.id}</td>
                                <td>{stock.articleDesignation}</td>
                                <td>{stock.articleCode}</td>
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
                                        >
                                            <option value="" disabled>Changer statut</option>
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