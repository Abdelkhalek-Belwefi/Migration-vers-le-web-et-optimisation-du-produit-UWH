import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, ComposedChart,
    Legend, ReferenceLine
} from 'recharts';
import { 
    FaChartLine, FaExclamationTriangle, FaSync, FaCalendarAlt, 
    FaInfoCircle, FaChartBar, FaArrowUp, FaArrowDown 
} from 'react-icons/fa';
import { previsionService } from '../../services/PrevisionService';
import './PrevisionChart.css';

const PrevisionChart = () => {
    const [previsions, setPrevisions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('chart');

    useEffect(() => {
        chargerPrevisions();
    }, []);

    const chargerPrevisions = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await previsionService.getPrevisions7Jours();
            setPrevisions(data);
            console.log('📊 Prévisions chargées:', data);
        } catch (err) {
            console.error('Erreur chargement prévisions:', err);
            setError(err.response?.data?.message || 'Impossible de charger les prévisions');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await previsionService.refreshPrevisions();
            await chargerPrevisions();
        } catch (err) {
            setError('Erreur lors du rafraîchissement');
        } finally {
            setRefreshing(false);
        }
    };

    const formatDataForChart = () => {
        if (!previsions || !previsions.previsions) return [];

        return previsions.previsions.map(p => ({
            date: new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
            dateFull: p.date,
            prevue: Math.round(p.chargePrevue),
            min: Math.round(p.chargeMin),
            max: Math.round(p.chargeMax),
            estPic: p.estPic,
            commentaire: p.commentaire,
            variation: p.chargePrevue > (previsions.chargeMoyennePrevue || 0) ? 'up' : 'down'
        }));
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0]?.payload;
            const variationPourcent = dataPoint?.prevue && previsions?.chargeMoyennePrevue 
                ? ((dataPoint.prevue - previsions.chargeMoyennePrevue) / previsions.chargeMoyennePrevue * 100).toFixed(1)
                : 0;
            
            return (
                <div className="custom-tooltip-premium">
                    <div className="tooltip-header">
                        <FaCalendarAlt className="tooltip-icon" />
                        <span className="tooltip-date">{label}</span>
                    </div>
                    <div className="tooltip-body">
                        <div className="tooltip-row">
                            <span className="tooltip-label">📈 Charge prévue :</span>
                            <span className="tooltip-value">{dataPoint?.prevue} unités</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">📉 Fourchette :</span>
                            <span className="tooltip-value">{dataPoint?.min} - {dataPoint?.max} unités</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">📊 Variation :</span>
                            <span className={`tooltip-value ${variationPourcent >= 0 ? 'positive' : 'negative'}`}>
                                {variationPourcent >= 0 ? '▲' : '▼'} {Math.abs(variationPourcent)}%
                            </span>
                        </div>
                        {dataPoint?.estPic && (
                            <div className="tooltip-alert">
                                <FaExclamationTriangle /> PIC DE CHARGE ANTICIPÉ
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderDot = (props) => {
        const { cx, cy, payload } = props;
        if (payload.estPic) {
            return (
                <g>
                    <circle cx={cx} cy={cy} r={10} fill="#ef4444" stroke="white" strokeWidth={2} />
                    <circle cx={cx} cy={cy} r={4} fill="#ffffff" />
                </g>
            );
        }
        return (
            <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="white" strokeWidth={2} />
        );
    };

    const getTendanceMessage = () => {
        if (!previsions || !previsions.previsions || previsions.previsions.length === 0) return '';
        const firstValue = previsions.previsions[0].chargePrevue;
        const lastValue = previsions.previsions[previsions.previsions.length - 1].chargePrevue;
        const variation = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
        
        if (variation > 5) return { text: `📈 Hausse de ${variation}% sur la semaine`, color: '#ef4444' };
        if (variation < -5) return { text: `📉 Baisse de ${Math.abs(variation)}% sur la semaine`, color: '#10b981' };
        return { text: `➡️ Stable (${variation}%) sur la semaine`, color: '#f59e0b' };
    };

    if (loading) {
        return (
            <div className="prevision-container-premium">
                <div className="prevision-skeleton">
                    <div className="skeleton-header"></div>
                    <div className="skeleton-cards">
                        <div className="skeleton-card"></div>
                        <div className="skeleton-card"></div>
                        <div className="skeleton-card"></div>
                    </div>
                    <div className="skeleton-chart"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="prevision-container-premium">
                <div className="prevision-error-premium">
                    <div className="error-icon">⚠️</div>
                    <h3>Erreur de chargement</h3>
                    <p>{error}</p>
                    <button onClick={chargerPrevisions} className="btn-retry">
                        <FaSync /> Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (!previsions || !previsions.previsions || previsions.previsions.length === 0) {
        return (
            <div className="prevision-container-premium">
                <div className="prevision-empty">
                    <div className="empty-icon">📊</div>
                    <h3>Aucune donnée disponible</h3>
                    <p>Les prévisions seront disponibles après 30 jours d'historique.</p>
                    <button onClick={chargerPrevisions} className="btn-retry">
                        <FaSync /> Actualiser
                    </button>
                </div>
            </div>
        );
    }

    const chartData = formatDataForChart();
    const tendance = getTendanceMessage();
    const maxCharge = Math.max(...chartData.map(d => d.max)) + 50;
    const minCharge = Math.min(...chartData.map(d => d.min)) - 50;

    return (
        <div className="prevision-container-premium">
            {/* Header Premium */}
            <div className="prevision-header-premium">
                <div className="header-left">
                    <div className="header-icon">
                        <FaChartLine />
                    </div>
                    <div className="header-title">
                        <h2>Prévisions de charge</h2>
                        <p className="header-subtitle">Analyse prédictive sur 7 jours</p>
                    </div>
                </div>
                <div className="header-right">
                    <div className={`status-badge-premium ${previsions.alertePicProche ? 'warning' : 'success'}`}>
                        <span className="status-dot"></span>
                        {previsions.alertePicProche ? 'Alerte pic détecté' : 'Tendance normale'}
                    </div>
                    <button 
                        className="btn-refresh-premium" 
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <FaSync className={refreshing ? 'fa-spin' : ''} />
                        {refreshing ? 'Mise à jour...' : 'Rafraîchir'}
                    </button>
                </div>
            </div>

            {/* KPI Cards Premium */}
            <div className="kpi-grid-premium">
                <div className="kpi-card">
                    <div className="kpi-icon blue">📊</div>
                    <div className="kpi-content">
                        <span className="kpi-label">Charge moyenne prévue</span>
                        <span className="kpi-value">{Math.round(previsions.chargeMoyennePrevue || 0)}</span>
                        <span className="kpi-unit">unités/jour</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon red">⚠️</div>
                    <div className="kpi-content">
                        <span className="kpi-label">Charge maximale</span>
                        <span className="kpi-value">{Math.round(previsions.chargeMaxPrevue || 0)}</span>
                        <span className="kpi-unit">unités</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon orange">📅</div>
                    <div className="kpi-content">
                        <span className="kpi-label">Pic de charge</span>
                        <span className="kpi-value">
                            {previsions.datePicMax ? new Date(previsions.datePicMax).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}
                        </span>
                        <span className="kpi-unit">date prévue</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon green">📈</div>
                    <div className="kpi-content">
                        <span className="kpi-label">Tendance</span>
                        <span className="kpi-value" style={{ fontSize: '1rem', color: tendance.color }}>
                            {tendance.text}
                        </span>
                    </div>
                </div>
            </div>

            {/* Alerte Pic */}
            {previsions.alertePicProche && previsions.messageAlerte && (
                <div className="alert-banner-premium">
                    <div className="alert-icon">🚨</div>
                    <div className="alert-content">
                        <div className="alert-title">Pic de charge anticipé</div>
                        <div className="alert-message">{previsions.messageAlerte}</div>
                    </div>
                    <div className="alert-action">
                        <span className="alert-badge">Action recommandée</span>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="prevision-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chart')}
                >
                    <FaChartLine /> Graphique
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
                    onClick={() => setActiveTab('table')}
                >
                    📋 Détail journalier
                </button>
            </div>

            {/* Graphique */}
            {activeTab === 'chart' && (
                <div className="chart-container-premium">
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                domain={[minCharge > 0 ? 0 : minCharge, maxCharge]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                verticalAlign="top" 
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span style={{ color: '#475569', fontSize: '0.8rem' }}>{value}</span>}
                            />
                            
                            <ReferenceLine y={previsions.chargeMoyennePrevue} stroke="#f59e0b" strokeDasharray="5 5" label="Moyenne" />
                            
                            <Area
                                type="monotone"
                                dataKey="min"
                                name="Intervalle bas"
                                stroke="none"
                                fill="url(#areaGradient)"
                                fillOpacity={0.3}
                            />
                            <Area
                                type="monotone"
                                dataKey="max"
                                name="Intervalle haut"
                                stroke="none"
                                fill="url(#areaGradient)"
                                fillOpacity={0.3}
                            />
                            <Line
                                type="monotone"
                                dataKey="prevue"
                                name="Charge prévue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={renderDot}
                                activeDot={{ r: 8, fill: '#3b82f6' }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                    
                    <div className="chart-legend-premium">
                        <div className="legend-item">
                            <div className="legend-color blue"></div>
                            <span>Charge prévue</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color gray"></div>
                            <span>Intervalle de confiance (95%)</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot red"></div>
                            <span>Pic anticipé</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-line orange"></div>
                            <span>Moyenne hebdomadaire</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Tableau */}
            {activeTab === 'table' && (
                <div className="table-container-premium">
                    <table className="prevision-table-premium">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Jour</th>
                                <th>Charge prévue</th>
                                <th>Intervalle de confiance</th>
                                <th>Tendance</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map((day, index) => {
                                const jourSemaine = new Date(day.dateFull).toLocaleDateString('fr-FR', { weekday: 'long' });
                                const variation = index > 0 ? ((day.prevue - chartData[index-1].prevue) / chartData[index-1].prevue * 100).toFixed(1) : 0;
                                return (
                                    <tr key={index} className={day.estPic ? 'warning-row' : ''}>
                                        <td className="date-cell">
                                            <span className="date-number">{day.date.split(' ')[1]}</span>
                                            <span className="date-weekday">{jourSemaine}</span>
                                        </td>
                                        <td>{jourSemaine}</td>
                                        <td className="charge-cell">
                                            <span className="charge-value">{day.prevue}</span>
                                            <span className="charge-unit">unités</span>
                                        </td>
                                        <td>
                                            <div className="confidence-interval">
                                                <span className="interval-min">{day.min}</span>
                                                <div className="interval-bar">
                                                    <div className="interval-fill" style={{ width: `${((day.prevue - day.min) / (day.max - day.min)) * 100}%` }}></div>
                                                </div>
                                                <span className="interval-max">{day.max}</span>
                                            </div>
                                        </td>
                                        <td className={`trend-cell ${variation > 0 ? 'up' : variation < 0 ? 'down' : ''}`}>
                                            {variation > 0 ? <FaArrowUp /> : variation < 0 ? <FaArrowDown /> : '→'}
                                            <span>{Math.abs(variation)}%</span>
                                        </td>
                                        <td>
                                            {day.estPic ? (
                                                <span className="badge-pic">⚠️ Pic anticipé</span>
                                            ) : (
                                                <span className="badge-normal">✓ Normal</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer info */}
            <div className="prevision-footer">
                <div className="footer-info">
                    <FaInfoCircle className="info-icon" />
                    <span>Dernier calcul: {previsions.dateCalcul ? new Date(previsions.dateCalcul).toLocaleString() : '-'}</span>
                </div>
                <div className="footer-info">
                    <span>🏭 Entrepôt: {previsions.entrepotNom || 'Principal'}</span>
                </div>
                <div className="footer-info">
                    <span>🤖 Modèle: ARIMA (7,1,2) avec saisonnalité</span>
                </div>
            </div>
        </div>
    );
};

export default PrevisionChart;