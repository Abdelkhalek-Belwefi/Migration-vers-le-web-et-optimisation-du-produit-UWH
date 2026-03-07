import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaUsers, 
    FaKey, 
    FaBoxOpen, 
    FaChartBar, 
    FaHistory, 
    FaSignOutAlt,
    FaTachometerAlt,
    FaBoxes  // ✅ Ajout pour l'icône des stocks
} from 'react-icons/fa';
import Sidebar from '../components/dashboard/layout/Sidebar';
import UserManagement from '../components/admin/UserManagement';
import ArticleList from '../components/articles/ArticleList';
import StockList from '../components/stock/StockList'; // ✅ IMPORT AJOUTÉ
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [userName] = useState(localStorage.getItem('nom') || 'Admin');
    const [userPrenom] = useState(localStorage.getItem('prenom') || '');
    const [userRole] = useState(localStorage.getItem('role') || 'ADMINISTRATEUR');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token) {
            navigate('/login');
        } else if (role !== 'ADMINISTRATEUR') {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // ✅ Menu avec l'item "Stocks" ajouté
    const menuItems = [
        { id: 'users', label: 'Utilisateurs', icon: <FaUsers /> },
        { id: 'roles', label: 'Rôles', icon: <FaKey /> },
        { id: 'articles', label: 'Catalogue articles', icon: <FaBoxOpen /> },
        { id: 'stocks', label: 'Gestion des Stocks', icon: <FaBoxes /> }, // ✅ NOUVEAU
        { id: 'stats', label: 'Statistiques', icon: <FaChartBar /> },
        { id: 'logs', label: 'Journaux', icon: <FaHistory /> },
        { id: 'back', label: 'Dashboard principal', icon: <FaTachometerAlt />, action: () => navigate('/dashboard') },
        { id: 'logout', label: 'Déconnexion', icon: <FaSignOutAlt />, action: handleLogout }
    ];

    return (
        <div className="admin-dashboard">
            <Sidebar
                userName={userName}
                userPrenom={userPrenom}
                userRole={userRole}
                menuItems={menuItems}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <div className="admin-main">
                {activeTab === 'users' && <UserManagement />}
                
                {activeTab === 'roles' && (
                    <div className="roles-management">
                        <h2>Gestion des Rôles</h2>
                        <div className="roles-grid">
                            <div className="role-card admin">
                                <h3>Administrateur</h3>
                                <p>Accès complet à toutes les fonctionnalités</p>
                                <ul>
                                    <li>Gestion des utilisateurs</li>
                                    <li>Gestion des rôles</li>
                                    <li>Configuration système</li>
                                </ul>
                            </div>
                            <div className="role-card manager">
                                <h3>Responsable Entrepôt</h3>
                                <p>Gestion des opérations d'entrepôt</p>
                                <ul>
                                    <li>Consultation stock</li>
                                    <li>Validation réception</li>
                                    <li>Validation expédition</li>
                                </ul>
                            </div>
                          
                            <div className="role-card effector">
                                <h3>Effecteur Transfert</h3>
                                <p>Gestion des transferts</p>
                                <ul>
                                    <li>Création picking</li>
                                    <li>Validation picking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'articles' && <ArticleList />}
                
                {/* ✅ NOUVEAU : Onglet pour les stocks */}
                {activeTab === 'stocks' && <StockList />}
                
                {activeTab === 'stats' && (
                    <div className="stats-container">
                        <h2>Statistiques</h2>
                        <p>En cours de développement...</p>
                    </div>
                )}
                
                {activeTab === 'logs' && (
                    <div className="logs-container">
                        <h2>Journal d'activité</h2>
                        <p>En cours de développement...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;