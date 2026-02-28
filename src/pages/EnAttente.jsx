// src/pages/EnAttente.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/en-attente.css';

const EnAttente = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('email');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="attente-container">
      <div className="attente-card">
        <div className="attente-icon">⏳</div>
        <h1>Compte en attente de validation</h1>
        <p>Bonjour <strong>{userEmail}</strong>,</p>
        <p>Votre compte a été créé avec succès mais n'a pas encore été activé par l'administrateur.</p>
        <p>Vous recevrez une notification dès que votre compte sera activé et que votre rôle vous sera attribué.</p>
        <div className="attente-info">
          <p>Si vous avez des questions, contactez l'administrateur.</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default EnAttente;