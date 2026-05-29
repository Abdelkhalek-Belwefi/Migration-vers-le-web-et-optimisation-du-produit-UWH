import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaUserCircle, 
    FaSignOutAlt, 
    FaLock, 
    FaChevronDown 
} from 'react-icons/fa';
import NotificationBell from '../notification/NotificationBell';
import './AdminNavbar.css';

const AdminNavbar = ({ userPrenom, userName, userRole, profileImage, onLogout, onProfileClick, onPasswordClick }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const handleProfileClick = () => {
        setShowUserMenu(false);
        if (onProfileClick) onProfileClick();
        else navigate('/admin?tab=profile');
    };

    const handlePasswordClick = () => {
        setShowUserMenu(false);
        if (onPasswordClick) onPasswordClick();
        else navigate('/admin?tab=password');
    };

    const handleLogoutClick = () => {
        setShowUserMenu(false);
        if (onLogout) onLogout();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = () => {
        return (userPrenom?.charAt(0) || '') + (userName?.charAt(0) || 'A');
    };

    return (
        <nav className="admin-navbar">
            {/* Zone gauche laissée libre pour équilibrer l'espace */}
            <div className="admin-navbar-left"></div>

            {/* Actions de droite (Notifications + Profil) */}
            <div className="admin-navbar-actions">
                <NotificationBell />

                <div className="admin-navbar-divider"></div>

                {/* Pilule Utilisateur Premium */}
                <div className="admin-user-menu" ref={menuRef}>
                    <button className="admin-user-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
                        <div className="admin-avatar-wrapper">
                            {profileImage ? (
                                <img src={profileImage} alt="Admin" className="admin-avatar-img" />
                            ) : (
                                <div className="admin-avatar-initials">{getInitials().toUpperCase()}</div>
                            )}
                        </div>
                        <div className="admin-user-info">
                            <span className="admin-user-name">{userPrenom} {userName}</span>
                            <span className="admin-user-role">{userRole || 'ADMINISTRATEUR'}</span>
                        </div>
                        <FaChevronDown className={`admin-arrow-icon ${showUserMenu ? 'admin-arrow-rotate' : ''}`} />
                    </button>

                    {/* Menu Déroulant */}
                    {showUserMenu && (
                        <div className="admin-dropdown-menu">
                            <button className="admin-dropdown-item" onClick={handleProfileClick}>
                                <FaUserCircle className="admin-dropdown-icon" />
                                <span>Mon Profil</span>
                            </button>
                            <button className="admin-dropdown-item" onClick={handlePasswordClick}>
                                <FaLock className="admin-dropdown-icon" />
                                <span>Changer mot de passe</span>
                            </button>
                            <div className="admin-dropdown-divider"></div>
                            <button className="admin-dropdown-item admin-logout-item" onClick={handleLogoutClick}>
                                <FaSignOutAlt className="admin-dropdown-icon" />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;