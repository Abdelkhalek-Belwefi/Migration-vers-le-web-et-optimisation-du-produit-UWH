import React from 'react';
import { FaTimes, FaBox, FaCalendarAlt, FaUser } from 'react-icons/fa';
import './CommandeDetailModal.css';

const CommandeDetailModal = ({ commande, onClose }) => {
  if (!commande) return null;

  const getStatutLabel = (statut) => {
    const labels = {
      EN_ATTENTE: 'En attente',
      VALIDEE: 'Validée',
      EXPEDIEE: 'Expédiée',
      ANNULEE: 'Annulée'
    };
    return labels[statut] || statut;
  };

  const getStatutClass = (statut) => {
    const classes = {
      EN_ATTENTE: 'status-warning',
      VALIDEE: 'status-success',
      EXPEDIEE: 'status-info',
      ANNULEE: 'status-danger'
    };
    return classes[statut] || '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content commande-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Détails de la commande</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="commande-detail-content">
          {/* Informations générales */}
          <div className="detail-section">
            <h4>Informations générales</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">N° commande :</span>
                <span className="detail-value">{commande.numeroCommande}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Statut :</span>
                <span className={`status-badge ${getStatutClass(commande.statut)}`}>
                  {getStatutLabel(commande.statut)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label"><FaUser /> Client :</span>
                <span className="detail-value">{commande.clientNom}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label"><FaCalendarAlt /> Date commande :</span>
                <span className="detail-value">
                  {new Date(commande.dateCommande).toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label"><FaCalendarAlt /> Livraison souhaitée :</span>
                <span className="detail-value">
                  {commande.dateLivraisonSouhaitee ? 
                    new Date(commande.dateLivraisonSouhaitee).toLocaleDateString() : 'Non spécifiée'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Notes :</span>
                <span className="detail-value">{commande.notes || 'Aucune'}</span>
              </div>
            </div>
          </div>

          {/* Articles commandés (sans prix) */}
          <div className="detail-section">
            <h4><FaBox /> Articles commandés</h4>
            {commande.lignes && commande.lignes.length > 0 ? (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Désignation</th>
                    <th>Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {commande.lignes.map((ligne, idx) => (
                    <tr key={idx}>
                      <td>{ligne.articleCode}</td>
                      <td>{ligne.articleDesignation}</td>
                      <td>{ligne.quantite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                Aucun article dans cette commande
              </div>
            )}
          </div>

          {/* Métadonnées */}
          <div className="detail-section">
            <h4>Métadonnées</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Créé le :</span>
                <span className="detail-value">
                  {commande.createdAt ? new Date(commande.createdAt).toLocaleString() : '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Modifié le :</span>
                <span className="detail-value">
                  {commande.updatedAt ? new Date(commande.updatedAt).toLocaleString() : '-'}
                </span>
              </div>
            </div>
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

export default CommandeDetailModal;