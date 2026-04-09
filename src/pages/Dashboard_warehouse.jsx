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
    FaShoppingCart  // ← icône pour le rôle commercial
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

// ========== MODULES COMMERCIAUX ==========
import ClientList from "../components/commercial/ClientList";
import CommandeList from "../components/commercial/CommandeList";

// ========== MODULE PRÉPARATION DE COMMANDES (picking) ==========
import PreparationCommandes from "../components/entrepot/PreparationCommandes";

// ========== MODULE EXPÉDITION (shipping) ==========
import ExpedierCommandes from "../components/expedition/ExpedierCommandes";

// ========== AJOUT : MODULE IMPRESSION DOCUMENTS ==========
import ImpressionDocuments from "../components/expedition/ImpressionDocuments";

import "../styles/dashboard.css";

const Dashboard_warehouse = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStock, setSelectedStock] = useState(null);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [userName] = useState(localStorage.getItem("nom") || "Utilisateur");
  const [userPrenom] = useState(localStorage.getItem("prenom") || "");
  const [userRole] = useState(localStorage.getItem("role") || "OPERATOR");
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) setProfileImage(savedImage);

    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    const role = localStorage.getItem("role");
    if (role === "ADMINISTRATEUR") navigate("/admin");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
    localStorage.removeItem("profileImage");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProfileClick = () => setActiveTab("profile");
  const handlePasswordClick = () => setActiveTab("password");

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setShowMovementForm(true);
  };

  const handleMovementSuccess = () => {
    setShowMovementForm(false);
    setSelectedStock(null);
    if (activeTab === "stock") window.location.reload();
  };

  // Construction du menu latéral selon le rôle
  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Tableau de bord", icon: <FaTachometerAlt /> }
    ];

    switch (userRole) {
      case "OPERATEUR_ENTREPOT":
        return [
          ...baseItems,
          { id: "reception", label: "Réception", icon: <FaBoxes /> },
          { id: "rangement", label: "Rangement", icon: <FaClipboardList /> },
          { id: "preparation", label: "Préparation de commandes", icon: <FaClipboardList /> },  // ← picking
          { id: "transfert", label: "Transfert", icon: <FaExchangeAlt /> }
        ];

      case "RESPONSABLE_ENTREPOT":
        return [
          ...baseItems,
          { id: "stock", label: "Consultation Stock", icon: <FaBoxes /> },
          { id: "mouvements", label: "Historique mouvements", icon: <FaHistory /> },
          { id: "reception", label: "Validation Réception", icon: <FaCheckCircle /> },
          { id: "rangement", label: "Suivi Rangement", icon: <FaClipboardList /> },
          { id: "expedier", label: "Expéditions", icon: <FaTruck /> },               // ← shipping
          { id: "documents", label: "Impression Documents", icon: <FaPrint /> },
          { id: "synchronisation", label: "Synchronisation ERP", icon: <FaSync /> }
        ];

      case "SERVICE_COMMERCIAL":
        return [
          ...baseItems,
          { id: "commandes", label: "Commandes", icon: <FaShoppingCart /> },
          { id: "clients", label: "Clients", icon: <FaBoxOpen /> }
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
      SERVICE_COMMERCIAL: "Service Commercial"   // ← ajout
    };
    return labels[role] || role;
  };

  const getModuleTitle = (tabId) => {
    const titles = {
      articles: "Articles du catalogue",
      preparation: "Préparation de commandes",   // ← picking
      transfert: "Module Transfert",
      reception: "Module Réception",
      rangement: "Gestion du rangement",
      stock: "Consultation des stocks",
      mouvements: "Historique des mouvements",
      expedier: "Expéditions",                  // ← shipping
      documents: "Impression de documents",
      synchronisation: "Synchronisation ERP",
      commandes: "Gestion des commandes",
      clients: "Gestion des clients"
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

      // ========== MODULES COMMERCIAUX ==========
      case "commandes":
        return <CommandeList />;

      case "clients":
        return <ClientList />;

      // ========== MODULE PRÉPARATION DE COMMANDES ==========
      case "preparation":
        return <PreparationCommandes />;

      // ========== MODULE EXPÉDITION ==========
      case "expedier":
        return <ExpedierCommandes />;

      // ========== AJOUT : IMPRESSION DOCUMENTS ==========
      case "documents":
        return <ImpressionDocuments />;

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
        />

        <div className="dashboard-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard_warehouse;