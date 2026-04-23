import React, { useState, useEffect } from 'react';
import { 
  FaTachometerAlt, FaTruck, FaHistory, FaMapMarkerAlt, 
  FaRoad, FaWeightHanging, FaCube, FaRuler 
} from 'react-icons/fa';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getLivraisonsEnCours, getHistoriqueLivraisons } from '../services/transporteurService';
import LivraisonList from '../components/Transporteur/LivraisonList';
import ValidationModal from '../components/Transporteur/ValidationModal';
import TopNavbar from '../components/dashboard/layout/TopNavbar';
import '../styles/TransporteurDashboard.css';

const vanImage = "/images/volkswagen-transporter.png";

const TransporteurDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [livraisons, setLivraisons] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName] = useState(localStorage.getItem('prenom') || 'Transporteur');

  useEffect(() => {
    loadData();
  }, [activeMenu]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [encours, histo] = await Promise.all([
        getLivraisonsEnCours(),
        getHistoriqueLivraisons()
      ]);
      setLivraisons(encours);
      setHistorique(histo);
    } catch (error) {
      console.error("Erreur chargement", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = (livraison) => {
    setSelectedLivraison(livraison);
    setShowModal(true);
  };

  const handleValidationSuccess = () => {
    setShowModal(false);
    loadData();
  };

  const currentDelivery = livraisons.find(l => l.statut !== 'LIVREE') || livraisons[0];

  const driverStats = {
    categories: [
      { name: 'En route', percent: 45, color: '#3b82f6' },
      { name: 'Chargement', percent: 30, color: '#10b981' },
      { name: 'Attente', percent: 15, color: '#f59e0b' }
    ]
  };

  const renderDashboard = () => (
    <div className="dashboard-grid-premium">
      {/* CARD VEHICULE */}
      <div className="premium-card td-vehicle-card-ultra">
        <div className="vehicle-info-block">
          <span className="status-indicator" style={{background: '#eff6ff', color: '#3b82f6'}}>VÉHICULE ASSIGNÉ</span>
          <h2>Volkswagen Transporter</h2>
          <div className="specs-row">
            <div className="spec-pill"><FaWeightHanging /> 2,885 lbs</div>
            <div className="spec-pill"><FaCube /> 353,937 in³</div>
            <div className="spec-pill"><FaRuler /> 117 in</div>
          </div>
        </div>
        <img src={vanImage} alt="Van" style={{ width: '220px', zIndex: 2 }} />
      </div>

      {/* MISSION EN COURS */}
      <div className="premium-card route-section-ultra">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Mission Actuelle</h3>
          <span className="status-indicator" style={{background: '#dcfce7', color: '#166534'}}>EN COURS</span>
        </div>

        <div className="address-flow">
          <div className="flow-point">
            <div className="point-dot start"></div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--lp-text-slate)', fontWeight: 700 }}>DÉPART</p>
              <p style={{ fontWeight: 600 }}>{currentDelivery?.adresseDepart || 'Entrepôt L-Mobile'}</p>
            </div>
          </div>
          <div className="flow-line"></div>
          <div className="flow-point">
            <div className="point-dot end"></div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--lp-text-slate)', fontWeight: 700 }}>LIVRAISON</p>
              <p style={{ fontWeight: 600 }}>{currentDelivery?.adresseLivraison || 'Destination client'}</p>
            </div>
          </div>
        </div>

        <div style={{ height: '220px', borderRadius: '20px', overflow: 'hidden' }}>
          <MapContainer center={[36.8065, 10.1815]} zoom={12} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          </MapContainer>
        </div>
      </div>

      {/* STATS SIDEBAR */}
      <div className="stats-sidebar-ultra">
        <div className="premium-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Efficacité</h3>
          <div className="circle-chart-container">
            <svg viewBox="0 0 36 36" style={{ width: '100%' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--lp-primary)" strokeWidth="3" strokeDasharray="85, 100" strokeLinecap="round" />
            </svg>
            <div className="circle-value">85%</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--lp-text-slate)' }}>Excellent travail, {userName} !</p>
        </div>

        <div className="premium-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Activité du jour</h3>
          {driverStats.categories.map(cat => (
            <div key={cat.name} className="progress-group">
              <div className="progress-label">
                <span>{cat.name}</span>
                <span>{cat.percent}%</span>
              </div>
              <div className="progress-bar-bg">
                <div style={{ background: cat.color, width: `${cat.percent}%`, height: '100%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="td-transporteur-dashboard">
      <TopNavbar /> 
      <div className="td-dashboard-layout">
        <aside className="td-dashboard-sidebar">
          <button className={`td-nav-item ${activeMenu === 'dashboard' ? 'td-active' : ''}`} onClick={() => setActiveMenu('dashboard')}>
            <FaTachometerAlt /> Tableau de bord
          </button>
          <button className={`td-nav-item ${activeMenu === 'livraisons' ? 'td-active' : ''}`} onClick={() => setActiveMenu('livraisons')}>
            <FaTruck /> Mes livraisons
          </button>
          <button className={`td-nav-item ${activeMenu === 'historique' ? 'td-active' : ''}`} onClick={() => setActiveMenu('historique')}>
            <FaHistory /> Historique
          </button>
        </aside>

        <main className="td-dashboard-main">
          {loading ? (
            <div className="td-loader">Chargement des données...</div>
          ) : (
            <>
              {activeMenu === 'dashboard' && renderDashboard()}
              {activeMenu === 'livraisons' && (
                <div className="premium-card">
                  <h3 style={{marginBottom: '20px'}}>📦 Livraisons à effectuer</h3>
                  <LivraisonList livraisons={livraisons} onValider={handleValider} readonly={false} />
                </div>
              )}
              {activeMenu === 'historique' && (
                <div className="premium-card">
                  <h3 style={{marginBottom: '20px'}}>✅ Livraisons terminées</h3>
                  <LivraisonList livraisons={historique} onValider={() => {}} readonly={true} />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showModal && (
        <ValidationModal 
          livraison={selectedLivraison} 
          onClose={() => setShowModal(false)} 
          onSuccess={handleValidationSuccess} 
        />
      )}
    </div>
  );
};

export default TransporteurDashboard;