import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FiArrowRight, FiPlayCircle, FiPackage } from 'react-icons/fi';
import '../../styles/hero.css';

const HeroSection = () => {
  // Gestion du mouvement de la souris pour l'effet 3D
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xOffset = (event.clientX - rect.left - rect.width / 2) / rect.width;
    const yOffset = (event.clientY - rect.top - rect.height / 2) / rect.height;
    x.set(xOffset);
    y.set(yOffset);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Décalages pour créer la profondeur (Parallaxe)
  const textX = useTransform(x, [-0.5, 0.5], [-20, 20]);
  const textY = useTransform(y, [-0.5, 0.5], [-15, 15]);
  const bgX = useTransform(x, [-0.5, 0.5], [15, -15]);
  const bgY = useTransform(y, [-0.5, 0.5], [10, -10]);

  return (
    <section 
      className="hero-container-3d"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* BACKGROUND SCENE */}
      <motion.div 
        className="hero-bg-wrapper"
        style={{ x: bgX, y: bgY, scale: 1.1 }}
      >
        <div className="hero-image-context"></div>
        <div className="hero-overlay-vignette"></div>
      </motion.div>

      {/* CONTENT LAYER */}
      <div className="hero-content-wrapper">
        <motion.div 
          className="hero-text-side"
          style={{ x: textX, y: textY }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="hero-tag">
            <span className="pulse-dot"></span>
            <FiPackage /> Smart Logistics 2026
          </div>
          
          <h1 className="hero-main-title">
            Your Warehouse <br />
            <span className="highlight-orange">Faster, Smarter.</span>
          </h1>
          
          <p className="hero-description">
            Digitize your logistics operations and improve your supply chain 
            productivity with our enterprise-grade WMS solutions.
          </p>

          <div className="hero-btns">
            <button className="btn-primary-orange">
              Start Transformation <FiArrowRight />
            </button>
            <button className="btn-glass">
              <FiPlayCircle /> View Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;