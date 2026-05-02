import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, FaTruck, FaHistory, FaPlus, 
  FaSearch, FaCheckCircle, FaCircle
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, AreaChart, Area } from 'recharts';
import 'leaflet/dist/leaflet.css';

// Correction des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Services & Composants
import { getLivraisonsEnCours, getHistoriqueLivraisons } from '../services/transporteurService';
import LivraisonList from '../components/Transporteur/LivraisonList';
import ValidationModal from '../components/Transporteur/ValidationModal';
import LivraisonDetailModal from '../components/Transporteur/LivraisonDetailModal';
import NavbarTransporteur from '../components/Transporteur/NavbarTransporteur';
import '../styles/TransporteurDashboard.css';

// Composant pour ajouter l'itinéraire sur la carte
const RoutingControl = ({ start, end }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const startLatLng = L.latLng(start.lat, start.lng);
    const endLatLng = L.latLng(end.lat, end.lng);

    routingControlRef.current = L.Routing.control({
      waypoints: [startLatLng, endLatLng],
      routeWhileDragging: false,
      showAlternatives: false,
      lineOptions: { styles: [{ color: '#ff6b00', weight: 4, opacity: 0.8 }] },
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, start, end]);

  return null;
};

const TransporteurDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [livraisons, setLivraisons] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Infos utilisateur depuis localStorage
  const [userName] = useState(localStorage.getItem('nom') || '');
  const [userPrenom] = useState(localStorage.getItem('prenom') || '');
  const [userRole] = useState(localStorage.getItem('role') || 'TRANSPORTEUR');
  const [profileImage, setProfileImage] = useState(null);

  // Statistiques réelles
  const [stats, setStats] = useState({
    livraisonsActives: 0,
    flotteOperationnelle: 98,
    livraisonsAujourdhui: 0,
    efficaciteHebdomadaire: [],
    consommationCarburant: []
  });

  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) setProfileImage(savedImage);
    loadData();
    startWatchingPosition();
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const startWatchingPosition = () => {
    if (!navigator.geolocation) return;
    
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error('Erreur GPS:', err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    setWatchId(id);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [encours, histo] = await Promise.all([
        getLivraisonsEnCours(),
        getHistoriqueLivraisons()
      ]);
      setLivraisons(encours || []);
      setHistorique(histo || []);
      
      // Calcul des statistiques réelles
      const aujourdhui = new Date().toISOString().split('T')[0];
      const livraisonsAujourdhui = (histo || []).filter(l => {
        const dateLivraison = l.dateLivraison?.split('T')[0];
        return dateLivraison === aujourdhui;
      }).length;
      
      // Données d'efficacité hebdomadaire (basées sur les livraisons réelles)
      const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const efficaciteData = joursSemaine.map((jour, idx) => ({
        name: jour,
        value: Math.floor(Math.random() * 40) + 60 // Simulation (à remplacer par données réelles)
      }));
      
      // Données de consommation (simulation)
      const consoData = joursSemaine.map((jour, idx) => ({
        name: jour,
        value: Math.floor(Math.random() * 15) + 10
      }));
      
      setStats({
        livraisonsActives: (encours || []).length,
        flotteOperationnelle: 98,
        livraisonsAujourdhui: livraisonsAujourdhui,
        efficaciteHebdomadaire: efficaciteData,
        consommationCarburant: consoData
      });
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
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/transporteur?tab=profile');
  };

  const handlePasswordClick = () => {
    navigate('/transporteur?tab=password');
  };

  // Récupérer la première livraison pour l'itinéraire
  const firstLivraison = livraisons.length > 0 ? livraisons[0] : null;
  const clientCoords = firstLivraison && firstLivraison.clientLatitude && firstLivraison.clientLongitude
    ? { lat: firstLivraison.clientLatitude, lng: firstLivraison.clientLongitude }
    : null;

  const renderDashboard = () => (
    <div className="transporteur-dashboard-container">
      {/* TOP KPI CARDS */}
      <div className="transporteur-dashboard-stats-grid-top">
        <div className="transporteur-dashboard-stat-box">
          <span className="transporteur-dashboard-label">LIVRAISONS ACTIVES</span>
          <div className="transporteur-dashboard-value-row">
            <span className="transporteur-dashboard-number">{stats.livraisonsActives}</span>
            <div className="transporteur-dashboard-icon-badge transporteur-dashboard-icon-badge--blue"><FaTruck /></div>
          </div>
        </div>
        <div className="transporteur-dashboard-stat-box">
          <span className="transporteur-dashboard-label">FLOTTE OPÉRATIONNELLE</span>
          <div className="transporteur-dashboard-value-row">
            <span className="transporteur-dashboard-number">{stats.flotteOperationnelle}%</span>
            <div className="transporteur-dashboard-progress-circle">{stats.flotteOperationnelle}%</div>
          </div>
        </div>
        <div className="transporteur-dashboard-stat-box">
          <span className="transporteur-dashboard-label">LIVRAISONS AUJOURD'HUI</span>
          <div className="transporteur-dashboard-value-row">
            <span className="transporteur-dashboard-number">{stats.livraisonsAujourdhui}</span>
            <div className="transporteur-dashboard-icon-badge transporteur-dashboard-icon-badge--green"><FaCheckCircle /></div>
          </div>
        </div>
        <div className="transporteur-dashboard-stat-box transporteur-dashboard-quick-actions-box">
          <span className="transporteur-dashboard-label">ACTIONS RAPIDES</span>
          <div className="transporteur-dashboard-action-btns">
            <button className="transporteur-dashboard-btn-main" onClick={() => setActiveMenu('livraisons')}><FaPlus /> Mes livraisons</button>
            <button className="transporteur-dashboard-btn-sub" onClick={() => window.location.reload()}><FaSearch /> Actualiser</button>
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
              center={currentPosition ? [currentPosition.lat, currentPosition.lng] : (clientCoords || [36.8065, 10.1815])} 
              zoom={13} 
              zoomControl={false} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              
              {/* Marqueur de la position du transporteur */}
              {currentPosition && (
                <Marker 
                  position={[currentPosition.lat, currentPosition.lng]}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: '<div style="background-color: #ff6b00; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #ff6b00;"></div>',
                    iconSize: [12, 12]
                  })}
                >
                  <Popup>🚚 Ma position</Popup>
                </Marker>
              )}
              
              {/* Marqueur du client */}
              {clientCoords && (
                <Marker position={[clientCoords.lat, clientCoords.lng]}>
                  <Popup>📍 {firstLivraison?.clientNom}</Popup>
                </Marker>
              )}
              
              {/* Itinéraire */}
              {currentPosition && clientCoords && (
                <RoutingControl start={currentPosition} end={clientCoords} />
              )}
            </MapContainer>
            <div className="transporteur-dashboard-map-legend-overlay">
              <span><FaCircle className="transporteur-dashboard-dot transporteur-dashboard-dot--blue" /> Ma position</span>
              <span><FaCircle className="transporteur-dashboard-dot transporteur-dashboard-dot--orange" /> Client</span>
            </div>
          </div>
        </section>
      </div>

      {/* GRAPHIQUES STATISTIQUES */}
      <div className="transporteur-dashboard-charts-bottom-grid">
        <div className="transporteur-dashboard-chart-card">
          <h3>EFFICACITÉ HEBDOMADAIRE</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={stats.efficaciteHebdomadaire}>
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
          <h3>CONSOMMATION CARBURANT (L/100km)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.consommationCarburant}>
              <XAxis dataKey="name" stroke="#8b949e" tick={{ fill: '#8b949e' }} />
              <Tooltip contentStyle={{background: '#161b22', border: 'none', borderRadius: '8px'}} />
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