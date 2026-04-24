import React, { useState } from 'react';
import { validerLivraison } from '../../services/transporteurService';
import './ValidationModal.css';

const ValidationModal = ({ livraison, onClose, onSuccess }) => {
  const [codeOtp, setCodeOtp] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState(null);
  const [positionLoading, setPositionLoading] = useState(false);

  // Obtenir la position GPS actuelle
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n’est pas supportée par votre navigateur.');
      return;
    }
    setPositionLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setError('');
        setPositionLoading(false);
      },
      (err) => {
        let errorMsg = '';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Vous avez refusé la géolocalisation. Activez-la pour valider la livraison.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Position indisponible. Vérifiez votre connexion GPS.';
            break;
          case err.TIMEOUT:
            errorMsg = 'Délai dépassé pour obtenir la position.';
            break;
          default:
            errorMsg = 'Erreur de géolocalisation : ' + err.message;
        }
        setError(errorMsg);
        setPositionLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codeOtp || codeOtp.length !== 6) {
      setError('Veuillez saisir un code OTP à 6 chiffres.');
      return;
    }
    if (!position) {
      setError('Veuillez obtenir votre position GPS avant de valider.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await validerLivraison(livraison.id, {
        codeOtp,
        latitude: position.latitude,
        longitude: position.longitude,
        commentaire
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la validation.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ValidationModal-modal-overlay" onClick={onClose}>
      <div className="ValidationModal-validation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ValidationModal-modal-header">
          <h3>Valider la livraison</h3>
          <button className="ValidationModal-modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ValidationModal-modal-body">
          <div className="ValidationModal-delivery-info">
            <p><strong>BL :</strong> {livraison.numeroBL}</p>
            <p><strong>Client :</strong> {livraison.clientNom}</p>
            <p><strong>Adresse :</strong> {livraison.adresseLivraison}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ValidationModal-form-group">
              <label>Code OTP client *</label>
              <input
                type="text"
                maxLength="6"
                placeholder="6 chiffres"
                value={codeOtp}
                onChange={(e) => setCodeOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
            </div>

            <div className="ValidationModal-form-group">
              <label>Commentaire (optionnel)</label>
              <textarea
                rows="2"
                placeholder="Signature, état du colis, etc."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </div>

            <div className="ValidationModal-gps-section">
              <button
                type="button"
                onClick={getCurrentPosition}
                disabled={positionLoading}
                className="ValidationModal-btn-gps"
              >
                {positionLoading ? 'Recherche GPS...' : '📍 Obtenir ma position GPS'}
              </button>
              {position && (
                <div className="ValidationModal-gps-success">
                  ✅ Position enregistrée : {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                </div>
              )}
            </div>

            {error && <div className="ValidationModal-error-message">{error}</div>}

            <div className="ValidationModal-modal-actions">
              <button type="button" onClick={onClose} className="ValidationModal-btn-cancel">
                Annuler
              </button>
              <button type="submit" disabled={loading || !position} className="ValidationModal-btn-confirm">
                {loading ? 'Validation...' : 'Confirmer la livraison'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;