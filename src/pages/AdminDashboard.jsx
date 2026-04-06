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
    FaHome,
    FaList  // Ajout pour l'icône des catégories
} from 'react-icons/fa';
import Sidebar from '../components/dashboard/layout/Sidebar';
import UserManagement from '../components/admin/UserManagement';
import ArticleList from '../components/articles/ArticleList';
import StockList from '../components/stock/StockList';
import AdminStats from '../components/admin/stats/AdminStats';
import CategoryManagement from '../components/admin/CategoryManagement'; // Nouveau composant
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

    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: <FaHome /> },
        { id: 'users', label: 'Utilisateurs', icon: <FaUsers /> },
        { id: 'categories', label: 'Catégories', icon: <FaList /> }, // Nouvel élément
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
                {activeTab === 'dashboard' && <AdminStats />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'categories' && <CategoryManagement />}
                {activeTab === 'articles' && <ArticleList />}
                {activeTab === 'stocks' && <StockList />}
            </div>
        </div>
    );
};

export default AdminDashboard;