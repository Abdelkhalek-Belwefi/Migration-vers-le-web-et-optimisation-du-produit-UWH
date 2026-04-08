import React, { useState, useEffect } from 'react';
import { getAllCommandes, updateStatut, deleteCommande } from '../../services/commandeService';
import CommandeForm from './CommandeForm';
import './styles/commande.css';

const CommandeList = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCommande, setEditingCommande] = useState(null);

  // Fonction de tri : date la plus récente en premier
  const sortByDateDesc = (data) => {
    return [...data].sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande));
  };

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      const data = await getAllCommandes();
      const sortedData = sortByDateDesc(data);
      setCommandes(sortedData);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const handleAddClick = () => {
    setEditingCommande(null);
    setShowForm(true);
  };

  const handleEditClick = (commande) => {
    if (commande.statut !== 'EN_ATTENTE') {
      alert('Seules les commandes en attente peuvent être modifiées.');
      return;
    }
    setEditingCommande(commande);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette commande ?')) return;
    try {
      await deleteCommande(id);
      fetchCommandes(); // recharge et retrie
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleStatutChange = async (id, newStatut) => {
    try {
      await updateStatut(id, newStatut);
      fetchCommandes(); // recharge et retrie
    } catch (err) {
      alert('Erreur lors du changement de statut');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchCommandes();
  };

  const getStatutBadge = (statut) => {
    const classes = {
      EN_ATTENTE: 'badge-warning',
      VALIDEE: 'badge-success',
      EXPEDIEE: 'badge-secondary'
    };
    return <span className={`badge ${classes[statut]}`}>{statut}</span>;
  };

  if (loading) return <div className="loading">Chargement des commandes...</div>;

  return (
    <div className="commande-management">
      <div className="commande-header">
        <h2>Gestion des commandes</h2>
        <button className="btn-add" onClick={handleAddClick}>
          + Nouvelle commande
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="commande-table-container">
        <table className="commande-table">
          <thead>
            <tr>
              <th>N° commande</th>
              <th>Client</th>
              <th>Date</th>
              <th>Livraison souhaitée</th>
              <th>Statut</th>
              <th>Actions</th>
              </tr>
            </thead>
          <tbody>
            {commandes.map(cmd => (
              <tr key={cmd.id}>
                <td>{cmd.numeroCommande}</td>
                <td>{cmd.clientNom}</td>
                <td>{new Date(cmd.dateCommande).toLocaleDateString()}</td>
                <td>{cmd.dateLivraisonSouhaitee ? new Date(cmd.dateLivraisonSouhaitee).toLocaleDateString() : '-'}</td>
                <td>{getStatutBadge(cmd.statut)}</td>
                <td className="action-buttons">
                  {cmd.statut === 'EN_ATTENTE' && (
                    <button className="btn-edit" onClick={() => handleEditClick(cmd)}>✏️</button>
                  )}
                  <button className="btn-delete" onClick={() => handleDelete(cmd.id)}>🗑️</button>
                  <select
                    className="statut-select"
                    value={cmd.statut}
                    onChange={(e) => handleStatutChange(cmd.id, e.target.value)}
                  >
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="VALIDEE">Validée</option>
                    <option value="EXPEDIEE">Expédiée</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <CommandeForm
              commande={editingCommande}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandeList;