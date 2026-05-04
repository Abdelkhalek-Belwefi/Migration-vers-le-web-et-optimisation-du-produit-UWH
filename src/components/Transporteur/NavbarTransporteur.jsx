import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBell, FaLock, FaChevronDown, FaQuestionCircle, FaSearch } from 'react-icons/fa';
import NotificationBell from '../notification/NotificationBell';
import './NavbarTransporteur.css';

const NavbarTransporteur = ({ userPrenom, userName, userRole, profileImage, onLogout, onProfileClick, onPasswordClick }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const handleAction = (callback, tab) => {
        setShowUserMenu(false);
        if (callback) callback();
        else navigate(`/transporteur?tab=${tab}`);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="NavbarTransporteur-modern-dark-nav">
            <div className="NavbarTransporteur-nav-container">
                {/* Section Gauche : Logo & Recherche */}
                <div className="NavbarTransporteur-nav-left-section">
                    <div className="NavbarTransporteur-nav-logo">
                        <span className="NavbarTransporteur-accent-bar"></span>
                        <span className="NavbarTransporteur-logo-text">Warehouse</span>
                    </div>
                </div>

                {/* Section Droite : Actions & Profil */}
                <div className="NavbarTransporteur-nav-right-section">
                    <div className="NavbarTransporteur-nav-actions">
                        <button className="NavbarTransporteur-nav-icon-btn"><FaSearch /></button>
                    </div>

                    {/* Cloche de notification */}
                    <NotificationBell />

                    <div className="NavbarTransporteur-nav-divider"></div>

                    <div className="NavbarTransporteur-user-profile-zone" ref={menuRef}>
                        <button className="NavbarTransporteur-profile-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
                            <div className="NavbarTransporteur-avatar-wrapper">
                                {profileImage ? (
                                    <img src={profileImage} alt="User" />
                                ) : (
                                    <div className="NavbarTransporteur-avatar-initials">{(userPrenom?.charAt(0) || '') + (userName?.charAt(0) || '')}</div>
                                )}
                            </div>
                            <div className="NavbarTransporteur-user-meta">
                                <span className="NavbarTransporteur-user-name">{userPrenom} {userName}</span>
                                <span className="NavbarTransporteur-user-role">{userRole || 'Fleet Manager'}</span>
                            </div>
                            <FaChevronDown className={`NavbarTransporteur-arrow-icon ${showUserMenu ? 'NavbarTransporteur-rotate' : ''}`} />
                        </button>

                        {showUserMenu && (
                            <div className="NavbarTransporteur-premium-dropdown">
                                <button className="NavbarTransporteur-drop-item" onClick={() => handleAction(onProfileClick, 'profile')}>
                                    <FaUserCircle /> Mon Profil
                                </button>
                                <button className="NavbarTransporteur-drop-item" onClick={() => handleAction(onPasswordClick, 'password')}>
                                    <FaLock /> Sécurité
                                </button>
                                <div className="NavbarTransporteur-drop-divider"></div>
                                <button className="NavbarTransporteur-drop-item NavbarTransporteur-logout" onClick={onLogout}>
                                    <FaSignOutAlt /> Déconnexion
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavbarTransporteur;