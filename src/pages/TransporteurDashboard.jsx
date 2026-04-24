import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, FaTruck, FaHistory, FaPlus, 
  FaSearch, FaCheckCircle, FaCircle
} from 'react-icons/fa';
import { MapContainer, TileLayer } from 'react-leaflet';
import { LineChart, Line, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, AreaChart, Area } from 'recharts';
import 'leaflet/dist/leaflet.css';

// Services & Composants
import { getLivraisonsEnCours, getHistoriqueLivraisons } from '../services/transporteurService';
import LivraisonList from '../components/Transporteur/LivraisonList';
import ValidationModal from '../components/Transporteur/ValidationModal';
import LivraisonDetailModal from '../components/Transporteur/LivraisonDetailModal';
import NavbarTransporteur from '../components/Transporteur/NavbarTransporteur';
import '../styles/TransporteurDashboard.css';

const TransporteurDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [livraisons, setLivraisons] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Infos utilisateur depuis localStorage
  const [userName] = useState(localStorage.getItem('nom') || '');
  const [userPrenom] = useState(localStorage.getItem('prenom') || '');
  const [userRole] = useState(localStorage.getItem('role') || 'TRANSPORTEUR');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) setProfileImage(savedImage);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [encours, histo] = await Promise.all([
        getLivraisonsEnCours(),
        getHistoriqueLivraisons()
      ]);
      setLivraisons(encours || []);
      setHistorique(histo || []);
    } catch (error) {
      console.error("Erreur chargement", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenValidation = (livraison) => {
    setSelectedLivraison(livraison);
    setShowValidationModal(true);
  };

  const handleOpenDetail = (livraison) => {
    setSelectedLivraison(livraison);
    setShowDetailModal(true);
  };

  const handleCloseModals = () => {
    setShowValidationModal(false);
    setShowDetailModal(false);
    setSelectedLivraison(null);
  };

  const handleValidationSuccess = () => {
    handleCloseModals();
    loadData();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileClick = () => {
    // Optionnel : gérer la modification du profil
    navigate('/transporteur?tab=profile');
  };

  const handlePasswordClick = () => {
    navigate('/transporteur?tab=password');
  };

  const chartData = [
    { name: 'Lun', value: 30 }, { name: 'Mar', value: 45 },
    { name: 'Mer', value: 35 }, { name: 'Jeu', value: 60 },
    { name: 'Ven', value: 85 }
  ];

  const renderDashboard = () => (
    <div className="transporteur-dashboard-container">
      {/* TOP KPI CARDS */}
      <div className="transporteur-dashboard-stats-grid-top">
        <div className="transporteur-dashboard-stat-box">
          <span className="transporteur-dashboard-label">LIVRAISONS ACTIVES</span>
          <div className="transporteur-dashboard-value-row">
            <span className="transporteur-dashboard-number">{livraisons.length}</span>
            <div className="transporteur-dashboard-icon-badge transporteur-dashboard-icon-badge--blue"><FaTruck /></div>
          </div>
        </div>
        <div className="transporteur-dashboard-stat-box">
          <span className="transporteur-dashboard-label">FLOTTE OPÉRATIONNELLE</span>
          <div className="transporteur-dashboard-value-row">
            <span className="transporteur-dashboard-number">98%</span>
            <div className="transporteur-dashboard-progress-circle">98%</div>
          </div>
        </div>
        <div className="transporteur-dashboard-stat-box">
          <span className="transporteur-dashboard-label">LIVRAISONS AUJOURD'HUI</span>
          <div className="transporteur-dashboard-value-row">
            <span className="transporteur-dashboard-number">{historique.length}</span>
            <div className="transporteur-dashboard-icon-badge transporteur-dashboard-icon-badge--green"><FaCheckCircle /></div>
          </div>
        </div>
        <div className="transporteur-dashboard-stat-box transporteur-dashboard-quick-actions-box">
          <span className="transporteur-dashboard-label">ACTIONS RAPIDES</span>
          <div className="transporteur-dashboard-action-btns">
            <button className="transporteur-dashboard-btn-main"><FaPlus /> Nouvelle</button>
            <button className="transporteur-dashboard-btn-sub"><FaSearch /> Suivre</button>
          </div>
        </div>
      </div>

      {/* CARTE + LISTE DES ENVOIS */}
      <div className="transporteur-dashboard-middle-grid">
        <aside className="transporteur-dashboard-shipments-panel">
          <h3>LIVRAISONS EN COURS</h3>
          <div className="transporteur-dashboard-shipment-scroll-area">
            {livraisons.map((l, idx) => (
              <div key={l.id || idx} className="transporteur-dashboard-shipment-item-card" onClick={() => handleOpenDetail(l)} style={{ cursor: 'pointer' }}>
                <div className="transporteur-dashboard-item-header">
                  <FaTruck className="transporteur-dashboard-truck-icon" />
                  <span>BL n° {l.numeroBL?.slice(-8) || "N/A"}</span>
                </div>
                <div className="transporteur-dashboard-status-pill transporteur-dashboard-status-pill--moving">En cours</div>
                <div className="transporteur-dashboard-item-details">
                  <p><strong>Client :</strong> {l.clientNom}</p>
                  <p><strong>Adresse :</strong> {l.adresseLivraison?.substring(0, 30)}...</p>
                </div>
              </div>
            ))}
            {livraisons.length === 0 && <div className="transporteur-dashboard-empty-msg">Aucune livraison en cours</div>}
          </div>
        </aside>

        <section className="transporteur-dashboard-map-container-panel">
          <div className="transporteur-dashboard-map-header"><h3>SUIVI EN DIRECT</h3></div>
          <div className="transporteur-dashboard-map-frame">
            <MapContainer 
              center={livraisons[0]?.clientLatitude && livraisons[0]?.clientLongitude 
                ? [livraisons[0].clientLatitude, livraisons[0].clientLongitude] 
                : [36.8065, 10.1815]} 
              zoom={12} 
              zoomControl={false} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            </MapContainer>
            <div className="transporteur-dashboard-map-legend-overlay">
              <span><FaCircle className="transporteur-dashboard-dot transporteur-dashboard-dot--blue" /> En mouvement</span>
              <span><FaCircle className="transporteur-dashboard-dot transporteur-dashboard-dot--orange" /> Retardé</span>
            </div>
          </div>
        </section>
      </div>

      {/* GRAPHIQUES STATISTIQUES */}
      <div className="transporteur-dashboard-charts-bottom-grid">
        <div className="transporteur-dashboard-chart-card">
          <h3>EFFICACITÉ HEBDOMADAIRE</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff6b00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{background: '#161b22', border: 'none', borderRadius: '8px'}} />
              <Area type="monotone" dataKey="value" stroke="#ff6b00" strokeWidth={3} fillOpacity={1} fill="url(#colorCurve)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="transporteur-dashboard-chart-card">
          <h3>CONSOMMATION CARBURANT</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <Bar dataKey="value" fill="#ff6b00" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="transporteur-dashboard-root transporteur-dashboard-dark-theme-active">
      <NavbarTransporteur 
        userPrenom={userPrenom}
        userName={userName}
        userRole={userRole}
        profileImage={profileImage}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        onPasswordClick={handlePasswordClick}
      />
      <div className="transporteur-dashboard-layout">
        <aside className="transporteur-dashboard-sidebar">
          <div className="transporteur-dashboard-sidebar-brand">WARE<span>HOUSE</span></div>
          <button className={`transporteur-dashboard-nav-link ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}>
            <FaTachometerAlt /> Tableau de bord
          </button>
          <button className={`transporteur-dashboard-nav-link ${activeMenu === 'livraisons' ? 'active' : ''}`} onClick={() => setActiveMenu('livraisons')}>
            <FaTruck /> Mes livraisons
          </button>
          <button className={`transporteur-dashboard-nav-link ${activeMenu === 'historique' ? 'active' : ''}`} onClick={() => setActiveMenu('historique')}>
            <FaHistory /> Historique
          </button>
        </aside>

        <main className="transporteur-dashboard-main-content">
          {loading ? (
            <div className="transporteur-dashboard-loader-container">Synchronisation en cours...</div>
          ) : (
            <>
              {activeMenu === 'dashboard' && renderDashboard()}
              {(activeMenu === 'livraisons' || activeMenu === 'historique') && (
                <div className="transporteur-dashboard-full-width-card">
                  <LivraisonList 
                    livraisons={activeMenu === 'livraisons' ? livraisons : historique}
                    onValider={handleOpenValidation}
                    onRowClick={handleOpenDetail}
                    readonly={activeMenu === 'historique'}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALES */}
      {showValidationModal && selectedLivraison && (
        <ValidationModal
          livraison={selectedLivraison}
          onClose={handleCloseModals}
          onSuccess={handleValidationSuccess}
        />
      )}

      {showDetailModal && selectedLivraison && (
        <LivraisonDetailModal
          livraison={selectedLivraison}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default TransporteurDashboard;