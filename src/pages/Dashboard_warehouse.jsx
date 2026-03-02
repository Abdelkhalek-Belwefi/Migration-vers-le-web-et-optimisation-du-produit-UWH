import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/layout/Sidebar";
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
      if (!file.type.startsWith('image/')) {
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

  // Fonction pour obtenir les éléments du menu selon le rôle
  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Tableau de bord", icon: "📊" },
      { id: "profile", label: "Mon Profil", icon: "👤" },
      { id: "password", label: "Changer Mot de Passe", icon: "🔒" },
    ];

    switch(userRole) {
      case 'RECEIVER':
        return [
          ...baseItems,
          { id: "reception", label: "Réception", icon: "📥" },
          { id: "rangement", label: "Rangement", icon: "📦" },
          { id: "logout", label: "Déconnexion", icon: "🚪", action: handleLogout }
        ];
      
      case 'EFFECTOR_TRANSFERT':
        return [
          ...baseItems,
          { id: "picking", label: "Préparation de commandes", icon: "📋" },
          { id: "transfert", label: "Transfert", icon: "🔄" },
          { id: "logout", label: "Déconnexion", icon: "🚪", action: handleLogout }
        ];
      
      case 'RESPONSABLE_ENTREPOT':
        return [
          ...baseItems,
          { id: "stock", label: "Consultation Stock", icon: "📊" },
          { id: "reception", label: "Validation Réception", icon: "✅" },
          { id: "expedition", label: "Validation Expédition", icon: "📤" },
          { id: "documents", label: "Impression Documents", icon: "🖨️" },
          { id: "synchronisation", label: "Synchronisation ERP", icon: "🔄" },
          { id: "logout", label: "Déconnexion", icon: "🚪", action: handleLogout }
        ];
      
      case 'OPERATOR':
      default:
        return [
          ...baseItems,
          { id: "logout", label: "Déconnexion", icon: "🚪", action: handleLogout }
        ];
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'ADMINISTRATEUR': 'Administrateur',
      'RESPONSABLE_ENTREPOT': 'Responsable Entrepôt',
      'RECEIVER': 'Réceptionnaire',
      'EFFECTOR_TRANSFERT': 'Effecteur Transfert',
      'OPERATOR': 'Opérateur'
    };
    return labels[role] || role;
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h1>Bienvenue, {userPrenom} {userName} !</h1>
            </div>

            <div className="description-section">
              <h2>À propos de L-mobile INDUSTRY</h2>
              <div className="description-card">
                <p>
                  L-mobile INDUSTRY: MS Dynamics includes the basic system as well as the individual modules
                  (user modules and functional modules) which are valid exclusively in connection with the MS
                  Dynamics ERP system and the value-added component used for the integration of MS Dynamics
                  and L-mobile.
                </p>
                <p>
                  Licensed functionalities introduced into the MS Dynamics ERP system and, where
                  applicable, individual programming implemented in MS Dynamics may affect the scope and/or
                  context of the functions described. For technical reasons, module names may differ within the
                  application.
                </p>
                <p>
                  The General Availability conditions also apply to this version of L-mobile.
                </p>
                <p className="highlight">
                  Detailed information on the product scope can be found in the current description of services for
                  L-mobile warehouse 2025 ready for MS Dynamics.
                </p>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="profile-container">
            <h2>Mon Profil</h2>
            <div className="profile-card">
              <div className="profile-avatar" onClick={handleImageClick} style={{ cursor: 'pointer' }}>
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
                style={{ display: 'none' }} 
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

      case 'password':
        return (
          <div className="password-change-container">
            <h2>Changer le mot de passe</h2>
            <form className="password-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Ancien mot de passe</label>
                <input type="password" placeholder="Entrez votre ancien mot de passe" className="password-input" />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input type="password" placeholder="Entrez votre nouveau mot de passe" className="password-input" />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input type="password" placeholder="Confirmez votre nouveau mot de passe" className="password-input" />
              </div>
              <button type="submit" className="change-password-btn">
                Changer le mot de passe
              </button>
            </form>
          </div>
        );

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

  const getModuleTitle = (tabId) => {
    const titles = {
      'picking': 'Module Préparation de commandes',
      'transfert': 'Module Transfert',
      'reception': 'Module Réception',
      'rangement': 'Module Rangement',
      'stock': 'Consultation des stocks',
      'expedition': 'Module Expédition',
      'documents': 'Impression de documents',
      'synchronisation': 'Synchronisation ERP'
    };
    return titles[tabId] || tabId;
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