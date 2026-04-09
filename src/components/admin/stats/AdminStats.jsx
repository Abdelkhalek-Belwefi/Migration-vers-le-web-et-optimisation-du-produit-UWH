import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import {
    FaUsers,
    FaUserCheck,
    FaUserPlus,
    FaChartPie
} from 'react-icons/fa';

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

import './AdminStats.css';

const AdminStats = () => {

    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        newThisMonth: 0,
        roleDistribution: {},
        monthlyData: []
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

            const users = await adminService.getAllUsers();

            const totalUsers = users.length;
            const activeUsers = users.filter(u => u.estActif).length;

            // roles
            const roleDistribution = users.reduce((acc, user) => {
                const role = user.role || 'NON_DEFINI';
                acc[role] = (acc[role] || 0) + 1;
                return acc;
            }, {});

            // nouveaux ce mois
            const now = new Date();
            const newThisMonth = users.filter(u => {
                const d = new Date(u.createdAt);
                return d.getMonth() === now.getMonth() &&
                       d.getFullYear() === now.getFullYear();
            }).length;

            // stats mensuelles
            const monthlyStats = Array(12).fill(0);

            users.forEach(user => {
                const d = new Date(user.createdAt);
                monthlyStats[d.getMonth()]++;
            });

            const monthlyData = monthlyStats.map((val, i) => ({
                name: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
                users: val
            }));

            // derniers users
            const recent = [...users]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setStats({
                totalUsers,
                activeUsers,
                newThisMonth,
                roleDistribution,
                monthlyData
            });

            setRecentUsers(recent);
            setError('');

        } catch (err) {
            setError('Erreur chargement statistiques');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            ADMINISTRATEUR: 'Admin',
            RESPONSABLE_ENTREPOT: 'Responsable',
            OPERATEUR_ENTREPOT: 'Opérateur',
            OPERATOR: 'En attente'
        };
        return labels[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            ADMINISTRATEUR: '#ff4d4f',
            RESPONSABLE_ENTREPOT: '#52c41a',
            OPERATEUR_ENTREPOT: '#1890ff',
            OPERATOR: '#faad14'
        };
        return colors[role] || '#999';
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('fr-FR');

    if (loading) return <div className="stats-loading">Chargement...</div>;
    if (error) return <div className="stats-error">{error}</div>;

    // donut data
    const pieData = Object.entries(stats.roleDistribution).map(([role, val]) => ({
        name: getRoleLabel(role),
        value: val,
        role
    }));

    return (
        <div className="admin-stats-container">

            <h2>Dashboard Administrateur</h2>

            {/* CARDS */}
            <div className="stats-cards">

                <div className="stat-card">
                    <FaUsers className="icon blue" />
                    <div>
                        <p>Total utilisateurs</p>
                        <h3>{stats.totalUsers}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <FaUserCheck className="icon green" />
                    <div>
                        <p>Actifs</p>
                        <h3>{stats.activeUsers}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <FaUserPlus className="icon orange" />
                    <div>
                        <p>Nouveaux</p>
                        <h3>{stats.newThisMonth}</h3>
                    </div>
                </div>

            </div>

            {/* GRAPHS */}
            <div className="charts-grid">

                {/* BAR */}
                <div className="chart-card">
                    <h3>Inscriptions mensuelles</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.monthlyData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="users" radius={[10,10,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* DONUT */}
                <div className="chart-card">
                    <h3>
                        <FaChartPie /> Répartition rôles
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                innerRadius={70}
                                outerRadius={100}
                            >
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={getRoleColor(entry.role)} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {/* RECENT USERS */}
            <div className="stats-section">
                <h3>Dernières inscriptions</h3>

                {recentUsers.map(user => (
                    <div key={user.id} className="recent-user">
                        <div className="avatar">
                            {user.prenom?.[0]}{user.nom?.[0]}
                        </div>

                        <div>
                            <b>{user.prenom} {user.nom}</b>
                            <p>{user.email}</p>
                        </div>

                        <span className="date">
                            {formatDate(user.createdAt)}
                        </span>
                    </div>
                ))}

            </div>

        </div>
    );
};

export default AdminStats;