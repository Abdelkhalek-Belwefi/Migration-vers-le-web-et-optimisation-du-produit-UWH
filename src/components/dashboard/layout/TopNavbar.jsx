import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaWarehouse, FaBell, FaSearch, FaLock, FaUserCircle } from 'react-icons/fa';
import NotificationBell from '../../notification/NotificationBell';
import './TopNavbar.css';

const TopNavbar = ({ userPrenom, userName, userRole, profileImage, onLogout, onProfileClick, onPasswordClick }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
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
        setShowPasswordModal(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        
        if (newPassword !== confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas');
            return;
        }
        
        if (newPassword.length < 6) {
            setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        
        setLoadingPassword(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setPasswordSuccess('Mot de passe modifié avec succès !');
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess('');
                }, 2000);
            } else {
                setPasswordError(data.message || 'Erreur lors du changement de mot de passe');
            }
        } catch (error) {
            setPasswordError('Erreur de connexion au serveur');
        } finally {
            setLoadingPassword(false);
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
        <>
            <nav className="top-navbar">
                <div className="navbar-left">
                    <div className="logo">
                        <span className="logo-text">WAREHOUSE SOLUTION</span>
                    </div>
                </div>

                <div className="navbar-right">
                    {/* Cloche de notification unique */}
                    <NotificationBell />

                    {/* Menu utilisateur avec dropdown à droite */}
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

                        {/* Menu déroulant positionné à droite */}
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

            {/* MODAL CHANGER MOT DE PASSE */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={handleClosePasswordModal}>
                    <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔒 Changer le mot de passe</h3>
                            <button className="modal-close" onClick={handleClosePasswordModal}>✕</button>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className="modal-body">
                                {passwordError && <div className="alert error">{passwordError}</div>}
                                {passwordSuccess && <div className="alert success">{passwordSuccess}</div>}
                                
                                <div className="form-group">
                                    <label>Ancien mot de passe</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                        placeholder="Entrez votre ancien mot de passe"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Minimum 6 caractères"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Confirmer le nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Confirmez votre nouveau mot de passe"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={handleClosePasswordModal}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-submit" disabled={loadingPassword}>
                                    {loadingPassword ? 'Chargement...' : 'Changer le mot de passe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopNavbar;