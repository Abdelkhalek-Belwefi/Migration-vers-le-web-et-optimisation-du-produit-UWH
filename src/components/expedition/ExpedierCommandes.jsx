import React, { useState, useEffect } from 'react';
import { getCommandesAExpedier } from '../../services/commandeService';
import { expedierCommandeAvecId, getMesExpeditions, deleteExpedition, getTransporteurs } from '../../services/expeditionService';
import '../../styles/warehouse-modules.css';
import { FaBox, FaHistory, FaTruck, FaTrash, FaCheck, FaTimes, FaEye } from 'react-icons/fa';

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

  // ========== NOUVEAU : État pour le filtre ==========
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'CLIENT', 'TRANSFERT'

  // ========== État pour le filtre de l'HISTORIQUE des expéditions ==========
  const [historyFilterType, setHistoryFilterType] = useState('ALL');

  // ========== NOUVEAU : État pour le modal de détails ==========
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailCommande, setDetailCommande] = useState(null);

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

  // ========== NOUVEAU : Filtrer les commandes selon le type ==========
  const filteredCommandes = commandes.filter(cmd => {
    if (filterType === 'CLIENT') return cmd.typeCommande === 'CLIENT';
    if (filterType === 'TRANSFERT') return cmd.typeCommande === 'TRANSFERT';
    return true;
  });

  // ========== NOUVEAU : Compter les commandes par type ==========
  const clientCount = commandes.filter(cmd => cmd.typeCommande === 'CLIENT').length;
  const transfertCount = commandes.filter(cmd => cmd.typeCommande === 'TRANSFERT').length;

  // ========== Filtrer l'HISTORIQUE des expéditions selon le type ==========
  const filteredExpeditions = expeditions.filter(exp => {
    if (historyFilterType === 'CLIENT') return exp.typeCommande === 'CLIENT';
    if (historyFilterType === 'TRANSFERT') return exp.typeCommande === 'TRANSFERT';
    return true;
  });

  // ========== Compter l'HISTORIQUE des expéditions par type ==========
  const historyClientCount = expeditions.filter(exp => exp.typeCommande === 'CLIENT').length;
  const historyTransfertCount = expeditions.filter(exp => exp.typeCommande === 'TRANSFERT').length;

  // ========== Fonction pour obtenir le client ou l'entrepôt destinataire ==========
  const getClientOrDestinataire = (expedition) => {
    if (expedition.typeCommande === 'CLIENT') {
      return expedition.clientNom;
    } else {
      return expedition.entrepotDestinationNom || 'Entrepôt destinataire';
    }
  };

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

  // ========== NOUVEAU : Ouvrir le modal de détails ==========
  const openDetailModal = (commande) => {
    setDetailCommande(commande);
    setShowDetailModal(true);
  };

  // ========== NOUVEAU : Fermer le modal de détails ==========
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailCommande(null);
  };

  const handleExpedier = async () => {
    if (!transporteurId) {
      alert('Veuillez sélectionner un transporteur');
      return;
    }
    setExpeditionInProgress(selectedCommande.id);
    try {
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

      {/* ========== NOUVEAU : Boutons de filtre (comme dans Préparation de commandes) ========== */}
      <div className="filter-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setFilterType('ALL')}
          className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
        >
          Toutes les commandes ({commandes.length})
        </button>
        <button
          onClick={() => setFilterType('CLIENT')}
          className={`filter-btn ${filterType === 'CLIENT' ? 'active' : ''}`}
        >
          Commandes client ({clientCount})
        </button>
        <button
          onClick={() => setFilterType('TRANSFERT')}
          className={`filter-btn ${filterType === 'TRANSFERT' ? 'active' : ''}`}
        >
          Transferts ({transfertCount})
        </button>
      </div>

      <h3><FaBox style={{ marginRight: '8px' }} /> Commandes à expédier</h3>
      {filteredCommandes.length === 0 ? (
        <p>Aucune commande à expédier.</p>
      ) : (
        <table className="expedition-table">
          <thead>
            <tr>
              <th>N° commande</th>
              <th>Client</th>
              <th>Date</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCommandes.map(cmd => (
              <tr key={cmd.id}>
                <td>{cmd.numeroCommande}</td>
                <td>{cmd.clientNom || (cmd.typeCommande === 'TRANSFERT' ? `Transfert - Entrepôt ${cmd.entrepotDestinationId}` : '-')}</td>
                <td>{new Date(cmd.dateCommande).toLocaleDateString()}</td>
                <td>
                  {cmd.typeCommande === 'TRANSFERT' ? (
                    <span className="badge-transfert">Transfert</span>
                  ) : (
                    <span className="badge-client">Client</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn-expedier"
                    onClick={() => openModal(cmd)}
                    disabled={expeditionInProgress === cmd.id}
                  >
                    {expeditionInProgress === cmd.id ? 'Expédition...' : <><FaTruck style={{ marginRight: '5px' }} /> Expédier</>}
                  </button>
                  {/* ========== NOUVEAU : Bouton Détails ========== */}
                  <button
                    className="btn-details"
                    onClick={() => openDetailModal(cmd)}
                    title="Voir les détails de la commande"
                    style={{ marginLeft: '8px' }}
                  >
                    <FaEye /> Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: '30px' }}><FaHistory style={{ marginRight: '8px' }} /> Historique des expéditions</h3>

      {/* ========== NOUVEAU : Boutons de filtre pour l'HISTORIQUE des expéditions ========== */}
      <div className="filter-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setHistoryFilterType('ALL')}
          className={`filter-btn ${historyFilterType === 'ALL' ? 'active' : ''}`}
        >
          Toutes ({expeditions.length})
        </button>
        <button
          onClick={() => setHistoryFilterType('CLIENT')}
          className={`filter-btn ${historyFilterType === 'CLIENT' ? 'active' : ''}`}
        >
          Commandes client ({historyClientCount})
        </button>
        <button
          onClick={() => setHistoryFilterType('TRANSFERT')}
          className={`filter-btn ${historyFilterType === 'TRANSFERT' ? 'active' : ''}`}
        >
          Transferts ({historyTransfertCount})
        </button>
      </div>

      {loadingExpeditions ? (
        <div className="loading">Chargement des expéditions...</div>
      ) : filteredExpeditions.length === 0 ? (
        <p>Aucune expédition effectuée.</p>
      ) : (
        <table className="expedition-table">
          <thead>
            <tr>
              <th>N° BL</th>
              <th>Commande N°</th>
              <th>Client / Entrepôt destinataire</th>
              <th>Type</th>
              <th>Transporteur</th>
              <th>Date d'expédition</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpeditions.map(exp => (
              <tr key={exp.id}>
                <td>{exp.numeroBL}</td>
                <td>{exp.commandeNumero}</td>
                <td>{getClientOrDestinataire(exp)}</td>
                <td>
                  {exp.typeCommande === 'TRANSFERT' ? (
                    <span className="badge-transfert">Transfert</span>
                  ) : (
                    <span className="badge-client">Client</span>
                  )}
                </td>
                <td>{exp.transporteur || 'Non spécifié'}</td>
                <td>{new Date(exp.dateExpedition).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ========== NOUVEAU : Modal de détails de la commande ========== */}
      {showDetailModal && detailCommande && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Détails de la commande {detailCommande.numeroCommande}</h3>
              <button className="modal-close" onClick={closeDetailModal}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Client :</strong> {detailCommande.clientNom || (detailCommande.typeCommande === 'TRANSFERT' ? `Transfert - Entrepôt ${detailCommande.entrepotDestinationId}` : '-')}</p>
              <p><strong>Type :</strong> {detailCommande.typeCommande === 'TRANSFERT' ? 'Transfert entre entrepôts' : 'Commande client'}</p>
              <p><strong>Date de commande :</strong> {new Date(detailCommande.dateCommande).toLocaleDateString()}</p>
              <p><strong>Date de livraison souhaitée :</strong> {detailCommande.dateLivraisonSouhaitee ? new Date(detailCommande.dateLivraisonSouhaitee).toLocaleDateString() : 'Non spécifiée'}</p>
              <p><strong>Notes :</strong> {detailCommande.notes || 'Aucune'}</p>
              <h4>Articles</h4>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Désignation</th>
                    <th>Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {detailCommande.lignes?.map((ligne, idx) => (
                    <tr key={idx}>
                      <td>{ligne.articleCode}</td>
                      <td>{ligne.articleDesignation}</td>
                      <td>{ligne.quantite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeDetailModal}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedCommande && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Expédition de la commande {selectedCommande.numeroCommande}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Client :</strong> {selectedCommande.clientNom || (selectedCommande.typeCommande === 'TRANSFERT' ? `Transfert - Entrepôt ${selectedCommande.entrepotDestinationId}` : '-')}</p>
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