import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { FaUsers, FaUserCheck, FaUserPlus, FaChartPie } from 'react-icons/fa';
import './AdminStats.css';

const AdminStats = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        newThisMonth: 0,
        roleDistribution: {}
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            // Récupérer tous les utilisateurs
            const users = await adminService.getAllUsers();
            
            // Calculer les statistiques
            const totalUsers = users.length;
            const activeUsers = users.filter(u => u.estActif).length;
            
            // Compter par rôle
            const roleDistribution = users.reduce((acc, user) => {
                const role = user.role || 'NON_DEFINI';
                acc[role] = (acc[role] || 0) + 1;
                return acc;
            }, {});

            // Utilisateurs du mois en cours
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const newThisMonth = users.filter(u => {
                const created = new Date(u.createdAt);
                return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
            }).length;

            // 5 derniers utilisateurs inscrits
            const recent = [...users]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setStats({
                totalUsers,
                activeUsers,
                newThisMonth,
                roleDistribution
            });
            setRecentUsers(recent);
            setError('');
        } catch (err) {
            console.error('Erreur chargement stats:', err);
            setError('Erreur lors du chargement des statistiques');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            'ADMINISTRATEUR': 'Administrateur',
            'RESPONSABLE_ENTREPOT': 'Responsable Entrepôt',
            'OPERATEUR_ENTREPOT': 'Opérateur Entrepôt',
            'OPERATOR': 'En attente'
        };
        return labels[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            'ADMINISTRATEUR': '#dc3545',
            'RESPONSABLE_ENTREPOT': '#28a745',
            'OPERATEUR_ENTREPOT': '#17a2b8',
            'OPERATOR': '#ffc107'
        };
        return colors[role] || '#6c757d';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="stats-loading">Chargement des statistiques...</div>;
    if (error) return <div className="stats-error">{error}</div>;

    return (
        <div className="admin-stats-container">
            <h2>Tableau de bord administrateur</h2>
            
            {/* Cartes de statistiques */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <FaUsers />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total utilisateurs</span>
                        <span className="stat-value">{stats.totalUsers}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon active">
                        <FaUserCheck />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Utilisateurs actifs</span>
                        <span className="stat-value">{stats.activeUsers}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon new">
                        <FaUserPlus />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Nouveaux ce mois</span>
                        <span className="stat-value">{stats.newThisMonth}</span>
                    </div>
                </div>
            </div>

            {/* Distribution des rôles */}
            <div className="stats-section">
                <h3>
                    <FaChartPie className="section-icon" />
                    Distribution des rôles
                </h3>
                <div className="roles-distribution">
                    {Object.entries(stats.roleDistribution).map(([role, count]) => (
                        <div key={role} className="role-stat">
                            <div className="role-info">
                                <span className="role-name">{getRoleLabel(role)}</span>
                                <span className="role-count">{count}</span>
                            </div>
                            <div className="role-bar">
                                <div 
                                    className="role-bar-fill"
                                    style={{ 
                                        width: `${(count / stats.totalUsers) * 100}%`,
                                        backgroundColor: getRoleColor(role)
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dernières inscriptions */}
            <div className="stats-section">
                <h3>Dernières inscriptions</h3>
                <div className="recent-users">
                    {recentUsers.map(user => (
                        <div key={user.id} className="recent-user-card">
                            <div className="user-avatar">
                                {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                            </div>
                            <div className="user-details">
                                <div className="user-name">
                                    {user.prenom} {user.nom}
                                </div>
                                <div className="user-email">{user.email}</div>
                                <div className="user-meta">
                                    <span className="user-date">{formatDate(user.createdAt)}</span>
                                    <span 
                                        className="user-role-badge"
                                        style={{ backgroundColor: getRoleColor(user.role) }}
                                    >
                                        {getRoleLabel(user.role)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminStats;