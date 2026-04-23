import React from 'react';
import DashboardPhotoItem from './DashboardPhotoItem';

const Sidebar = ({ userName, userPrenom, userRole, menuItems, activeTab, onTabChange, profileImage }) => {
  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        {/* Affichage conditionnel : photo ou titre */}
        {profileImage ? (
          <DashboardPhotoItem
            profileImage={profileImage}
            isActive={activeTab === 'dashboard'}
            onClick={() => onTabChange('dashboard')}
            userPrenom={userPrenom}
            userName={userName}
          />
        ) : (
          <h2>Dashboard</h2>   // ← comportement original pour AdminDashboard
        )}
        <div className="user-info">
          <p className="user-name">{userPrenom} {userName}</p>
          <p className="user-role">{userRole}</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''} ${item.id === 'logout' ? 'logout' : ''}`}
            onClick={() => item.action ? item.action() : onTabChange(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;