import React from 'react';

const Sidebar = ({ userName, userPrenom, userRole, menuItems, activeTab, onTabChange }) => {
  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <h2>PFE Dashboard</h2>
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