import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaUsers, 
    FaBoxOpen, 
    FaSignOutAlt,
    FaBoxes,
    FaHome,
    FaList,
    FaChartLine,
    FaCamera,
    FaLock ,
    FaUser ,
    FaTrash
} from 'react-icons/fa';
import Sidebar from '../components/dashboard/layout/Sidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import UserManagement from '../components/admin/UserManagement';
import ArticleList from '../components/articles/ArticleList';
import StockList from '../components/stock/StockList';
import AdminStats from '../components/admin/stats/AdminStats';
import CategoryManagement from '../components/admin/CategoryManagement';
import '../styles/admin-dashboard.css';
import EntrepotManagement from '../components/admin/EntrepotManagement';
import PrevisionChart from '../components/prevision/PrevisionChart';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [userName] = useState(localStorage.getItem('nom') || 'Admin');
    const [userPrenom] = useState(localStorage.getItem('prenom') || '');
    const [userRole] = useState(localStorage.getItem('role') || 'ADMINISTRATEUR');
    const [userId] = useState(localStorage.getItem('userId') || null);
    const [profileImage, setProfileImage] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    // ========== CHARGER LA PHOTO DEPUIS LA BASE DE DONNÉES ==========
    useEffect(() => {
        const loadProfileImageFromBackend = async () => {
            const token = localStorage.getItem('token');
            // Récupérer userId depuis localStorage ou depuis le token si nécessaire
            let userIdFromStorage = localStorage.getItem('userId');
            
            // Fallback: essayer de récupérer depuis l'email ou un autre moyen
            if (!userIdFromStorage) {
                const email = localStorage.getItem('email');
                if (email) {
                    try {
                        const response = await fetch(`http://localhost:8080/api/auth/user/by-email?email=${encodeURIComponent(email)}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const userData = await response.json();
                        if (userData && userData.id) {
                            userIdFromStorage = userData.id;
                            localStorage.setItem('userId', userIdFromStorage);
                        }
                    } catch (err) {
                        console.error('Erreur récupération userId:', err);
                    }
                }
            }
            
            if (!token || !userIdFromStorage) {
                console.log('Token ou userId manquant');
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:8080/api/admin/users/${userIdFromStorage}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const userData = await response.json();
                if (userData.profileImage) {
                    setProfileImage(userData.profileImage);
                    localStorage.setItem('profileImage', userData.profileImage);
                } else {
                    const savedImage = localStorage.getItem('profileImage');
                    if (savedImage) setProfileImage(savedImage);
                }
            } catch (error) {
                console.error('Erreur chargement photo:', error);
                const savedImage = localStorage.getItem('profileImage');
                if (savedImage) setProfileImage(savedImage);
            }
        };
        
        loadProfileImageFromBackend();
        
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

    // ========== GESTION DE LA PHOTO DE PROFIL AVEC BACKEND ==========
    const handleProfileClick = () => {
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const saveProfileImageToBackend = async (base64Image) => {
        const token = localStorage.getItem('token');
        let userIdFromStorage = localStorage.getItem('userId');
        
        if (!token || !userIdFromStorage) return;
        
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${userIdFromStorage}/profile-image`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileImage: base64Image })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde');
            }
            console.log('Photo sauvegardée en base de données');
        } catch (error) {
            console.error('Erreur sauvegarde photo:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner une image valide');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('L\'image ne doit pas dépasser 2 Mo');
                return;
            }
            
            setUploadingImage(true);
            
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;
                setProfileImage(base64Image);
                localStorage.setItem('profileImage', base64Image);
                await saveProfileImageToBackend(base64Image);
                setUploadingImage(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = async () => {
        if (window.confirm('Supprimer votre photo de profil ?')) {
            setProfileImage(null);
            localStorage.removeItem('profileImage');
            await saveProfileImageToBackend(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ========== GESTION DU MOT DE PASSE ==========
    const handlePasswordClick = () => {
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
        
        setLoading(true);
        
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
            setLoading(false);
        }
    };

    const handleSettingsClick = () => {
        alert('Page des paramètres - À implémenter');
    };

    const getRoleLabel = (role) => {
        const labels = {
            ADMINISTRATEUR: 'Administrateur',
            RESPONSABLE_ENTREPOT: 'Responsable Entrepôt',
            OPERATEUR_ENTREPOT: 'Opérateur Entrepôt',
            OPERATOR: 'Opérateur (en attente)',
            SERVICE_COMMERCIAL: 'Service Commercial',
            TRANSPORTEUR: 'Transporteur'
        };
        return labels[role] || role;
    };

    const getInitials = () => {
        return (userPrenom?.charAt(0) || '') + (userName?.charAt(0) || '');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: <FaHome /> },
        { id: 'articles', label: 'Catalogue articles', icon: <FaBoxOpen /> },
        { id: 'users', label: 'Utilisateurs', icon: <FaUsers /> },
        { id: 'categories', label: 'Catégories', icon: <FaList /> },
        { id: 'entrepots', label: 'Entrepôts', icon: <FaBoxes /> },
        { id: 'previsions', label: 'Prévisions 7j', icon: <FaChartLine /> }
        
    ];

    return (
        <div className="admin_dash_container">
            <AdminNavbar 
                userPrenom={userPrenom}
                userName={userName}
                userRole={getRoleLabel(userRole)}
                profileImage={profileImage}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPasswordClick={handlePasswordClick}
                onSettingsClick={handleSettingsClick}
            />
            <div className="admin_dash_layout">
                <Sidebar
                    userName={userName}
                    userPrenom={userPrenom}
                    userRole={userRole}
                    menuItems={menuItems}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    profileImage={profileImage}
                />
                <div className="admin_dash_main">
                    {activeTab === 'dashboard' && <AdminStats />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'categories' && <CategoryManagement />}
                    {activeTab === 'previsions' && <PrevisionChart />}
                    {activeTab === 'entrepots' && <EntrepotManagement />}
                    {activeTab === 'articles' && <ArticleList />}
                    {activeTab === 'stocks' && <StockList />}
                </div>
            </div>

            {/* MODAL PROFIL AVEC PHOTO */}
            {showProfileModal && (
                <div className="admin_dash_modal_overlay" onClick={handleCloseProfileModal}>
                    <div className="admin_dash_modal_content admin_dash_profile_modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin_dash_modal_header">
                            <h3><FaUser />Mon Profil</h3>
                            
                        </div>
                        <div className="admin_dash_modal_body">
                            <div className="admin_dash_profile_info">
                                <div className="admin_dash_profile_avatar_container">
                                    <div 
                                        className="admin_dash_profile_avatar_large"
                                        onClick={handleImageClick}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" />
                                        ) : (
                                            <div className="admin_dash_avatar_initials_large">
                                                {getInitials()}
                                            </div>
                                        )}
                                        <div className="admin_dash_avatar_overlay">
                                            <FaCamera />
                                        </div>
                                    </div>
                                    
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    
                                    <div className="admin_dash_avatar_actions">
                                        <button 
                                            className="admin_dash_btn_change_photo" 
                                            onClick={handleImageClick}
                                            disabled={uploadingImage}
                                        >
                                            <FaCamera /> {uploadingImage ? 'Chargement...' : 'Changer la photo'}
                                        </button>
                                        {profileImage && (
                                            <button 
                                                className="admin_dash_btn_delete_photo" 
                                                onClick={handleDeleteImage}
                                            >
                                                <FaTrash /> Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="admin_dash_profile_details">
                                    <p><strong>Nom complet :</strong> {userPrenom} {userName}</p>
                                    <p><strong>Email :</strong> {localStorage.getItem('email')}</p>
                                    <p><strong>Rôle :</strong> {getRoleLabel(userRole)}</p>
                                    <p><strong>Statut :</strong> <span className="admin_dash_status_active">Actif</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="admin_dash_modal_footer">
                            <button className="admin_dash_btn_close" onClick={handleCloseProfileModal}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHANGER MOT DE PASSE */}
            {showPasswordModal && (
                <div className="admin_dash_modal_overlay" onClick={handleClosePasswordModal}>
                    <div className="admin_dash_modal_content admin_dash_password_modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin_dash_modal_header">
                            <h3><FaLock /> Changer le mot de passe</h3>
                            <button className="admin_dash_modal_close" onClick={handleClosePasswordModal}>✕</button>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className="admin_dash_modal_body">
                                {passwordError && <div className="admin_dash_alert admin_dash_error">{passwordError}</div>}
                                {passwordSuccess && <div className="admin_dash_alert admin_dash_success">{passwordSuccess}</div>}
                                
                                <div className="admin_dash_form_group">
                                    <label>Ancien mot de passe</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                        placeholder="Entrez votre ancien mot de passe"
                                    />
                                </div>
                                
                                <div className="admin_dash_form_group">
                                    <label>Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Minimum 6 caractères"
                                    />
                                </div>
                                
                                <div className="admin_dash_form_group">
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
                            <div className="admin_dash_modal_footer">
                                <button type="button" className="admin_dash_btn_cancel" onClick={handleClosePasswordModal}>
                                    Annuler
                                </button>
                                <button type="submit" className="admin_dash_btn_submit" disabled={loading}>
                                    {loading ? 'Chargement...' : 'Changer le mot de passe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;