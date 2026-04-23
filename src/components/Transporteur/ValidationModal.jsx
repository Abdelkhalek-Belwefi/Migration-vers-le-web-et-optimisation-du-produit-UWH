// src/components/ValidationModal.jsx
import React, { useState } from 'react';
import { validerLivraison } from '../../services/transporteurService';
import './ValidationModal.css';

const ValidationModal = ({ livraison, onClose, onSuccess }) => {
  const [codeOtp, setCodeOtp] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState(null);

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée");
      return false;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setError('');
      },
      (err) => {
        setError("Impossible d'obtenir votre position : " + err.message);
      }
    );
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codeOtp) {
      setError("Veuillez saisir le code OTP");
      return;
    }
    if (!position) {
      setError("Veuillez d'abord obtenir votre position GPS");
      return;
    }
    setLoading(true);
    try {
      await validerLivraison(livraison.id, {
        codeOtp,
        latitude: position.latitude,
        longitude: position.longitude,
        commentaire
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="td-modal-overlay">
      <div className="td-modal-content">
        <h2 className="td-modal-title">Valider la livraison</h2>
        <p className="td-info-line-small"><strong>BL :</strong> {livraison.numeroBL}</p>
        <p className="td-info-line-large"><strong>Client :</strong> {livraison.clientNom}</p>

        <form onSubmit={handleSubmit} className="td-validation-form">
          <div className="td-form-group">
            <label className="td-modal-label">Code OTP client</label>
            <input
              type="text"
              value={codeOtp}
              onChange={(e) => setCodeOtp(e.target.value)}
              className="td-modal-input"
              placeholder="6 chiffres"
              required
            />
          </div>

          <div className="td-form-group">
            <label className="td-modal-label">Commentaire (optionnel)</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              className="td-modal-textarea"
              rows="2"
            />
          </div>

          <div className="td-form-group">
            <button
              type="button"
              onClick={getCurrentPosition}
              className="td-btn-gps"
            >
              📍 Obtenir ma position GPS
            </button>
            {position && (
              <p className="td-gps-coords">
                Position: {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
              </p>
            )}
          </div>

          {error && <p className="td-error-message">{error}</p>}

          <div className="td-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="td-btn-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="td-btn-confirm"
            >
              {loading ? "Validation..." : "Confirmer la livraison"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidationModal;