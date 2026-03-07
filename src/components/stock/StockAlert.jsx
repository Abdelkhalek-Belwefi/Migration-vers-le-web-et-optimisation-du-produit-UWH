import React, { useState, useEffect } from 'react';
import { stockService } from '../../services/stockService';
import { FaExclamationTriangle, FaBell } from 'react-icons/fa';
import './styles/StockAlert.css';

const StockAlert = () => {
    const [stocksCritiques, setStocksCritiques] = useState([]);
    const [stocksAlerte, setStocksAlerte] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        checkStocks();
        // Vérification toutes les 5 minutes
        const interval = setInterval(checkStocks, 300000);
        return () => clearInterval(interval);
    }, []);

    const checkStocks = async () => {
        try {
            const allStocks = await stockService.getAllStocks();
            
            const critiques = allStocks.filter(s => s.quantite <= 10);
            const alertes = allStocks.filter(s => s.quantite > 10 && s.quantite <= 20);
            
            setStocksCritiques(critiques);
            setStocksAlerte(alertes);
        } catch (err) {
            console.error('Erreur vérification stocks:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalAlertes = stocksCritiques.length + stocksAlerte.length;

    return (
        <div className="stock-alert-container">
            <button 
                className={`alert-bell ${totalAlertes > 0 ? 'has-alerts' : ''}`}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <FaBell />
                {totalAlertes > 0 && (
                    <span className="alert-badge">{totalAlertes}</span>
                )}
            </button>

            {showDropdown && (
                <div className="alert-dropdown">
                    {totalAlertes === 0 ? (
                        <div className="no-alerts">
                            ✅ Tous les stocks sont normaux
                        </div>
                    ) : (
                        <>
                            {stocksCritiques.length > 0 && (
                                <div className="alert-section critique">
                                    <h4><FaExclamationTriangle /> Critique (≤10)</h4>
                                    {stocksCritiques.map(s => (
                                        <div key={s.id} className="alert-item">
                                            <span className="article">{s.articleDesignation}</span>
                                            <span className="lot">Lot: {s.lot}</span>
                                            <span className="quantite">{s.quantite} unités</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {stocksAlerte.length > 0 && (
                                <div className="alert-section alerte">
                                    <h4>🟠 Alerte (11-20)</h4>
                                    {stocksAlerte.map(s => (
                                        <div key={s.id} className="alert-item">
                                            <span className="article">{s.articleDesignation}</span>
                                            <span className="lot">Lot: {s.lot}</span>
                                            <span className="quantite">{s.quantite} unités</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockAlert;