import React, { useState, useEffect } from 'react';
import { getCommandesAExpedier } from '../../services/commandeService';
import { expedierCommande } from '../../services/expeditionService';
import '../../styles/warehouse-modules.css';

const ExpedierCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expeditionInProgress, setExpeditionInProgress] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [transporteur, setTransporteur] = useState('');

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

  useEffect(() => {
    loadCommandes();
  }, []);

  const openModal = (commande) => {
    setSelectedCommande(commande);
    setTransporteur('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCommande(null);
    setTransporteur('');
  };

  // Sauvegarde du BL dans localStorage pour la section "Impression Documents"
  const sauvegarderBl = (expedition) => {
    const bl = {
      id: expedition.id,
      numeroBL: expedition.numeroBL,
      commandeNumero: expedition.commandeNumero,
      clientNom: expedition.clientNom,
      dateExpedition: expedition.dateExpedition
    };
    const existing = JSON.parse(localStorage.getItem('bonsLivraison') || '[]');
    if (!existing.some(b => b.id === bl.id)) {
      existing.push(bl);
      localStorage.setItem('bonsLivraison', JSON.stringify(existing));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleExpedier = async () => {
    if (!transporteur.trim()) {
      alert('Veuillez saisir le nom du transporteur');
      return;
    }
    setExpeditionInProgress(selectedCommande.id);
    try {
      const expeditionCreee = await expedierCommande(selectedCommande.id, transporteur);
      sauvegarderBl(expeditionCreee);
      closeModal();
      loadCommandes();
    } catch (err) {
      alert('Erreur lors de l’expédition : ' + (err.response?.data?.message || err.message));
    } finally {
      setExpeditionInProgress(null);
    }
  };

  if (loading) return <div className="loading">Chargement des commandes à expédier...</div>;

  return (
    <div className="expedition-page">
      <h2>Expéditions</h2>
      {error && <div className="error-message">{error}</div>}
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
                    {expeditionInProgress === cmd.id ? 'Expédition...' : '🚚 Expédier'}
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
                <input
                  type="text"
                  value={transporteur}
                  onChange={(e) => setTransporteur(e.target.value)}
                  placeholder="Ex: DHL, UPS, Colissimo..."
                  className="search-input"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-expedier" onClick={handleExpedier} disabled={!transporteur.trim()}>
                ✅ Confirmer l'expédition
              </button>
              <button className="btn-cancel" onClick={closeModal}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpedierCommandes;