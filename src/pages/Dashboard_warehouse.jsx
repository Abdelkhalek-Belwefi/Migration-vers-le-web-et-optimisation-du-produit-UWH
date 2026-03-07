import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FaTachometerAlt, 
    FaUser, 
    FaLock, 
    FaBoxOpen,
    FaBoxes,
    FaClipboardList,
    FaExchangeAlt,
    FaCheckCircle,
    FaTruck,
    FaPrint,
    FaSync,
    FaSignOutAlt
} from 'react-icons/fa';
import Sidebar from "../components/dashboard/layout/Sidebar";
import ArticleList from "../components/articles/ArticleList";
import StockList from "../components/stock/StockList"; // ✅ IMPORT AJOUTÉ
import "../styles/dashboard.css";

const Dashboard_warehouse = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userName] = useState(localStorage.getItem("nom") || "Utilisateur");
  const [userPrenom] = useState(localStorage.getItem("prenom") || "");
  const [userRole] = useState(localStorage.getItem("role") || "OPERATOR");
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }

    const role = localStorage.getItem("role");
    if (role === "ADMINISTRATEUR") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

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
        const imageDataUrl = reader.result;
        setProfileImage(imageDataUrl);
        localStorage.setItem("profileImage", imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
    localStorage.removeItem("profileImage");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Tableau de bord", icon: <FaTachometerAlt /> },
      { id: "profile", label: "Mon Profil", icon: <FaUser /> },
      { id: "password", label: "Changer Mot de Passe", icon: <FaLock /> },
    ];

    switch (userRole) {
      case "OPERATEUR_ENTREPOT":
        return [
          ...baseItems,
          { id: "reception", label: "Réception", icon: <FaBoxes /> },
          { id: "rangement", label: "Rangement", icon: <FaClipboardList /> },
          { id: "picking", label: "Préparation de commandes", icon: <FaClipboardList /> },
          { id: "transfert", label: "Transfert", icon: <FaExchangeAlt /> },
          { id: "logout", label: "Déconnexion", icon: <FaSignOutAlt />, action: handleLogout }
        ];

      case "RESPONSABLE_ENTREPOT":
        return [
          ...baseItems,
          
          { id: "stock", label: "Consultation Stock", icon: <FaBoxes /> },
          { id: "reception", label: "Validation Réception", icon: <FaCheckCircle /> },
          { id: "expedition", label: "Validation Expédition", icon: <FaTruck /> },
          { id: "documents", label: "Impression Documents", icon: <FaPrint /> },
          { id: "synchronisation", label: "Synchronisation ERP", icon: <FaSync /> },
          { id: "logout", label: "Déconnexion", icon: <FaSignOutAlt />, action: handleLogout }
        ];

      case "OPERATOR":
      default:
        return [
          ...baseItems,
          { id: "logout", label: "Déconnexion", icon: <FaSignOutAlt />, action: handleLogout }
        ];
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMINISTRATEUR: "Administrateur",
      RESPONSABLE_ENTREPOT: "Responsable Entrepôt",
      OPERATEUR_ENTREPOT: "Opérateur Entrepôt",
      OPERATOR: "Opérateur (en attente)",
    };
    return labels[role] || role;
  };

  const getModuleTitle = (tabId) => {
    const titles = {
      articles: "Articles du catalogue",
      picking: "Module Préparation de commandes",
      transfert: "Module Transfert",
      reception: "Module Réception",
      rangement: "Module Rangement",
      stock: "Consultation des stocks",
      expedition: "Module Expédition",
      documents: "Impression de documents",
      synchronisation: "Synchronisation ERP",
    };
    return titles[tabId] || tabId;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h1>Bienvenue, {userPrenom} {userName} !</h1>
            </div>
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
        return <StockList />;

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
  );
};

export default Dashboard_warehouse;