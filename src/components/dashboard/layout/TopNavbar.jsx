import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaWarehouse, FaBell, FaSearch, FaLock, FaUserCircle } from 'react-icons/fa';
import './TopNavbar.css';

const TopNavbar = ({ userPrenom, userName, userRole, profileImage, onLogout, onProfileClick, onPasswordClick }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const handleProfileClick = () => {
        setShowUserMenu(false);
        if (onProfileClick) {
            onProfileClick();
        } else {
            navigate('/dashboard?tab=profile');
        }
    };

    const handlePasswordClick = () => {
        setShowUserMenu(false);
        if (onPasswordClick) {
            onPasswordClick();
        } else {
            navigate('/dashboard?tab=password');
        }
    };

    const getInitials = () => {
        return (userPrenom?.charAt(0) || '') + (userName?.charAt(0) || '');
    };

    // Fermer le menu quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="top-navbar">
            <div className="navbar-left">
                <div className="logo">
                   
                    <span className="logo-text">WAREHOUSE SOLUTION</span>
                </div>
                
                
            </div>

            <div className="navbar-right">
                <button className="notification-btn">
                    <FaBell />
                    <span className="notification-badge">1</span>
                </button>

                {/* ✅ Menu utilisateur avec dropdown à droite */}
                <div className="user-menu-container" ref={menuRef}>
                    <button 
                        className="user-avatar-btn" 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="user-avatar" />
                        ) : (
                            <div className="user-avatar-placeholder">
                                {getInitials()}
                            </div>
                        )}
                    </button>

                    {/* ✅ Menu déroulant positionné à droite */}
                    {showUserMenu && (
                        <div className="user-dropdown-menu right-aligned">
                            <div className="dropdown-header">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="dropdown-avatar" />
                                ) : (
                                    <div className="dropdown-avatar-placeholder">
                                        {getInitials()}
                                    </div>
                                )}
                                <div className="dropdown-user-info">
                                    <span className="dropdown-user-name">{userPrenom} {userName}</span>
                                    <span className="dropdown-user-role">{userRole}</span>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleProfileClick}>
                                <FaUserCircle className="dropdown-icon" />
                                <span>Mon Profil</span>
                            </button>
                            <button className="dropdown-item" onClick={handlePasswordClick}>
                                <FaLock className="dropdown-icon" />
                                <span>Changer Mot de Passe</span>
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout-item" onClick={onLogout}>
                                <FaSignOutAlt className="dropdown-icon" />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;