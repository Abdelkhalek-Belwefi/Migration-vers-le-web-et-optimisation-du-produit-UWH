import React from 'react';
import './styles/GallerySection.css'; // Importation du fichier CSS

const GallerySection = () => {
  return (
    <section className="gallery-container">
      {/* Colonne Gauche : Image */}
      <div className="gallery-image-wrapper">
       <img 
  src="/images/image-chariot.png"
  alt="Opérateur de chariot élévateur" 
  className="main-image"
/>
      </div>

      {/* Colonne Droite : Contenu */}
      <div className="gallery-content">
        <h2 className="gallery-title">
          Logiciel de gestion d’entrepôt et de stock
        </h2>
        
        <p className="gallery-text">
          Une logistique d’entrepôt efficace n’a jamais été aussi facilement accessible : 
          troquez le <span className="highlight">papier contre un appareil portable</span> et 
          concevez dès maintenant vos processus de stockage de manière simple, numérique et flexible. 
          Que vous souhaitiez entamer votre transition numérique avec 
          <span className="highlight"> l'acquisition des données mobiles</span> ou 
          révolutionner des processus logistiques entiers avec un système de guidage de chariot élévateur 
          ou un système de transport autonome, nous sommes le partenaire pour votre 
          <span className="highlight"> entrepôt 4.0</span>.
        </p>

       
      </div>
    </section>
  );
};

export default GallerySection;