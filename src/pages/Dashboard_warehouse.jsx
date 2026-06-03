// src/pages/Dashboard_warehouse.jsx (version nettoyée)
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FaTachometerAlt, 
    FaBoxOpen,
    FaBoxes,
    FaClipboardList,
    FaExchangeAlt,
    FaCheckCircle,
    FaTruck,
    FaPrint,
    FaSync,
    FaHistory,
    FaShoppingCart,
    FaExclamationTriangle,
    FaInbox,
    FaClock,
    FaChartLine  // ← AJOUTÉ POUR L'ICÔNE DES PRÉVISIONS
} from 'react-icons/fa';
import Sidebar from "../components/dashboard/layout/Sidebar";
import TopNavbar from "../components/dashboard/layout/TopNavbar";
import WelcomeWidgets from "../components/dashboard//layout/WelcomeWidgets";
import ArticleList from "../components/articles/ArticleList";
import StockList from "../components/stock/StockList";
import StockMovementForm from "../components/stock/StockMovementForm";
import MouvementHistorique from "../components/stock/MouvementHistorique";
import ReceptionList from "../components/reception/ReceptionList";
import RangementList from "../components/rangement/RangementList";
import ClientList from "../components/commercial/ClientList";
import CommandeList from "../components/commercial/CommandeList";
import PreparationCommandes from "../components/entrepot/PreparationCommandes";
import ExpedierCommandes from "../components/expedition/ExpedierCommandes";
import ImpressionDocuments from "../components/expedition/ImpressionDocuments";
import StockFaibleList from "../components/transfert/StockFaibleList";
import DemandesRecuesList from "../components/transfert/DemandesRecuesList";
import LivraisonsAttenteList from "../components/transfert/LivraisonsAttenteList";
import ChatBot from "../components/chatbot/ChatBot";
import PrevisionChart from "../components/prevision/PrevisionChart";  // ← AJOUTÉ

import "../styles/dashboard.css";

const Dashboard_warehouse = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStock, setSelectedStock] = useState(null);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [userName] = useState(localStorage.getItem("nom") || "Utilisateur");
  const [userPrenom] = useState(localStorage.getItem("prenom") || "");
  const [userRole] = useState(localStorage.getItem("role") || "OPERATOR");
  const [userId] = useState(localStorage.getItem("userId") || null);
  const [profileImage, setProfileImage] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // ========== CHARGER LA PHOTO DEPUIS LA BASE DE DONNÉES ==========
  useEffect(() => {
    const loadProfileImageFromBackend = async () => {
      const token = localStorage.getItem('token');
      const userIdFromStorage = localStorage.getItem('userId');
      
      if (!token || !userIdFromStorage) return;
      
      try {
        const response = await fetch(`http://localhost:8080/api/admin/users/${userIdFromStorage}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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

    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    const role = localStorage.getItem("role");
    if (role === "ADMINISTRATEUR") navigate("/admin");
    
    if (role === "TRANSPORTEUR") navigate("/transporteur");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ========== SAUVEGARDER LA PHOTO EN BASE DE DONNÉES ==========
  const saveProfileImageToBackend = async (base64Image) => {
    const token = localStorage.getItem('token');
    const userIdFromStorage = localStorage.getItem('userId');
    
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

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 2 Mo");
        return;
      }
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setProfileImage(base64Image);
        localStorage.setItem("profileImage", base64Image);
        await saveProfileImageToBackend(base64Image);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async () => {
    if (window.confirm('Supprimer votre photo de profil ?')) {
      setProfileImage(null);
      localStorage.removeItem("profileImage");
      await saveProfileImageToBackend(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ========== GESTION DU MOT DE PASSE ==========
  const handleProfileClick = () => setActiveTab("profile");
  
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

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setShowMovementForm(true);
  };

  const handleMovementSuccess = () => {
    setShowMovementForm(false);
    setSelectedStock(null);
    if (activeTab === "stock") window.location.reload();
  };

  // Construction du menu latéral selon le rôle (sans TRANSPORTEUR)
  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "TABLEAU DE BORD", icon: <FaTachometerAlt /> }
    ];

    switch (userRole) {
      case "OPERATEUR_ENTREPOT":
        return [
          ...baseItems,
          
          { id: "reception", label: "RÉCEPTION", icon: <FaBoxes /> },
          { id: "rangement", label: "RANGEMENT", icon: <FaClipboardList /> },
          { id: "preparation", label: "PRÉPARATION DE COMMANDES", icon: <FaClipboardList /> },
          { id: "livraisonsAttente", label: "TRANSFERT ENTRANT", icon: <FaClock /> }
        ];

      case "RESPONSABLE_ENTREPOT":
        return [
          ...baseItems,
          { id: "previsions", label: "PRÉVISIONS 7J", icon: <FaChartLine /> },
          { id: "stock", label: "STOCK", icon: <FaBoxes /> },
          { id: "mouvements", label: "HISTORIQUE MOUVEMENTS", icon: <FaHistory /> },
          { id: "reception", label: "RÉCEPTIONS EN ATTENTE", icon: <FaCheckCircle /> },
          { id: "rangement", label: "SUIVI RANGEMENT", icon: <FaClipboardList /> },
          { id: "expedier", label: "EXPÉDITIONS", icon: <FaTruck /> },
          { id: "documents", label: "IMPRESSION DOCUMENTS", icon: <FaPrint /> },
          { id: "stockFaible", label: "STOCK FAIBLE", icon: <FaExclamationTriangle /> },
          { id: "demandesRecues", label: "DEMANDES REÇUES", icon: <FaInbox /> },
          { id: "livraisonsAttente", label: "TRANSFERT ENTRANT", icon: <FaClock /> }
        ];

      case "SERVICE_COMMERCIAL":
        return [
          ...baseItems,
          
          { id: "commandes", label: "COMMANDES", icon: <FaShoppingCart /> },
          { id: "clients", label: "CLIENTS", icon: <FaBoxOpen /> }
        ];

      case "OPERATOR":
      default:
        return baseItems;
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMINISTRATEUR: "Administrateur",
      RESPONSABLE_ENTREPOT: "Responsable Entrepôt",
      OPERATEUR_ENTREPOT: "Opérateur Entrepôt",
      OPERATOR: "Opérateur (en attente)",
      SERVICE_COMMERCIAL: "Service Commercial"
    };
    return labels[role] || role;
  };

  const getModuleTitle = (tabId) => {
    const titles = {
      articles: "Articles du catalogue",
      preparation: "Préparation de commandes",
      transfert: "Module Transfert",
      reception: "Module Réception",
      rangement: "Gestion du rangement",
      stock: "Consultation des stocks",
      mouvements: "Historique des mouvements",
      expedier: "Expéditions",
      documents: "Impression de documents",
      synchronisation: "Synchronisation ERP",
      commandes: "Gestion des commandes",
      clients: "Gestion des clients",
      stockFaible: "Stocks faibles - Déclarer un besoin",
      demandesRecues: "Demandes de transfert reçues",
      livraisonsAttente: "Livraisons en attente - Codes OTP",
      previsions: "Prévisions de charge - 7 jours"
    };
    return titles[tabId] || tabId;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            <WelcomeWidgets 
              userPrenom={userPrenom}
              userName={userName}
              userRole={userRole}
            />
          </div>
        );

      case "profile":
        return (
          <div className="profile-container">
            <h2>Mon Profil</h2>
            <div className="profile-card">
              <div
                className="profile-avatar"
                onClick={handleImageClick}
                style={{ cursor: "pointer" }}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                ) : (
                  <span className="avatar-initials">
                    {userPrenom?.charAt(0)}{userName?.charAt(0)}
                  </span>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />

              <p className="profile-image-hint">
                Cliquez sur l'avatar pour {profileImage ? "changer" : "ajouter"} une photo
              </p>

              <div className="profile-details">
                <div className="profile-row">
                  <label>Nom complet:</label>
                  <span>{userPrenom} {userName}</span>
                </div>
                <div className="profile-row">
                  <label>Email:</label>
                  <span>{localStorage.getItem("email") || "Non renseigné"}</span>
                </div>
                <div className="profile-row">
                  <label>Rôle:</label>
                  <span className={`role-badge role-${userRole?.toLowerCase()}`}>
                    {getRoleLabel(userRole)}
                  </span>
                </div>
              </div>

              {profileImage && (
                <button onClick={handleDeleteImage} className="delete-photo-btn">
                  🗑️ Supprimer la photo
                </button>
              )}
            </div>
          </div>
        );

      case "password":
        return (
          <div className="password-change-container">
            <h2>Changer le mot de passe</h2>
            <form className="password-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Ancien mot de passe</label>
                <input type="password" className="password-input" />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input type="password" className="password-input" />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input type="password" className="password-input" />
              </div>
              <button type="submit" className="change-password-btn">
                Changer le mot de passe
              </button>
            </form>
          </div>
        );

      case "articles":
        return <ArticleList />;

      case "stock":
        return (
          <div className="stock-page">
            <StockList onStockClick={handleStockClick} />
            {showMovementForm && selectedStock && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <StockMovementForm
                    stock={selectedStock}
                    onSuccess={handleMovementSuccess}
                    onCancel={() => {
                      setShowMovementForm(false);
                      setSelectedStock(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "mouvements":
        return <MouvementHistorique />;

      case "reception":
        return <ReceptionList />;

      case "rangement":
        return <RangementList />;

      case "commandes":
        return <CommandeList />;

      case "clients":
        return <ClientList />;

      case "preparation":
        return <PreparationCommandes />;

      case "expedier":
        return <ExpedierCommandes />;

      case "documents":
        return <ImpressionDocuments />;

      case "stockFaible":
        return <StockFaibleList />;

      case "demandesRecues":
        return <DemandesRecuesList />;

      case "livraisonsAttente":
        return <LivraisonsAttenteList />;

      case "previsions":
        return <PrevisionChart />;

      default:
        return (
          <div className="module-container">
            <h2>{getModuleTitle(activeTab)}</h2>
            <div className="coming-soon">
              <div className="coming-soon-icon">🚧</div>
              <h3>Module en cours de développement</h3>
              <p>Cette fonctionnalité sera disponible prochainement.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <TopNavbar 
        userPrenom={userPrenom}
        userName={userName}
        userRole={getRoleLabel(userRole)}
        profileImage={profileImage}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        onPasswordClick={handlePasswordClick}
      />
      
      <div className="dashboard-layout">
        <Sidebar
          userName={userPrenom}
          userPrenom={userName}
          userRole={getRoleLabel(userRole)}
          menuItems={getMenuItems()}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          profileImage={profileImage}
        />

        <div className="dashboard-main">
          {renderContent()}
        </div>
      </div>

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

      {/* ChatBot */}
      <ChatBot userRole={userRole} userId={localStorage.getItem('userId')} />
    </div>
  );
};

export default Dashboard_warehouse;