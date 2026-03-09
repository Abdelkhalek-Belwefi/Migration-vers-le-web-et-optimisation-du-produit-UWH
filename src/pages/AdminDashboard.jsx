import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaUsers, 
    FaKey, 
    FaBoxOpen, 
    FaChartBar, 
    FaSignOutAlt,
    FaTachometerAlt,
    FaBoxes,
    FaHome
} from 'react-icons/fa';
import Sidebar from '../components/dashboard/layout/Sidebar';
import UserManagement from '../components/admin/UserManagement';
import ArticleList from '../components/articles/ArticleList';
import StockList from '../components/stock/StockList';
import AdminStats from '../components/admin/stats/AdminStats';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
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

    // ✅ Menu simplifié - "Journaux" et "Dashboard principal" supprimés
    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: <FaHome /> },
        { id: 'users', label: 'Utilisateurs', icon: <FaUsers /> },
       
        { id: 'articles', label: 'Catalogue articles', icon: <FaBoxOpen /> },
        { id: 'stocks', label: 'Gestion des Stocks', icon: <FaBoxes /> },
        
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
                {/* Tableau de bord avec statistiques */}
                {activeTab === 'dashboard' && <AdminStats />}
                
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
                
                {activeTab === 'stocks' && <StockList />}
                
                {activeTab === 'stats' && (
                    <div className="stats-container">
                        <h2>Statistiques</h2>
                        <p>En cours de développement...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;