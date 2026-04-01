import React, { useState } from 'react';
import './styles/ProcessSection.css';
import {
  FiPackage, FiLayers, FiMove, FiTarget, FiTruck,
  FiArrowRight, FiX, FiFileText, FiInfo
} from 'react-icons/fi';

const ProcessSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    {
      id: '01',
      title: 'Receiving',
      icon: FiPackage,
      shortDesc: 'Control and entry of goods into the system.',
      detailedDesc: 'All incoming shipments are verified against purchase orders, quality checked, and logged into the WMS. Barcodes are scanned, and any discrepancies are immediately reported.',
    },
    {
      id: '02',
      title: 'Inventory',
      icon: FiLayers,
      shortDesc: 'Management of stock information and movements.',
      detailedDesc: 'Real‑time tracking of inventory levels, locations, and movements. Cycle counting and automated alerts ensure accuracy and prevent stock‑outs.',
    },
    {
      id: '03',
      title: 'Storing',
      icon: FiMove,
      shortDesc: 'Optimized placement in storage zones.',
      detailedDesc: 'Products are stored in the most efficient locations based on turnover, size, and weight. Dynamic slotting reduces travel time and maximizes space usage.',
    },
    {
      id: '04',
      title: 'Picking',
      icon: FiTarget,
      shortDesc: 'Precise item retrieval for orders.',
      detailedDesc: 'Orders are picked using zone, batch, or wave strategies. Voice picking and RF scanners ensure high accuracy and speed.',
    },
    {
      id: '05',
      title: 'Shipping',
      icon: FiTruck,
      shortDesc: 'Outbound logistics and dispatch.',
      detailedDesc: 'Orders are packed, labeled, and loaded onto carriers. Shipping documents are generated and tracking numbers are sent to customers.',
    },
  ];

  const currentStep = steps[activeStep];

  return (
    <div className="warehouse-page">
      {/* Process Section */}
      <section className="process-section">
        <div className="container">
          <div className="header-block">
            
            <h2>Warehouse Management Process</h2>
          </div>
          <div className="process-flow">
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }} />
            </div>
            <div className="steps-container">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`step-card ${index === activeStep ? 'active' : ''}`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="icon-wrapper">
                      <Icon />
                      <span className="step-number">{step.id}</span>
                    </div>
                    <h3>{step.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="details-zone">
            <div className="details-header">
              <FiInfo className="details-icon" />
              <h3>Detailed Process: {currentStep.title}</h3>
            </div>
            <p className="detailed-description">{currentStep.detailedDesc}</p>
            <div className="details-footer">
              <button className="primary-button small" onClick={() => setIsModalOpen(true)}>
                Learn more <FiArrowRight />
              </button>
            </div>
          </div>
          <div className="cta-row">
            <p>Quick summary: <strong>{currentStep.title}</strong> – {currentStep.shortDesc}</p>
            <button className="primary-button" onClick={() => setIsModalOpen(true)}>
              Packaging information <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setIsModalOpen(false)}><FiX /></button>
            <div className="modal-header">
              <FiPackage className="orange-icon" />
              <h3>Detailed Process: {currentStep.title}</h3>
            </div>
            <div className="modal-body">
              <p><strong>Description:</strong> {currentStep.detailedDesc}</p>
              <ul>
                <li><strong>Key benefits:</strong> Efficiency, accuracy, traceability</li>
                <li><strong>Technology:</strong> WMS, barcode scanning, automation</li>
                <li><strong>KPIs:</strong> Throughput, order accuracy, cycle time</li>
              </ul>
              <div className="pdf-box">
                <FiFileText />
                <a href="/warehouse-process.pdf" target="_blank" rel="noopener noreferrer">Download detailed process PDF</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Section (sans points) */}
      <section className="map-section">
        <div className="container">
          <div className="header-block">
            
            <h2 className="lead-text">L-mobile sites across Europe & North Africa</h2>
          </div>
          <div className="map-container">
            <div className="map-wrapper">
              <img
                src="https://l-mobile.com/wp-content/uploads/2021/06/weltkarte_neu_spanien-2021.jpg"
                alt="Carte L‑mobile"
                className="map-background"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProcessSection;