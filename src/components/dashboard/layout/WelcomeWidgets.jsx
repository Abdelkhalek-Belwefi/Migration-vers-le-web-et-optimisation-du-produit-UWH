import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaBoxes, 
    FaChartLine, 
    FaWarehouse, 
    FaBoxOpen,
    FaClock,
    FaCheckCircle,
    FaTruck,
    FaPrint,
    FaSync
} from 'react-icons/fa';
import { stockService } from '../../../services/stockService';
import { articleService } from '../../../services/articleService';
import { mouvementService } from '../../../services/mouvementService';
import './WelcomeWidgets.css';

const WelcomeWidgets = ({ userPrenom, userName, userRole }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalArticles: 0,
        stockCount: 0,
        receptionsEnCours: 0,
        pickingsEnCours: 0,
        expeditionsEnCours: 0
    });
    const [recentMovements, setRecentMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiErrors, setApiErrors] = useState({
        articles: false,
        stocks: false,
        mouvements: false
    });

    useEffect(() => {
        loadStats();
        loadRecentMovements();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        
        try {
            // Chargement des articles avec gestion d'erreur
            let articles = [];
            try {
                articles = await articleService.getAllArticles();
                setApiErrors(prev => ({ ...prev, articles: false }));
                console.log('✅ Articles chargés:', articles.length);
            } catch (err) {
                console.warn('⚠️ Impossible de charger les articles - ' + (err.response?.status || err.message));
                setApiErrors(prev => ({ ...prev, articles: true }));
                articles = [];
            }

            // Chargement des stocks avec gestion d'erreur
            let stocks = [];
            try {
                stocks = await stockService.getAllStocks();
                setApiErrors(prev => ({ ...prev, stocks: false }));
                console.log('✅ Stocks chargés:', stocks.length);
            } catch (err) {
                console.warn('⚠️ Impossible de charger les stocks - ' + (err.response?.status || err.message));
                setApiErrors(prev => ({ ...prev, stocks: true }));
                stocks = [];
            }

            // Mise à jour des stats
            setStats({
                totalArticles: articles.length || 0,
                stockCount: stocks.length || 0,
                receptionsEnCours: 3, // À remplacer par vraie donnée
                pickingsEnCours: 5,    // À remplacer par vraie donnée
                expeditionsEnCours: 2   // À remplacer par vraie donnée
            });

        } catch (err) {
            console.error('❌ Erreur générale stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentMovements = async () => {
        try {
            let mouvements = [];
            try {
                mouvements = await mouvementService.getAllMouvements();
                setApiErrors(prev => ({ ...prev, mouvements: false }));
                console.log('✅ Mouvements chargés:', mouvements.length);
                
                // Trier et prendre les 5 plus récents
                const recent = mouvements
                    .sort((a, b) => new Date(b.dateMouvement) - new Date(a.dateMouvement))
                    .slice(0, 5);
                setRecentMovements(recent);
                
            } catch (err) {
                console.warn('⚠️ Impossible de charger les mouvements - ' + (err.response?.status || err.message));
                setApiErrors(prev => ({ ...prev, mouvements: true }));
                setRecentMovements([]);
            }
        } catch (err) {
            console.error('❌ Erreur chargement mouvements:', err);
            setRecentMovements([]);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '--:--';
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const getMovementTypeLabel = (type) => {
        const labels = {
            'ENTREE': 'ENTRÉE',
            'SORTIE': 'SORTIE',
            'TRANSFERT': 'TRANSFERT'
        };
        return labels[type] || type;
    };

    const getMovementClass = (type) => {
        const classes = {
            'ENTREE': 'entree',
            'SORTIE': 'sortie',
            'TRANSFERT': 'transfert'
        };
        return classes[type] || '';
    };

    const getArticleCount = () => {
        if (apiErrors.articles) return '?';
        return stats.totalArticles;
    };

    const getStockCount = () => {
        if (apiErrors.stocks) return '?';
        return stats.stockCount;
    };

    const getMovementCount = () => {
        if (apiErrors.mouvements) return '?';
        return recentMovements.length;
    };

    if (loading) {
        return (
            <div className="welcome-loading">
                <div className="spinner"></div>
                <p>Chargement du tableau de bord...</p>
            </div>
        );
    }

    return (
        <div className="welcome-widgets">
            {/* En-tête de bienvenue */}
            <div className="welcome-header">
                <div>
                    <h1>Bienvenue, {userPrenom} {userName} </h1>
                    <p className="welcome-date">
                        {new Date().toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>

            {/* Mini statistiques - avec indicateurs d'erreur */}
            <div className="mini-stats">
                <div className="mini-stat-card">
                    <div className="mini-stat-icon" style={{ background: '#e3f2fd', color: '#1976d2' }}>
                        <FaBoxes />
                    </div>
                    <div className="mini-stat-info">
                        <span className="mini-stat-value">
                            {getArticleCount()}
                            {apiErrors.articles && <span className="stat-warning" title="Données non disponibles"> ⚠️</span>}
                        </span>
                        <span className="mini-stat-label">Articles</span>
                    </div>
                </div>

                <div className="mini-stat-card">
                    <div className="mini-stat-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                        <FaWarehouse />
                    </div>
                    <div className="mini-stat-info">
                        <span className="mini-stat-value">
                            {getStockCount()}
                            {apiErrors.stocks && <span className="stat-warning" title="Données non disponibles"> ⚠️</span>}
                        </span>
                        <span className="mini-stat-label">Lignes stock</span>
                    </div>
                </div>

                <div className="mini-stat-card">
                    <div className="mini-stat-icon" style={{ background: '#fff3e0', color: '#ed6c02' }}>
                        <FaBoxOpen />
                    </div>
                    <div className="mini-stat-info">
                        <span className="mini-stat-value">{stats.receptionsEnCours}</span>
                        <span className="mini-stat-label">Réceptions</span>
                    </div>
                </div>

                <div className="mini-stat-card">
                    <div className="mini-stat-icon" style={{ background: '#f3e5f5', color: '#7b1fa2' }}>
                        <FaCheckCircle />
                    </div>
                    <div className="mini-stat-info">
                        <span className="mini-stat-value">{stats.pickingsEnCours}</span>
                        <span className="mini-stat-label">Pickings</span>
                    </div>
                </div>

                <div className="mini-stat-card">
                    <div className="mini-stat-icon" style={{ background: '#ffebee', color: '#c62828' }}>
                        <FaTruck />
                    </div>
                    <div className="mini-stat-info">
                        <span className="mini-stat-value">{stats.expeditionsEnCours}</span>
                        <span className="mini-stat-label">Expéditions</span>
                    </div>
                </div>
            </div>

            

            {/* Tâches en cours */}
            <div className="tasks-in-progress">
                <h3>Tâches en cours</h3>
                <div className="tasks-grid">
                    <div className="task-item">
                        <div className="task-icon" style={{ background: '#fff3cd', color: '#856404' }}>
                            <FaBoxOpen />
                        </div>
                        <div className="task-details">
                            <span className="task-title">Réceptions à valider</span>
                            <span className="task-count">{stats.receptionsEnCours}</span>
                        </div>
                    </div>
                    <div className="task-item">
                        <div className="task-icon" style={{ background: '#d1ecf1', color: '#0c5460' }}>
                            <FaWarehouse />
                        </div>
                        <div className="task-details">
                            <span className="task-title">Rangements</span>
                            <span className="task-count">{stats.pickingsEnCours}</span>
                        </div>
                    </div>
                    <div className="task-item">
                        <div className="task-icon" style={{ background: '#d4edda', color: '#155724' }}>
                            <FaTruck />
                        </div>
                        <div className="task-details">
                            <span className="task-title">Expéditions</span>
                            <span className="task-count">{stats.expeditionsEnCours}</span>
                        </div>
                    </div>
                </div>
            </div>

            

            
        </div>
    );
};

export default WelcomeWidgets;