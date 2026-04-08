import React, { useState } from 'react';
import { createClient, updateClient } from '../../services/clientService';
import '../../styles/warehouse-modules.css';


const ClientForm = ({ client, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: client?.nom || '',
    prenom: client?.prenom || '',
    email: client?.email || '',
    telephone: client?.telephone || '',
    adresse: client?.adresse || '',
    ville: client?.ville || '',
    codePostal: client?.codePostal || '',
    pays: client?.pays || 'France'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <div className="client-form">
      <h3>{client ? 'Modifier le client' : 'Nouveau client'}</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>Nom *</label><input name="nom" value={formData.nom} onChange={handleChange} required /></div>
          <div className="form-group"><label>Prénom</label><input name="prenom" value={formData.prenom} onChange={handleChange} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
          <div className="form-group"><label>Téléphone</label><input name="telephone" value={formData.telephone} onChange={handleChange} /></div>
        </div>
        <div className="form-group"><label>Adresse</label><input name="adresse" value={formData.adresse} onChange={handleChange} /></div>
        <div className="form-row">
          <div className="form-group"><label>Ville</label><input name="ville" value={formData.ville} onChange={handleChange} /></div>
          <div className="form-group"><label>Code postal</label><input name="codePostal" value={formData.codePostal} onChange={handleChange} /></div>
          <div className="form-group"><label>Pays</label><input name="pays" value={formData.pays} onChange={handleChange} /></div>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          <button type="button" onClick={onCancel}>Annuler</button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;