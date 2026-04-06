import React, { useState, useEffect } from 'react';
import { rangementService } from '../../services/rangementService';
import RangementTaskCard from './RangementTaskCard';

import './styles/RangementList.css';
import { FiPackage } from "react-icons/fi";

const RangementList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('A_FAIRE');
    const [stats, setStats] = useState({ aFaire: 0, enCours: 0, terminees: 0 });

    const userRole = localStorage.getItem('role');
    const isOperateur = userRole === 'OPERATEUR_ENTREPOT' || userRole === 'ADMINISTRATEUR';
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';

    // 🔹 Fonction utilitaire pour trier les tâches par date décroissante (la plus récente en premier)
    const sortTasksByDateDesc = (tasksArray) => {
        return [...tasksArray].sort((a, b) => {
            // Utiliser createdAt si disponible, sinon l'ID (plus récent = ID plus grand)
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.id);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.id);
            return dateB - dateA; // Décroissant
        });
    };

    useEffect(() => {
        loadTasks();
    }, [filter]);

    const loadTasks = async () => {
        setLoading(true);
        setError('');
        
        try {
            console.log('🔍 Chargement des tâches, filtre:', filter);
            
            let data = [];
            if (filter === 'TOUS' && isResponsable) {
                data = await rangementService.getAllTasks();
            } else {
                data = await rangementService.getTasksByStatut(filter);
            }
            
            console.log('✅ Données reçues:', data);
            const sortedData = sortTasksByDateDesc(Array.isArray(data) ? data : []);
            setTasks(sortedData);
            
            // Mettre à jour les statistiques
            const allTasks = await rangementService.getAllTasks().catch(() => []);
            const allTasksArray = Array.isArray(allTasks) ? allTasks : [];
            
            setStats({
                aFaire: allTasksArray.filter(t => t.statut === 'A_FAIRE').length,
                enCours: allTasksArray.filter(t => t.statut === 'EN_COURS').length,
                terminees: allTasksArray.filter(t => t.statut === 'TERMINEE').length
            });
            
        } catch (err) {
            console.error('❌ Erreur chargement:', err);
            setError(err.message || 'Erreur lors du chargement');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async (taskId) => {
        try {
            await rangementService.commencerTask(taskId);
            loadTasks();
        } catch (err) {
            setError('Erreur lors du démarrage');
        }
    };

    const handleComplete = async (taskId, emplacement) => {
        try {
            await rangementService.terminerTask(taskId, emplacement);
            loadTasks();
        } catch (err) {
            setError('Erreur lors de la fin du rangement');
        }
    };

    if (loading) return <div className="loading">Chargement des tâches...</div>;

    return (
        <div className="rangement-container">
            <div className="header">
                <h2> <FiPackage />  Rangement en cours</h2>
                {isResponsable && (
                    <div className="stats">
                        <div className="stat-card">
                            <span className="stat-value">{stats.aFaire}</span>
                            <span className="stat-label">À faire</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{stats.enCours}</span>
                            <span className="stat-label">En cours</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{stats.terminees}</span>
                            <span className="stat-label">Terminées</span>
                        </div>
                    </div>
                )}
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="filters">
                <button 
                    className={`filter-btn ${filter === 'A_FAIRE' ? 'active' : ''}`}
                    onClick={() => setFilter('A_FAIRE')}
                >
                    ⏳ À faire {stats.aFaire > 0 && `(${stats.aFaire})`}
                </button>
                <button 
                    className={`filter-btn ${filter === 'EN_COURS' ? 'active' : ''}`}
                    onClick={() => setFilter('EN_COURS')}
                >
                    🔄 En cours {stats.enCours > 0 && `(${stats.enCours})`}
                </button>
                <button 
                    className={`filter-btn ${filter === 'TERMINEE' ? 'active' : ''}`}
                    onClick={() => setFilter('TERMINEE')}
                >
                    ✅ Terminées {stats.terminees > 0 && `(${stats.terminees})`}
                </button>
                {isResponsable && (
                    <button 
                        className={`filter-btn ${filter === 'TOUS' ? 'active' : ''}`}
                        onClick={() => setFilter('TOUS')}
                    >
                        📋 Toutes
                    </button>
                )}
            </div>

            <div className="tasks-grid">
                {tasks.length === 0 ? (
                    <div className="no-tasks">
                        {filter === 'A_FAIRE' && "🎉 Aucune tâche de rangement en attente"}
                        {filter === 'EN_COURS' && "Aucune tâche en cours"}
                        {filter === 'TERMINEE' && "Aucune tâche terminée"}
                        {filter === 'TOUS' && "Aucune tâche"}
                    </div>
                ) : (
                    tasks.map(task => (
                        <RangementTaskCard
                            key={task.id}
                            task={task}
                            onStart={isOperateur ? handleStart : null}
                            onComplete={isOperateur ? handleComplete : null}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default RangementList;