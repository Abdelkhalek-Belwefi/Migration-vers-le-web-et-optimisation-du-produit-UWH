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
        receptionsEnCours: 0
        
       
    });
    const [loading, setLoading] = useState(true);
    const [recentMovements, setRecentMovements] = useState([]);

    useEffect(() => {
        loadStats();
        loadRecentMovements();
    }, []);

    const loadStats = async () => {
        try {
            const articles = await articleService.getAllArticles();
            const stocks = await stockService.getAllStocks();

            setStats({
                totalArticles: articles.length,
                stockCount: stocks.length,
                receptionsEnCours: 3 // À remplacer par vraie donnée
       
               
            });
        } catch (err) {
            console.error('Erreur chargement stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentMovements = async () => {
        try {
            const mouvements = await mouvementService.getAllMouvements();
            // Prendre les 5 derniers mouvements
            const recent = mouvements
                .sort((a, b) => new Date(b.dateMouvement) - new Date(a.dateMouvement))
                .slice(0, 5);
            setRecentMovements(recent);
        } catch (err) {
            console.error('Erreur chargement mouvements:', err);
        }
    };

    const formatTime = (dateString) => {
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

    if (loading) {
        return <div className="welcome-loading">Chargement...</div>;
    }

    return (
        <div className="welcome-widgets">
            {/* En-tête de bienvenue */}
            <div className="welcome-header">
                <div>
                    <h1>Bienvenue, {userPrenom} {userName} !</h1>
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

            {/* Mini statistiques - simplifiées */}
            <div className="mini-stats">
                <div className="mini-stat-card">
                    <div className="mini-stat-icon" style={{ background: '#e3f2fd', color: '#1976d2' }}>
                        <FaBoxes />
                    </div>
                    <div className="mini-stat-info">
                        <span className="mini-stat-value">{stats.totalArticles}</span>
                        <span className="mini-stat-label">Articles</span>
                    </div>
                </div>

                <div className="mini-stat-card">
                    <div className="mini-stat-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                        <FaWarehouse />
                    </div>
                    <div className="mini-stat-info">
                        <span className="mini-stat-value">{stats.stockCount}</span>
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

            {/* Derniers mouvements */}
            <div className="recent-movements">
                <h3>Derniers mouvements</h3>
                <div className="movements-list">
                    {recentMovements.length > 0 ? (
                        recentMovements.map((movement, index) => (
                            <div key={index} className="movement-item">
                                <span className="movement-time">{formatTime(movement.dateMouvement)}</span>
                                <span className={`movement-type ${getMovementClass(movement.type)}`}>
                                    {getMovementTypeLabel(movement.type)}
                                </span>
                                <span className="movement-desc">
                                    {movement.articleDesignation || 'Article'} - {movement.lot || 'Sans lot'}
                                </span>
                                <span className="movement-qty">
                                    {movement.type === 'ENTREE' ? '+' : movement.type === 'SORTIE' ? '-' : '↻'} 
                                    {movement.quantite}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="no-movements">Aucun mouvement récent</div>
                    )}
                </div>
                <button className="view-all-btn" onClick={() => navigate('/mouvements')}>
                    Voir tous les mouvements
                </button>
            </div>

           
           
        </div>
    );
};

export default WelcomeWidgets;