import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import './LivraisonDetailModal.css';

// Correction des icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Service de géocodage intégré
const geocodeAddress = async (address) => {
  if (!address || address.trim() === '') return null;
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WarehouseApp/1.0' }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
};

const LivraisonDetailModal = ({ livraison, onClose }) => {
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [clientCoords, setClientCoords] = useState(null);
  const [loadingCoords, setLoadingCoords] = useState(false);

  // 1. Récupérer les coordonnées du client (base de données ou géocodage)
  useEffect(() => {
    if (!livraison) return;

    // Si les coordonnées existent déjà en base, on les utilise
    if (livraison.clientLatitude && livraison.clientLongitude) {
      setClientCoords({
        lat: livraison.clientLatitude,
        lng: livraison.clientLongitude
      });
      return;
    }

    // Sinon, on géocode l'adresse
    if (livraison.adresseLivraison) {
      setLoadingCoords(true);
      geocodeAddress(livraison.adresseLivraison).then(coords => {
        if (coords) {
          setClientCoords(coords);
          console.log('📍 Adresse géocodée:', coords);
        } else {
          console.warn('Impossible de géocoder l\'adresse:', livraison.adresseLivraison);
        }
        setLoadingCoords(false);
      });
    }
  }, [livraison]);

  // 2. Récupérer la position actuelle du livreur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Erreur géolocalisation:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // 3. Initialiser la carte (une seule fois)
  useEffect(() => {
    if (!clientCoords) return;
    if (!mapRef.current) {
      const map = L.map('detail-map').setView([clientCoords.lat, clientCoords.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributeurs'
      }).addTo(map);
      mapRef.current = map;
    }

    return () => {
      if (routingControlRef.current && mapRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [clientCoords]);

  // 4. Tracer l'itinéraire dès que la position du livreur et les coordonnées client sont disponibles
  useEffect(() => {
    if (!mapRef.current || !position || !clientCoords) return;

    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
    }

    setLoadingRoute(true);

    const start = L.latLng(position.lat, position.lng);
    const end = L.latLng(clientCoords.lat, clientCoords.lng);

    const control = L.Routing.control({
      waypoints: [start, end],
      routeWhileDragging: false,
      showAlternatives: false,
      lineOptions: { styles: [{ color: '#3b82f6', weight: 4, opacity: 0.7 }] },
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false
    }).addTo(mapRef.current);

    control.on('routesfound', () => setLoadingRoute(false));
    control.on('routingerror', () => setLoadingRoute(false));

    routingControlRef.current = control;
    mapRef.current.fitBounds([start, end]);
  }, [position, clientCoords]);

  // Utilitaires d'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (statut) => {
    const labels = {
      ASSIGNEE: 'Assignée',
      EN_COURS: 'En cours',
      LIVREE: 'Livrée',
      ECHOUEE: 'Échouée'
    };
    return labels[statut] || statut;
  };

  const getMapUrl = () => {
    if (clientCoords) {
      return `https://www.google.com/maps?q=${clientCoords.lat},${clientCoords.lng}`;
    } else if (livraison?.adresseLivraison) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(livraison.adresseLivraison)}`;
    }
    return '#';
  };

  if (!livraison) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Détails de la livraison</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Informations générales */}
          <div className="detail-section">
            <h4>Informations générales</h4>
            <div className="detail-grid">
              <div className="detail-item"><label>N° BL :</label><span>{livraison.numeroBL}</span></div>
              <div className="detail-item">
                <label>Statut :</label>
                <span className={`status-badge ${livraison.statut?.toLowerCase()}`}>
                  {getStatusLabel(livraison.statut)}
                </span>
              </div>
              <div className="detail-item"><label>Client :</label><span>{livraison.clientNom}</span></div>
              <div className="detail-item"><label>Adresse :</label><span>{livraison.adresseLivraison}</span></div>
              <div className="detail-item"><label>Date d'assignation :</label><span>{formatDate(livraison.dateAssignation)}</span></div>
              {livraison.dateLivraison && (
                <div className="detail-item"><label>Date de livraison :</label><span>{formatDate(livraison.dateLivraison)}</span></div>
              )}
            </div>
          </div>

          {/* Carte + itinéraire */}
          <div className="detail-section">
            <h4>🗺️ Itinéraire vers le client</h4>
            {loadingCoords && <div className="loading-text">Géocodage de l'adresse...</div>}
            {loadingRoute && <div className="loading-text">Calcul de l'itinéraire...</div>}
            <div id="detail-map" style={{ height: '350px', borderRadius: '12px', marginBottom: '10px' }}></div>
            <div className="map-links">
              {position && clientCoords && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${clientCoords.lat},${clientCoords.lng}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🧭 Ouvrir l'itinéraire dans Google Maps
                </a>
              )}
              <a href={getMapUrl()} target="_blank" rel="noopener noreferrer">
                📍 Voir le point client dans Google Maps
              </a>
            </div>
            {!position && !loadingRoute && (
              <div className="warning-message">
                ⚠️ Position actuelle non disponible. Activez la géolocalisation.
              </div>
            )}
            {!clientCoords && !loadingCoords && (
              <div className="warning-message">
                ⚠️ Impossible de localiser l'adresse du client.
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-close">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default LivraisonDetailModal;