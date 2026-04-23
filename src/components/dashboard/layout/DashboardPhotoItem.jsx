// src/components/dashboard/layout/DashboardPhotoItem.js
import React from 'react';
import { FaTachometerAlt } from 'react-icons/fa';

const DashboardPhotoItem = ({ profileImage, isActive, onClick, userPrenom, userName }) => {
  return (
    <li className={`sidebar-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="dashboard-photo-wrapper">
        {profileImage ? (
          <img 
            src={profileImage} 
            alt="avatar" 
            className="dashboard-photo-img"
            title={`Tableau de bord (${userPrenom} ${userName})`}
          />
        ) : (
          <div className="dashboard-photo-placeholder">
            <FaTachometerAlt />
            <span className="placeholder-text">DB</span>
          </div>
        )}
      </div>
      <span className="sidebar-label" style={{ display: 'none' }}>Tableau de bord</span>
    </li>
  );
};

export default DashboardPhotoItem;