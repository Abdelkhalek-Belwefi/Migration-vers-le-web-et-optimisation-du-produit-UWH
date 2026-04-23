import React, { useState, useEffect } from 'react';
import { 
    FaBoxes, FaWarehouse, FaBoxOpen, FaTruck, 
    FaArrowUp, FaCalendarAlt 
} from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer 
} from 'recharts';

// Importation de vos services
import { articleService } from '../../../services/articleService';
import { stockService } from '../../../services/stockService';
import { receptionService } from '../../../services/receptionService';
import * as expeditionService from '../../../services/expeditionService';

import './WelcomeWidgets.css';

const WelcomeWidgets = ({ userPrenom }) => {
    const [stats, setStats] = useState({
        totalArticles: 0,
        stockCount: 0,
        receptionsCount: 0,
        expeditionsCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState([]);

    // 1. Initialisation du calendrier hebdomadaire
    useEffect(() => {
        const today = new Date();
        const week = [];
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Lundi

        for (let i = 0; i < 7; i++) {
            const day = new Date(firstDay);
            day.setDate(firstDay.getDate() + i);
            week.push({
                name: day.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
                number: day.getDate(),
                isToday: day.toDateString() === new Date().toDateString()
            });
        }
        setCurrentWeek(week);
    }, []);

    // 2. Récupération des données API
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Exécution parallèle pour ne pas bloquer l'affichage
                const [articles, stocks, receptions, expeditions] = await Promise.all([
                    articleService.getAllArticles().catch(() => []),
                    stockService.getAllStocks().catch(() => []),
                    receptionService.getAllReceptions().catch(() => []),
                    expeditionService.getMesExpeditions().catch(() => [])
                ]);

                setStats({
                    totalArticles: articles.length || 0,
                    stockCount: stocks.length || 0,
                    receptionsCount: receptions.length || 0,
                    expeditionsCount: expeditions.length || 0
                });
            } catch (error) {
                console.error("Erreur lors du chargement des statistiques:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Données fictives pour le graphique (basées partiellement sur le réel)
    const dataFlux = [
        { name: 'Lun', flux: 400 },
        { name: 'Mar', flux: 300 },
        { name: 'Mer', flux: stats.receptionsCount * 50 }, // Dynamisé
        { name: 'Jeu', flux: 200 },
        { name: 'Ven', flux: stats.expeditionsCount * 40 }, // Dynamisé
    ];

    if (loading) {
        return (
            <div className="premium-loader-container">
                <div className="premium-spinner"></div>
                <p>Synchronisation avec l'entrepôt...</p>
            </div>
        );
    }

    return (
        <div className="premium-dashboard">
            {/* BANDEAU DE BIENVENUE */}
            <header className="welcome-banner">
                <div className="banner-content">
                    <div className="date-badge">
                        <FaCalendarAlt /> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h1>Bonjour, {userPrenom || 'Belwefi'} !</h1>
                    <p>Votre catalogue contient actuellement <strong>{stats.totalArticles}</strong> articles référencés.</p>
                </div>
                <div className="banner-status">
                    <div className="status-pill">
                        <span className="pulse-dot"></span> Système Connecté
                    </div>
                </div>
            </header>

            {/* GRILLE DE KPI DYNAMIQUE */}
            <div className="stats-grid">
                <div className="stat-card main-highlight">
                    <div className="stat-info">
                        <label>Total Articles</label>
                        <h3>{stats.totalArticles}</h3>
                        <div className="trend"><FaArrowUp /> Catalogue</div>
                    </div>
                    <FaBoxes className="card-icon-bg" />
                </div>

                <div className="stat-card">
                    <div className="icon-box orange">
                        <FaBoxOpen />
                    </div>
                    <div className="stat-info">
                        <label>Réceptions</label>
                        <h3>{stats.receptionsCount}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="icon-box blue">
                        <FaWarehouse />
                    </div>
                    <div className="stat-info">
                        <label>Lignes Stock</label>
                        <h3>{stats.stockCount}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="icon-box purple">
                        <FaTruck />
                    </div>
                    <div className="stat-info">
                        <label>Expéditions</label>
                        <h3>{stats.expeditionsCount}</h3>
                    </div>
                </div>
            </div>

            {/* SECTION GRAPHIQUE ET CALENDRIER */}
            <div className="dashboard-main-row">
                <div className="glass-card chart-section">
                    <div className="card-header">
                        <h3>Mouvements Récents</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dataFlux}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="flux" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mini-calendar-card">
                    <div className="calendar-header-blue">
                        <h3>CALENDRIER</h3>
                        <div className="month-select">
                            {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
                        </div>
                    </div>
                    <div className="calendar-body">
                        <div className="days-timeline">
                            {currentWeek.map((day, index) => (
                                <div key={index} className={`day-col ${day.isToday ? 'active' : ''}`}>
                                    <span className="d-name">{day.name}</span>
                                    <span className="d-num">{day.number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeWidgets;