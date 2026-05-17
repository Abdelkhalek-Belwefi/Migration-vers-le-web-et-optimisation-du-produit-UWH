import React from 'react';
import { FaTimes, FaMapMarkerAlt, FaEnvelope, FaPhone, FaUser, FaCity } from 'react-icons/fa';
import './ClientDetailModal.css';

const ClientDetailModal = ({ client, onClose }) => {
  if (!client) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content client-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Détails du client</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="client-detail-content">
          <div className="detail-row">
            <span className="detail-label"><FaUser /> Nom complet :</span>
            <span className="detail-value">{client.prenom} {client.nom}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label"><FaEnvelope /> Email :</span>
            <span className="detail-value">{client.email}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label"><FaPhone /> Téléphone :</span>
            <span className="detail-value">{client.telephone || '-'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label"><FaMapMarkerAlt /> Adresse :</span>
            <span className="detail-value">{client.adresse || '-'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label"><FaCity /> Ville :</span>
            <span className="detail-value">{client.ville || '-'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Code postal :</span>
            <span className="detail-value">{client.codePostal || '-'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Pays :</span>
            <span className="detail-value">{client.pays || '-'}</span>
          </div>

          {client.latitude && client.longitude && (
            <div className="detail-row">
              <span className="detail-label"><FaMapMarkerAlt /> GPS :</span>
              <span className="detail-value">
                Lat: {client.latitude} | Lng: {client.longitude}
              </span>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">Créé le :</span>
            <span className="detail-value">
              {client.createdAt ? new Date(client.createdAt).toLocaleString() : '-'}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Modifié le :</span>
            <span className="detail-value">
              {client.updatedAt ? new Date(client.updatedAt).toLocaleString() : '-'}
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;