import React from 'react';
import { FiPhone, FiMail, FiMapPin, FiLinkedin, FiInstagram, FiArrowRight } from 'react-icons/fi';
import './styles/FeaturesSection.css';

const FeaturesSection = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-top-wave"></div>
      
      <div className="footer-main-container">
        <div className="footer-grid">
          
          {/* Brand Identity */}
          <div className="footer-brand">
            <img src="images/logo.png" alt="L-Mobile" className="footer-logo-img" />
            <p className="footer-tagline">
              Leader des solutions logicielles mobiles pour l'industrie 4.0. 
              Nous transformons vos flux logistiques en avantages compétitifs.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon"><FiLinkedin /></a>
              <a href="#" className="social-icon"><FiInstagram /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-group">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-nav">
              <li><a href="#mission">Mission & Vision</a></li>
              <li><a href="#pourquoi">Pourquoi nous choisir</a></li>
              <li><a href="#solutions">Nos Solutions</a></li>
            </ul>
          </div>

          {/* Contact Tunisia */}
          <div className="footer-contact-group">
            <h4 className="footer-heading">L-mobile Tunisie</h4>
            <div className="contact-item">
              <FiPhone className="c-icon" />
              <div>
                <p>+216 72 123 456</p>
                <p className="sub-contact">Support: +216 20 000 000</p>
              </div>
            </div>
            <div className="contact-item">
              <FiMail className="c-icon" />
              <p>info.tn@l-mobile.com</p>
            </div>
            <div className="contact-item">
              <FiMapPin className="c-icon" />
              <p>Ave. Habib Bourguiba, Nabeul</p>
            </div>
          </div>

          {/* Emergency Support */}
          <div className="footer-emergency">
            <div className="emergency-card">
              <span className="emergency-label">Besoin d'aide ?</span>
              <h3 className="emergency-title">Support 24/7 Disponible</h3>
              <p>Nos experts sont à votre écoute pour toute urgence technique.</p>
              <button className="emergency-btn">
                Nous Contacter <FiArrowRight />
              </button>
            </div>
          </div>

        </div>

        <div className="footer-bottom-bar">
          <div className="copyright">
            © 2026 <strong>L-mobile Group</strong>. All rights reserved.
          </div>
          <div className="footer-legal-links">
            <a href="#">Confidentialité</a>
            <span className="separator"></span>
            <a href="#">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FeaturesSection;