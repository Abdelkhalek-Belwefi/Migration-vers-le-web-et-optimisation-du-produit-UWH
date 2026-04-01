import React from 'react';
import './styles/FeaturesSection.css';

const FeaturesSection = () => {
  return (
    <footer className="footer-main">
      <div className="footer-container">
        
        {/* Colonne 1 : Logo & Description */}
        <div className="footer-col brand-info">
          <div className="footer-logo">
            <img src="images/logo.png" alt="L-Mobile Logo" />
          </div>
          <p className="description">
            L-Mobile est un leader des solutions logicielles mobiles pour l'industrie et la logistique. 
            Nous nous spécialisons dans la numérisation des processus métier pour offrir 
            une efficacité maximale à nos clients, désormais présents en Tunisie.
          </p>
          <div className="emergency-contact">
            <span className="phone-icon">📞</span>
            <div className="phone-details">
              <span className="label">CONTACTEZ-NOUS 24/7</span>
              {/* Numéros de téléphone format Tunisie */}
              <span className="number">+216 72 000 000</span>
              <span className="number">+216 20 000 000</span>
            </div>
          </div>
        </div>

        {/* Colonne 2 : Liens Utiles */}
        <div className="footer-col">
          <h3 className="col-title">Liens Utiles</h3>
          <ul className="footer-list">
            <li><a href="#mission">Mission & Vision</a></li>
            <li><a href="#pourquoi">Pourquoi nous choisir</a></li>
            {/* Ajout du lien LinkedIn ici pour plus de visibilité */}
            <li>
              <a href="https://www.linkedin.com/company/l-mobile/" target="_blank" rel="noreferrer" className="linkedin-link">
                <span>🔗</span> LinkedIn L-mobile
              </a>
            </li>
          </ul>
        </div>

        {/* Colonne 3 : Solutions & Contact Tunisie */}
        <div className="footer-col">
          <h3 className="col-title">Solutions</h3>
          <ul className="contact-list">
            <li><span>📞</span> +216 72 123 456</li>
            <li><span>✉️</span> info.tn@l-mobile.com</li>
            <li><span>✉️</span> support@l-mobile.com</li>
            <li><span>📍</span> Avenue Habib Bourguiba, 8000 Nabeul, Tunisie</li>
          </ul>
        </div>

        {/* Colonne 4 : Instagram Grid */}
        <div className="footer-col">
          <h3 className="col-title">Instagram</h3>
          <div className="insta-grid">
            <div className="grid-item"></div>
            <div className="grid-item"></div>
            <div className="grid-item"></div>
            <div className="grid-item"></div>
            <div className="grid-item"></div>
            <div className="grid-item"></div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default FeaturesSection;