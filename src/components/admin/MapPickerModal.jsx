import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaSearch, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import './MapPickerModal.css';

const MapPickerModal = ({ onClose, onSelect, initialAddress = '' }) => {
    const [searchAddress, setSearchAddress] = useState(initialAddress);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    // Initialisation de Leaflet
    useEffect(() => {
        const loadLeaflet = async () => {
            if (!window.L) {
                await import('leaflet');
                await import('leaflet/dist/leaflet.css');
                
                // Correction des icônes Leaflet
                delete window.L.Icon.Default.prototype._getIconUrl;
                window.L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
            }
            initMap();
        };
        
        loadLeaflet();
    }, []);

    const initMap = () => {
        if (!mapRef.current || mapInstanceRef.current) return;
        
        // Position par défaut (Tunisie)
        const defaultCenter = [36.8065, 10.1815];
        
        const map = window.L.map(mapRef.current).setView(defaultCenter, 13);
        mapInstanceRef.current = map;
        
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        // Ajouter un marqueur
        const marker = window.L.marker(defaultCenter, { draggable: true }).addTo(map);
        markerRef.current = marker;
        
        // Mettre à jour les coordonnées quand on déplace le marqueur
        marker.on('dragend', async () => {
            const latLng = marker.getLatLng();
            await reverseGeocode(latLng.lat, latLng.lng);
        });
        
        // Mettre à jour les coordonnées quand on clique sur la carte
        map.on('click', async (e) => {
            marker.setLatLng(e.latlng);
            await reverseGeocode(e.latlng.lat, e.latlng.lng);
        });
    };

    const geocodeAddress = async (address) => {
        if (!address.trim()) return;
        
        setLoading(true);
        setError('');
        
        try {
            const encodedAddress = encodeURIComponent(address + ', Tunisie');
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                const displayName = data[0].display_name;
                
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([lat, lon], 15);
                    if (markerRef.current) {
                        markerRef.current.setLatLng([lat, lon]);
                    }
                }
                
                setSelectedLocation({
                    lat: lat,
                    lng: lon,
                    address: displayName
                });
                setError('');
            } else {
                setError('Adresse non trouvée. Veuillez cliquer directement sur la carte.');
            }
        } catch (err) {
            console.error('Erreur géocodage:', err);
            setError('Erreur lors de la recherche. Veuillez cliquer directement sur la carte.');
        } finally {
            setLoading(false);
        }
    };

    const reverseGeocode = async (lat, lng) => {
        setLoading(true);
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            const address = data.display_name || `${lat}, ${lng}`;
            
            setSelectedLocation({
                lat: lat,
                lng: lng,
                address: address
            });
            setError('');
        } catch (err) {
            console.error('Erreur reverse géocodage:', err);
            setSelectedLocation({
                lat: lat,
                lng: lng,
                address: `${lat}, ${lng}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchAddress.trim()) {
            geocodeAddress(searchAddress);
        }
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onSelect({
                address: selectedLocation.address,
                lat: selectedLocation.lat,
                lng: selectedLocation.lng
            });
        }
        onClose();
    };

    return (
        <div className="map-picker-overlay" onClick={onClose}>
            <div className="map-picker-modal" onClick={(e) => e.stopPropagation()}>
                <div className="map-picker-header">
                    <h3>📍 Sélectionner l'emplacement de l'entrepôt</h3>
                    <button className="map-picker-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="map-picker-search">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Rechercher une adresse (ex: Menzel Tmim, Nabeul, Tunisie)..."
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                        />
                        <button type="submit" disabled={loading}>
                            <FaSearch /> {loading ? 'Recherche...' : 'Rechercher'}
                        </button>
                    </form>
                </div>

                <div className="map-picker-instructions">
                    <p>💡 Cliquez sur la carte ou déplacez le marqueur pour sélectionner l'emplacement exact</p>
                    <p>📍 Si la recherche échoue, cliquez directement sur la carte pour placer le marqueur</p>
                </div>

                <div ref={mapRef} className="map-picker-container"></div>

                {error && <div className="map-picker-error">{error}</div>}

                {selectedLocation && (
                    <div className="map-picker-selected">
                        <div className="selected-info">
                            <FaMapMarkerAlt style={{ color: '#4361ee' }} />
                            <div>
                                <strong>Position sélectionnée :</strong>
                                <p>{selectedLocation.address}</p>
                                <small>Lat: {selectedLocation.lat.toFixed(6)} | Lng: {selectedLocation.lng.toFixed(6)}</small>
                            </div>
                        </div>
                    </div>
                )}

                <div className="map-picker-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Annuler
                    </button>
                    <button className="btn-confirm" onClick={handleConfirm} disabled={!selectedLocation}>
                        <FaCheck /> Confirmer la position
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapPickerModal;