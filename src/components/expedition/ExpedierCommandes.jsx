import React, { useState, useEffect } from 'react';
import { getCommandesAExpedier } from '../../services/commandeService';
import { expedierCommandeAvecId, getMesExpeditions, deleteExpedition, getTransporteurs } from '../../services/expeditionService';
import '../../styles/warehouse-modules.css';
import { FaBox, FaHistory, FaTruck, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const ExpedierCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExpeditions, setLoadingExpeditions] = useState(true);
  const [error, setError] = useState('');
  const [expeditionInProgress, setExpeditionInProgress] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [transporteurId, setTransporteurId] = useState('');
  const [transporteurs, setTransporteurs] = useState([]);
  const [loadingTransporteurs, setLoadingTransporteurs] = useState(false);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      const data = await getCommandesAExpedier();
      setCommandes(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExpeditions = async () => {
    try {
      setLoadingExpeditions(true);
      const data = await getMesExpeditions();
      setExpeditions(data);
    } catch (err) {
      console.error('Erreur chargement expéditions:', err);
    } finally {
      setLoadingExpeditions(false);
    }
  };

  const loadTransporteurs = async () => {
    setLoadingTransporteurs(true);
    try {
      const data = await getTransporteurs();
      setTransporteurs(data);
    } catch (err) {
      console.error('Erreur chargement transporteurs:', err);
      setTransporteurs([]);
    } finally {
      setLoadingTransporteurs(false);
    }
  };

  useEffect(() => {
    loadCommandes();
    loadExpeditions();
    loadTransporteurs();
  }, []);

  const openModal = (commande) => {
    setSelectedCommande(commande);
    setTransporteurId('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCommande(null);
    setTransporteurId('');
  };

  const handleExpedier = async () => {
    if (!transporteurId) {
      alert('Veuillez sélectionner un transporteur');
      return;
    }
    setExpeditionInProgress(selectedCommande.id);
    try {
      // Appel de la nouvelle méthode avec l'ID du transporteur
      await expedierCommandeAvecId(selectedCommande.id, transporteurId);
      closeModal();
      loadCommandes();
      loadExpeditions();
    } catch (err) {
      alert('Erreur lors de l’expédition : ' + (err.response?.data?.message || err.message));
    } finally {
      setExpeditionInProgress(null);
    }
  };

  const handleDeleteExpedition = async (expeditionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette expédition ?')) {
      try {
        await deleteExpedition(expeditionId);
        loadExpeditions();
        alert('Expédition supprimée avec succès');
      } catch (err) {
        alert('Erreur lors de la suppression : ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <div className="loading">Chargement des commandes à expédier...</div>;

  return (
    <div className="expedition-page">
      <h2>Expéditions</h2>
      {error && <div className="error-message">{error}</div>}

      <h3><FaBox style={{ marginRight: '8px' }} /> Commandes à expédier</h3>
      {commandes.length === 0 ? (
        <p>Aucune commande à expédier.</p>
      ) : (
        <table className="expedition-table">
          <thead>
            <tr>
              <th>N° commande</th>
              <th>Client</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map(cmd => (
              <tr key={cmd.id}>
                <td>{cmd.numeroCommande}</td>
                <td>{cmd.clientNom}</td>
                <td>{new Date(cmd.dateCommande).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-expedier"
                    onClick={() => openModal(cmd)}
                    disabled={expeditionInProgress === cmd.id}
                  >
                    {expeditionInProgress === cmd.id ? 'Expédition...' : <><FaTruck style={{ marginRight: '5px' }} /> Expédier</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: '30px' }}><FaHistory style={{ marginRight: '8px' }} /> Historique des expéditions</h3>
      {loadingExpeditions ? (
        <div className="loading">Chargement des expéditions...</div>
      ) : expeditions.length === 0 ? (
        <p>Aucune expédition effectuée.</p>
      ) : (
        <table className="expedition-table">
          <thead>
            <tr>
              <th>N° BL</th>
              <th>Commande N°</th>
              <th>Client</th>
              <th>Transporteur</th>
              <th>Date d'expédition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expeditions.map(exp => (
              <tr key={exp.id}>
                <td>{exp.numeroBL}</td>
                <td>{exp.commandeNumero}</td>
                <td>{exp.clientNom}</td>
                <td>{exp.transporteur || 'Non spécifié'}</td>
                <td>{new Date(exp.dateExpedition).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-cancel"
                    onClick={() => handleDeleteExpedition(exp.id)}
                  >
                    <FaTrash style={{ marginRight: '5px' }} /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && selectedCommande && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Expédition de la commande {selectedCommande.numeroCommande}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Client :</strong> {selectedCommande.clientNom}</p>
              <p><strong>Date de commande :</strong> {new Date(selectedCommande.dateCommande).toLocaleDateString()}</p>
              <p><strong>Date de livraison souhaitée :</strong> {selectedCommande.dateLivraisonSouhaitee ? new Date(selectedCommande.dateLivraisonSouhaitee).toLocaleDateString() : 'Non spécifiée'}</p>
              <h4>Articles à expédier</h4>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Désignation</th>
                    <th>Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCommande.lignes?.map((ligne, idx) => (
                    <tr key={idx}>
                      <td>{ligne.articleCode}</td>
                      <td>{ligne.articleDesignation}</td>
                      <td>{ligne.quantite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Transporteur *</label>
                {loadingTransporteurs ? (
                  <div className="loading">Chargement des transporteurs...</div>
                ) : transporteurs.length === 0 ? (
                  <div className="error-message">Aucun transporteur disponible. Veuillez contacter l’administrateur.</div>
                ) : (
                  <select
                    value={transporteurId}
                    onChange={(e) => setTransporteurId(e.target.value)}
                    className="search-input"
                    required
                    autoFocus
                  >
                    <option value="">-- Sélectionnez un transporteur --</option>
                    {transporteurs.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.prenom} {t.nom}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-expedier"
                onClick={handleExpedier}
                disabled={!transporteurId || loadingTransporteurs || transporteurs.length === 0}
              >
                <FaCheck style={{ marginRight: '5px' }} /> Confirmer l'expédition
              </button>
              <button className="btn-cancel" onClick={closeModal}>
                <FaTimes style={{ marginRight: '5px' }} /> Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpedierCommandes;