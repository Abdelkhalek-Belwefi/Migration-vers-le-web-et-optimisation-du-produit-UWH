import React from 'react';
import { motion } from 'framer-motion';
import { FiSmartphone, FiDatabase, FiActivity } from 'react-icons/fi';
import './styles/GallerySection.css';

const GallerySection = () => {
  return (
    <section className="gallery-container-premium">
      <div className="container-inner">
        {/* Colonne Gauche : Image avec décorations */}
        <motion.div 
          className="gallery-image-side"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="image-frame">
            <div className="decorative-blob"></div>
            <img 
              src="/images/image-chariot.png"
              alt="Logistique Entrepôt 4.0" 
              className="main-image-pro"
            />
            {/* Petit widget flottant pour le look SaaS */}
            <div className="floating-badge">
              <FiActivity className="pulse-icon" />
              <span>Real-time Tracking Active</span>
            </div>
          </div>
        </motion.div>

        {/* Colonne Droite : Contenu Typographique */}
        <motion.div 
          className="gallery-content-side"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <span className="section-tag">Digital Transformation</span>
          <h2 className="gallery-title-pro">
            Logiciel de gestion d’entrepôt <span>et de stock</span>
          </h2>
          
          <p className="gallery-description">
            Une logistique d’entrepôt efficace n’a jamais été aussi facilement accessible. 
            Concevez dès maintenant vos processus de stockage de manière <strong>simple, numérique et flexible</strong>.
          </p>

          <div className="features-mini-grid">
            <div className="mini-feature">
              <div className="mini-icon"><FiSmartphone /></div>
              <div>
                <h4>Zéro Papier</h4>
                <p>Transition vers des terminaux mobiles intuitifs.</p>
              </div>
            </div>
            <div className="mini-feature">
              <div className="mini-icon"><FiDatabase /></div>
              <div>
                <h4>Entrepôt 4.0</h4>
                <p>Acquisition de données en temps réel.</p>
              </div>
            </div>
          </div>

          <button className="primary-cta-premium">
            Découvrir la solution <FiActivity />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default GallerySection;