// pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/layout/Sidebar";
import UserManagement from "../components/dashboard/admin/UserManagement";
import RoleManagement from "../components/dashboard/admin/RoleManagement";
import ActivityLog from "../components/dashboard/admin/ActivityLog";
import "../styles/admin-dashboard.css";

const AdminDashboard = ({ activeTab, setActiveTab, userName, userPrenom, userRole, handleLogout }) => {
  const adminMenuItems = [
    { id: "users", label: "Gestion Utilisateurs", icon: "👥" },
    { id: "roles", label: "Gestion Rôles", icon: "🔑" },
    { id: "logs", label: "Journal d'activité", icon: "📝" },
    { id: "stats", label: "Statistiques", icon: "📊" },
    { id: "back", label: "Retour au Dashboard", icon: "⬅️", action: () => setActiveTab("dashboard") },
    { id: "logout", label: "Déconnexion", icon: "🚪", action: handleLogout }
  ];

  return (
    <div className="admin-dashboard">
      <Sidebar 
        userName={userName}
        userPrenom={userPrenom}
        userRole={userRole}
        menuItems={adminMenuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="admin-main">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "roles" && <RoleManagement />}
        {activeTab === "logs" && <ActivityLog />}
        {activeTab === "stats" && (
          <div className="stats-container">
            <h2>Statistiques</h2>
            {/* Ajouter les statistiques ici */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;