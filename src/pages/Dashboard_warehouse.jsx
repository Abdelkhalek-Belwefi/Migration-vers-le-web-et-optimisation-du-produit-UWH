// pages/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/dashboard/layout/Sidebar";
import QuickActionsGrid from "../components/dashboard/QuickActionsGrid";
import AdminDashboard from "./AdminDashboard"; // Nouveau composant
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userName] = useState(localStorage.getItem("nom") || "Utilisateur");
  const [userPrenom] = useState(localStorage.getItem("prenom") || "");
  const [userRole] = useState(localStorage.getItem("role") || "USER");
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

  // Menu items adaptés selon le rôle
  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Tableau de bord", icon: "📊" },
      { id: "profile", label: "Mon Profil", icon: "👤" },
      { id: "password", label: "Changer Mot de Passe", icon: "🔒" },
    ];

    // Ajouter les items admin si l'utilisateur est ADMIN
    if (userRole === "ADMIN") {
      baseItems.push(
        { id: "users", label: "Gestion Utilisateurs", icon: "👥" },
        { id: "roles", label: "Gestion Rôles", icon: "🔑" },
        { id: "logs", label: "Journal d'activité", icon: "📝" }
      );
    }

    // Ajouter la déconnexion
    baseItems.push({ id: "logout", label: "Déconnexion", icon: "🚪", action: handleLogout });

    return baseItems;
  };

  // Actions du stock (accessibles à tous)
  const stockActions = [
    { id: 1, label: "Sales order pick", icon: "📦", color: "#4361ee", bgColor: "#eef2ff" },
    { id: 2, label: "Goods receipt", icon: "📥", color: "#f72585", bgColor: "#ffe0f0" },
    { id: 3, label: "Relocation", icon: "🔄", color: "#4cc9f0", bgColor: "#e0f7fa" },
    { id: 4, label: "Stock taking", icon: "📋", color: "#f8961e", bgColor: "#fff3e0" },
    { id: 5, label: "Batch relocation", icon: "📦➡️", color: "#9c89b8", bgColor: "#f3e8ff" },
    { id: 6, label: "Stock correction", icon: "✏️", color: "#ef476f", bgColor: "#ffe5e5" },
    { id: 7, label: "Batch storage", icon: "🏢", color: "#06d6a0", bgColor: "#e0f2e9" },
    { id: 8, label: "Prod. Put", icon: "⚙️", color: "#118ab2", bgColor: "#e0f2fe" }
  ];

  // Si l'utilisateur est admin et que l'onglet actif est un onglet admin, afficher le contenu admin
  if (userRole === "ADMIN" && ["users", "roles", "logs"].includes(activeTab)) {
    return (
      <AdminDashboard 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={userName}
        userPrenom={userPrenom}
        userRole={userRole}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <div className="dashboard">
      <Sidebar 
        userName={userName}
        userPrenom={userPrenom}
        userRole={userRole}
        menuItems={getMenuItems()}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="dashboard-main">
        {activeTab === "dashboard" && (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h1>Bienvenue, {userPrenom} {userName} !</h1>
              <p>WAREHOUSE - Rôle: {userRole}</p>
            </div>

            <div className="stock-info-section">
              <h2>Nos activités</h2>
              <QuickActionsGrid actions={stockActions} />
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-container">
            <h2>Mon Profil</h2>
            <div className="profile-card">
              <div 
                className="profile-avatar" 
                onClick={handleImageClick}
                style={{ cursor: 'pointer' }}
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="profile-image"
                  />
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
                    {userRole}
                  </span>
                </div>
              </div>

              {profileImage && (
                <button 
                  onClick={handleDeleteImage}
                  className="delete-photo-btn"
                >
                  🗑️ Supprimer la photo
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="password-change-container">
            <h2>Changer le mot de passe</h2>
            <form className="password-form">
              <div className="form-group">
                <label>Ancien mot de passe</label>
                <input 
                  type="password" 
                  placeholder="Entrez votre ancien mot de passe"
                  className="password-input"
                />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input 
                  type="password" 
                  placeholder="Entrez votre nouveau mot de passe"
                  className="password-input"
                />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  placeholder="Confirmez votre nouveau mot de passe"
                  className="password-input"
                />
              </div>
              <button type="submit" className="change-password-btn">
                Changer le mot de passe
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;