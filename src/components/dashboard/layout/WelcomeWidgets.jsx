import React, { useState, useEffect } from 'react';
import { 
    FaBoxes, FaWarehouse, FaBoxOpen, FaTruck, 
    FaArrowUp, FaChartLine 
} from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { stockService } from '../../../services/stockService';
import { articleService } from '../../../services/articleService';
import './WelcomeWidgets.css';

const WelcomeWidgets = ({ userPrenom, userName }) => {
    const [stats, setStats] = useState({
        totalArticles: 0,
        stockCount: 0,
        receptions: 3,
        expeditions: 2
    });
    const [loading, setLoading] = useState(true);

    // Données réelles pour les graphiques (Exemple Flux)
    const dataFlux = [
        { name: 'Jan', entrees: 2400, sorties: 1800 },
        { name: 'Fév', entrees: 3000, sorties: 3966 },
        { name: 'Mar', entrees: 2000, sorties: 2800 },
        { name: 'Avr', entrees: 2780, sorties: 3500 },
        { name: 'Mai', entrees: 1890, sorties: 2100 },
    ];

    // Données Taux d'Occupation
    const dataOccupation = [
        { name: 'Occupé', value: 75, color: '#10b981' },
        { name: 'Vide', value: 25, color: '#f1f5f9' },
    ];

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [articles, stocks] = await Promise.all([
                    articleService.getAllArticles().catch(() => []),
                    stockService.getAllStocks().catch(() => [])
                ]);
                setStats(prev => ({
                    ...prev,
                    totalArticles: articles.length,
                    stockCount: stocks.length
                }));
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    if (loading) return <div className="expert-loader">Chargement du système expert...</div>;

    return (
        <div className="expert-dashboard">
            {/* BANDEAU DE BIENVENUE ALIGNÉ (FULL WIDTH) */}
            <header className="dashboard-header-bandeau">
                <div className="welcome-section">
                    <h1>Tableau de Bord Logistique</h1>
                    <p>Bienvenue, {userPrenom} {userName}. Voici l'activité de votre entrepôt.</p>
                </div>
                <div className="header-status">
                    <span className="status-dot pulse"></span>
                    Système En Direct
                </div>
            </header>

            {/* SECTION KPI */}
            <div className="kpi-grid">
                <div className="kpi-card main-highlight">
                    <div className="kpi-content">
                        <span className="kpi-label">Volume Total Articles</span>
                        <h2 className="kpi-value">{stats.totalArticles}</h2>
                        <div className="kpi-trend"><FaArrowUp /> +12.5% ce mois</div>
                    </div>
                    <FaChartLine className="kpi-bg-icon" />
                </div>

                <div className="kpi-mini-card">
                    <div className="mini-icon orange"><FaBoxOpen /></div>
                    <div className="mini-data">
                        <span className="mini-label">Réceptions</span>
                        <span className="mini-value">{stats.receptions}</span>
                    </div>
                </div>

                <div className="kpi-mini-card">
                    <div className="mini-icon blue"><FaWarehouse /></div>
                    <div className="mini-data">
                        <span className="mini-label">Lignes Stock</span>
                        <span className="mini-value">{stats.stockCount}</span>
                    </div>
                </div>

                <div className="kpi-mini-card">
                    <div className="mini-icon purple"><FaTruck /></div>
                    <div className="mini-data">
                        <span className="mini-label">Expéditions</span>
                        <span className="mini-value">{stats.expeditions}</span>
                    </div>
                </div>
            </div>

            {/* SECTION GRAPHIQUES */}
            <div className="charts-main-row">
                {/* Graphique des Flux */}
                <div className="chart-box flux-box">
                    <div className="chart-header-text">
                        <h3>Mouvements de Stock</h3>
                        <p>Analyse comparative Entrées / Sorties</p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={dataFlux}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="entrees" fill="#10b981" radius={[4, 4, 0, 0]} name="Entrées" barSize={15} />
                            <Bar dataKey="sorties" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Sorties" barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Graphique Donut */}
                <div className="chart-box donut-box">
                    <div className="chart-header-text">
                        <h3>Occupation Sol</h3>
                    </div>
                    <div className="donut-container">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={dataOccupation} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                                    {dataOccupation.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-info">
                            <span className="donut-perc">75%</span>
                            <span className="donut-txt">Capacité</span>
                        </div>
                    </div>
                    <div className="custom-legend">
                        <div className="leg-item"><span className="dot g"></span> Occupé</div>
                        <div className="leg-item"><span className="dot s"></span> Libre</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeWidgets;