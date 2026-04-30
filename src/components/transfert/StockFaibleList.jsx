import React, { useState, useEffect } from 'react';
import { stockService } from '../../services/stockService';
import { getAllEntrepots } from '../../services/entrepotService ';
import DeclarerTransfertModal from './DeclarerTransfertModal';
import './StockFaibleList.css';

const StockFaibleList = () => {
    const [stocksFaibles, setStocksFaibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [seuil, setSeuil] = useState(20);

    const userRole = localStorage.getItem('role');
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';

    useEffect(() => {
        if (isResponsable) {
            loadStocksFaibles();
        }
    }, [seuil, isResponsable]);

    const loadStocksFaibles = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await stockService.getStocksFaibles(seuil);
            setStocksFaibles(data);
        } catch (err) {
            console.error('Erreur chargement stocks faibles:', err);
            setError('Erreur lors du chargement des stocks faibles');
        } finally {
            setLoading(false);
        }
    };

    const handleDeclarer = (stock) => {
        setSelectedStock(stock);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedStock(null);
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        setSelectedStock(null);
        loadStocksFaibles();
    };

    if (!isResponsable) {
        return (
            <div className="stock-faible-container">
                <div className="alert error">
                    Vous n'avez pas les droits pour accéder à cette page.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="stock-faible-container">
                <div className="loading">Chargement des stocks faibles...</div>
            </div>
        );
    }

    return (
        <div className="stock-faible-container">
            <div className="header">
                <h2>📦 Stocks faibles</h2>
                <div className="seuil-control">
                    <label>Seuil :</label>
                    <input
                        type="number"
                        value={seuil}
                        onChange={(e) => setSeuil(parseInt(e.target.value) || 20)}
                        min="1"
                        className="seuil-input"
                    />
                    <button className="btn-refresh" onClick={loadStocksFaibles}>
                        🔄 Actualiser
                    </button>
                </div>
            </div>

            {error && <div className="alert error">{error}</div>}

            {stocksFaibles.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>Aucun stock faible</h3>
                    <p>Tous les stocks sont supérieurs au seuil de {seuil} unités.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="stock-faible-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Code</th>
                                <th>Lot</th>
                                <th>Emplacement</th>
                                <th>Quantité</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocksFaibles.map((stock) => (
                                <tr key={stock.id} className={stock.quantite <= 10 ? 'critique' : ''}>
                                    <td>{stock.articleDesignation}</td>
                                    <td>{stock.articleCode}</td>
                                    <td>{stock.lot}</td>
                                    <td>{stock.emplacement}</td>
                                    <td className={`quantite ${stock.quantite <= 10 ? 'critique-value' : 'warning-value'}`}>
                                        {stock.quantite}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${stock.statut?.toLowerCase()}`}>
                                            {stock.statut}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-declarer"
                                            onClick={() => handleDeclarer(stock)}
                                        >
                                            📤 Déclarer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && selectedStock && (
                <DeclarerTransfertModal
                    stock={selectedStock}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
};

export default StockFaibleList;