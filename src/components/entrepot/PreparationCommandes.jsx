import React, { useState, useEffect } from 'react';
import { getCommandesByStatut, updateStatut } from '../../services/commandeService';
import '../../styles/warehouse-modules.css';

const PreparationCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      const data = await getCommandesByStatut('EN_ATTENTE');
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

  const handlePreparer = async (id) => {
    if (!window.confirm('Valider la préparation de cette commande ? Le stock sera diminué.')) return;
    try {
      await updateStatut(id, 'VALIDEE');
      loadCommandes();
      setShowModal(false);
    } catch (err) {
      alert('Erreur lors de la validation : ' + (err.response?.data?.message || err.message));
    }
  };

  const handleShowDetails = (commande) => {
    setSelectedCommande(commande);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCommande(null);
  };

  if (loading) return <div className="loading">Chargement des commandes...</div>;

  return (
    <div className="commande-management">
      <h2>Préparation de commandes</h2>
      {error && <div className="error-message">{error}</div>}
      {commandes.length === 0 ? (
        <p>Aucune commande en attente.</p>
      ) : (
        <table className="commande-table">
          <thead>
            <tr>
              <th>N° commande</th>
              <th>Client</th>
              <th>Date</th>
              <th>Articles</th>
              <th>Actions</th>
              </tr>
            </thead>
          <tbody>
            {commandes.map(cmd => (
              <tr key={cmd.id}>
                <td>{cmd.numeroCommande}</td>
                <td>{cmd.clientNom}</td>
                <td>{new Date(cmd.dateCommande).toLocaleDateString()}</td>
                <td>{cmd.lignes?.length || 0}</td>
                <td>
                  <button className="btn-details" onClick={() => handleShowDetails(cmd)}>
                    📋 Détails
                  </button>
                  <button className="btn-preparer" onClick={() => handlePreparer(cmd.id)}>
                    ✅ Préparer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de détails */}
      {showModal && selectedCommande && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails de la commande {selectedCommande.numeroCommande}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Client :</strong> {selectedCommande.clientNom}</p>
              <p><strong>Date de commande :</strong> {new Date(selectedCommande.dateCommande).toLocaleString()}</p>
              <p><strong>Date de livraison souhaitée :</strong> {selectedCommande.dateLivraisonSouhaitee ? new Date(selectedCommande.dateLivraisonSouhaitee).toLocaleDateString() : 'Non spécifiée'}</p>
              <p><strong>Notes :</strong> {selectedCommande.notes || 'Aucune'}</p>
              <h4>Articles</h4>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Désignation</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    </tr>
                  </thead>
                <tbody>
                  {selectedCommande.lignes?.map((ligne, idx) => (
                    <tr key={idx}>
                      <td>{ligne.articleCode}</td>
                      <td>{ligne.articleDesignation}</td>
                      <td>{ligne.quantite}</td>
                      <td>{ligne.prixUnitaire} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn-preparer" onClick={() => handlePreparer(selectedCommande.id)}>
                ✅ Valider la préparation
              </button>
              <button className="btn-cancel" onClick={closeModal}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreparationCommandes;