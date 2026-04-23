import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage, FiLayers, FiMove, FiTarget, FiTruck,
  FiArrowRight, FiX, FiFileText, FiInfo, FiCheckCircle
} from 'react-icons/fi';
import './styles/ProcessSection.css';

const ProcessSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    { id: '01', title: 'Receiving', icon: FiPackage, shortDesc: 'Control and entry of goods.', detailedDesc: 'All incoming shipments are verified against purchase orders, quality checked, and logged into the WMS. Barcodes are scanned, and any discrepancies are immediately reported.' },
    { id: '02', title: 'Inventory', icon: FiLayers, shortDesc: 'Stock information management.', detailedDesc: 'Real‑time tracking of inventory levels, locations, and movements. Cycle counting and automated alerts ensure accuracy and prevent stock‑outs.' },
    { id: '03', title: 'Storing', icon: FiMove, shortDesc: 'Optimized placement.', detailedDesc: 'Products are stored in the most efficient locations based on turnover, size, and weight. Dynamic slotting reduces travel time and maximizes space usage.' },
    { id: '04', title: 'Picking', icon: FiTarget, shortDesc: 'Precise item retrieval.', detailedDesc: 'Orders are picked using zone, batch, or wave strategies. Voice picking and RF scanners ensure high accuracy and speed.' },
    { id: '05', title: 'Shipping', icon: FiTruck, shortDesc: 'Outbound logistics.', detailedDesc: 'Orders are packed, labeled, and loaded onto carriers. Shipping documents are generated and tracking numbers are sent to customers.' },
  ];

  const currentStep = steps[activeStep];

  return (
    <div className="warehouse-page">
      <section className="process-section">
        <div className="container">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="header-block"
          >
            <span className="badge-premium">Operations Workflow</span>
            <h2>Warehouse Management Process</h2>
            <p className="lead-text">Streamline your supply chain with our end-to-end digital logistics ecosystem.</p>
          </motion.div>

          {/* Stepper Center */}
          <div className="process-flow-wrapper">
            <div className="progress-line-bg">
              <motion.div 
                className="progress-line-fill" 
                initial={{ width: 0 }}
                animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
            
            <div className="steps-grid">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                return (
                  <div
                    key={step.id}
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="icon-container">
                      <div className="icon-box">
                        {isCompleted ? <FiCheckCircle /> : <Icon />}
                      </div>
                      <div className="dot-marker" />
                    </div>
                    <div className="step-info">
                      <span className="step-number">{step.id}</span>
                      <h3>{step.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Card */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStep}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="details-card-premium"
            >
              <div className="details-content">
                <div className="details-text">
                  <div className="info-tag"><FiInfo /> Step Analysis</div>
                  <h3>{currentStep.title} Phase</h3>
                  <p>{currentStep.detailedDesc}</p>
                </div>
                <button className="glass-cta" onClick={() => setIsModalOpen(true)}>
                  Explore Documentation <FiArrowRight />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="bottom-summary">
            <div className="summary-pill">
              <span className="pulse"></span>
              <p>Current Status: <strong>{currentStep.title}</strong> — {currentStep.shortDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal logic stays identical but with improved CSS classes below */}
    </div>
  );
};

export default ProcessSection;