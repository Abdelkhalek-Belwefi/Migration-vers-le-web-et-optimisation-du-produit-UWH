import React, { useState } from 'react';
import { createClient, updateClient } from '../../services/clientService';
import MapPickerModal from '../admin/MapPickerModal';
import { FaMapMarkerAlt } from 'react-icons/fa';
import '../../styles/clientCom-modules.scss';

const ClientForm = ({ client, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: client?.nom || '',
    prenom: client?.prenom || '',
    email: client?.email || '',
    telephone: client?.telephone || '',
    adresse: client?.adresse || '',
    ville: client?.ville || '',
    codePostal: client?.codePostal || '',
    pays: client?.pays || 'France',
    latitude: client?.latitude || null,
    longitude: client?.longitude || null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      adresse: location.address,
      latitude: location.lat,
      longitude: location.lng
    });
    setShowMapPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (client) {
        await updateClient(client.id, formData);
      } else {
        await createClient(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clientCom-form">
      <h3 className="clientCom-title">{client ? 'Modifier le client' : 'Nouveau client'}</h3>
      {error && <div className="clientCom-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="clientCom-form-row">
          <div className="clientCom-form-group"><label className="clientCom-label">Nom *</label><input className="clientCom-input" name="nom" value={formData.nom} onChange={handleChange} required /></div>
          <div className="clientCom-form-group"><label className="clientCom-label">Prénom</label><input className="clientCom-input" name="prenom" value={formData.prenom} onChange={handleChange} /></div>
        </div>
        <div className="clientCom-form-row">
          <div className="clientCom-form-group"><label className="clientCom-label">Email *</label><input className="clientCom-input" type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
          <div className="clientCom-form-group"><label className="clientCom-label">Téléphone</label><input className="clientCom-input" name="telephone" value={formData.telephone} onChange={handleChange} /></div>
        </div>
        <div className="clientCom-form-group">
          <label className="clientCom-label">Adresse</label>
          <div className="clientCom-address-wrapper">
            <input 
              className="clientCom-input clientCom-address-input"
              name="adresse" 
              value={formData.adresse} 
              onChange={handleChange} 
              placeholder="Adresse du client"
            />
            <button 
              type="button" 
              onClick={() => setShowMapPicker(true)}
              className="clientCom-map-button"
            >
              <FaMapMarkerAlt /> Choisir sur la carte
            </button>
          </div>
          <small className="clientCom-hint">Cliquez sur le bouton pour sélectionner l'emplacement exact du client</small>
        </div>
        <div className="clientCom-form-row">
          <div className="clientCom-form-group"><label className="clientCom-label">Ville</label><input className="clientCom-input" name="ville" value={formData.ville} onChange={handleChange} /></div>
          <div className="clientCom-form-group"><label className="clientCom-label">Code postal</label><input className="clientCom-input" name="codePostal" value={formData.codePostal} onChange={handleChange} /></div>
          <div className="clientCom-form-group"><label className="clientCom-label">Pays</label><input className="clientCom-input" name="pays" value={formData.pays} onChange={handleChange} /></div>
        </div>
        {formData.latitude && formData.longitude && (
          <div className="clientCom-form-group">
            <label className="clientCom-label">Coordonnées GPS</label>
            <div className="clientCom-gps-info">
              📍 Latitude: {formData.latitude} | Longitude: {formData.longitude}
            </div>
          </div>
        )}
        <div className="clientCom-actions">
          <button type="submit" disabled={loading} className="clientCom-submit-btn">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          <button type="button" onClick={onCancel} className="clientCom-cancel-btn">Annuler</button>
        </div>
      </form>

      {showMapPicker && (
        <MapPickerModal
          onClose={() => setShowMapPicker(false)}
          onSelect={handleLocationSelect}
          initialAddress={formData.adresse}
        />
      )}
    </div>
  );
};

export default ClientForm;