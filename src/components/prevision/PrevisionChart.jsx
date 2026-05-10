import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, ComposedChart,
    Legend
} from 'recharts';
import { FaChartLine, FaExclamationTriangle, FaSync, FaCalendarAlt } from 'react-icons/fa';
import { previsionService } from '../../services/PrevisionService';
import './PrevisionChart.css';

const PrevisionChart = () => {
    const [previsions, setPrevisions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

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

    // Formater les données pour Recharts
    const formatDataForChart = () => {
        if (!previsions || !previsions.previsions) return [];

        return previsions.previsions.map(p => ({
            date: new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
            dateFull: p.date,
            prevue: Math.round(p.chargePrevue),
            min: Math.round(p.chargeMin),
            max: Math.round(p.chargeMax),
            estPic: p.estPic,
            commentaire: p.commentaire
        }));
    };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Trouver l'élément avec le plus de données pour extraire estPic
            const dataPoint = payload[0]?.payload;
            return (
                <div style={{
                    background: '#1e293b',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
                    <p style={{ margin: '4px 0' }}>
                        📈 Charge prévue: <strong>{payload[0]?.value}</strong>
                    </p>
                    <p style={{ margin: '4px 0', color: '#94a3b8' }}>
                        📉 Fourchette: {Math.round(payload[2]?.value)} - {Math.round(payload[1]?.value)}
                    </p>
                    {dataPoint?.estPic && (
                        <p style={{ margin: '8px 0 0 0', color: '#f87171' }}>
                            ⚠️ PIC DE CHARGE PRÉVU !
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    // Custom dot pour les pics
    const renderDot = (props) => {
        const { cx, cy, payload } = props;
        if (payload.estPic) {
            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={8}
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth={2}
                />
            );
        }
        return (
            <circle
                cx={cx}
                cy={cy}
                r={5}
                fill="#3b82f6"
                stroke="white"
                strokeWidth={1}
            />
        );
    };

    if (loading) {
        return (
            <div className="prevision-container">
                <div className="prevision-loading">
                    <div className="spinner"></div>
                    <p>Chargement des prévisions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="prevision-container">
                <div className="prevision-error">
                    <FaExclamationTriangle style={{ fontSize: '2rem', marginBottom: '12px' }} />
                    <p>{error}</p>
                    <button onClick={chargerPrevisions} className="btn-refresh-prevision" style={{ marginTop: '16px' }}>
                        <FaSync /> Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (!previsions || !previsions.previsions || previsions.previsions.length === 0) {
        return (
            <div className="prevision-container">
                <div className="prevision-error">
                    <p>Aucune donnée de prévision disponible.</p>
                    <p className="prevision-help">Les prévisions seront disponibles après 30 jours d'historique.</p>
                </div>
            </div>
        );
    }

    const chartData = formatDataForChart();

    return (
        <div className="prevision-container">
            {/* HEADER */}
            <div className="prevision-header">
                <div className="prevision-title">
                    <FaChartLine className="title-icon" />
                    <h2>Prévisions de charge - 7 jours</h2>
                    <div className="prevision-badge">
                        <span className="pulse-dot"></span>
                        {previsions.alertePicProche ? '⚠️ Pics détectés' : '🟢 Tendance normale'}
                    </div>
                </div>
                <button 
                    className="btn-refresh-prevision" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <FaSync className={refreshing ? 'fa-spin' : ''} />
                    {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
                </button>
            </div>

            {/* ALERTE PIC */}
            {previsions.alertePicProche && previsions.messageAlerte && (
                <div className="prevision-alert">
                    <div className="prevision-alert-icon">⚠️</div>
                    <div className="prevision-alert-content">
                        <div className="prevision-alert-title">Pic de charge anticipé !</div>
                        <div className="prevision-alert-message">{previsions.messageAlerte}</div>
                    </div>
                </div>
            )}

            {/* STATS CARDS */}
            <div className="prevision-stats">
                <div className="stat-card-prev">
                    <div className="stat-label">CHARGE MOYENNE PRÉVUE</div>
                    <div className="stat-value avg">{Math.round(previsions.chargeMoyennePrevue || 0)}</div>
                </div>
                <div className="stat-card-prev">
                    <div className="stat-label">CHARGE MAXIMALE PRÉVUE</div>
                    <div className="stat-value max">{Math.round(previsions.chargeMaxPrevue || 0)}</div>
                </div>
                <div className="stat-card-prev">
                    <div className="stat-label">DATE DU PIC MAX</div>
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>
                        {previsions.datePicMax ? new Date(previsions.datePicMax).toLocaleDateString('fr-FR') : '-'}
                    </div>
                </div>
            </div>

            {/* GRAPHIQUE */}
            <div className="prevision-chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {/* Zone de confiance (min-max) - NOTER L'ORDRE : min, max, puis prevue */}
                        <Area
                            type="monotone"
                            dataKey="min"
                            name="Fourchette basse"
                            stroke="#93c5fd"
                            fill="#93c5fd"
                            fillOpacity={0.2}
                            strokeWidth={0}
                        />
                        <Area
                            type="monotone"
                            dataKey="max"
                            name="Fourchette haute"
                            stroke="#93c5fd"
                            fill="#93c5fd"
                            fillOpacity={0.2}
                            strokeWidth={0}
                        />
                        
                        {/* Ligne principale (prévision) avec dots personnalisés pour les pics */}
                        <Line
                            type="monotone"
                            dataKey="prevue"
                            name="Charge prévue"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={renderDot}
                            activeDot={{ r: 8 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* LÉGENDE */}
            <div className="prevision-legend">
                <div className="legend-item">
                    <div className="legend-color prev"></div>
                    <span>Charge prévue</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color range"></div>
                    <span>Intervalle de confiance (± écart-type)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color pic"></div>
                    <span>Pic détecté ({'>'} {previsions.chargeMoyennePrevue ? Math.round(previsions.chargeMoyennePrevue * 1.5) : '50'}% de la moyenne)</span>
                </div>
            </div>

            {/* TABLEAU DÉTAILLÉ */}
            <div className="prevision-table-wrapper">
                <table className="prevision-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Charge prévue</th>
                            <th>Fourchette min</th>
                            <th>Fourchette max</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chartData.map((day, index) => (
                            <tr key={index} className={day.estPic ? 'pic-cell' : ''}>
                                <td>
                                    <FaCalendarAlt style={{ marginRight: '6px', color: '#64748b', fontSize: '0.7rem' }} />
                                    {day.date}
                                </td>
                                <td><strong>{day.prevue}</strong></td>
                                <td>{day.min}</td>
                                <td>{day.max}</td>
                                <td>
                                    {day.estPic ? (
                                        <span className="pic-badge">⚠️ PIC ANTICIPÉ</span>
                                    ) : (
                                        <span style={{ color: '#10b981', fontSize: '0.7rem' }}>✓ Normal</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* INFO SUPPLEMENTAIRE */}
            <div style={{ marginTop: '16px', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>
                Dernier calcul: {previsions.dateCalcul ? new Date(previsions.dateCalcul).toLocaleString() : '-'}
                {' • '}
                Entrepôt: {previsions.entrepotNom || 'Principal'}
                {' • '}
                Modèle: Lissage exponentiel + saisonnalité hebdomadaire
            </div>
        </div>
    );
};

export default PrevisionChart;