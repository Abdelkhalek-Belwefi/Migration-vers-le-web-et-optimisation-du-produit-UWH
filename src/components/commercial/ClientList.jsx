import React, { useState, useEffect } from 'react';
import { getAllClients, deleteClient } from '../../services/clientService';
import ClientForm from './ClientForm';
import '../../styles/warehouse-modules.css';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getAllClients();
      setClients(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClick = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await deleteClient(id);
      fetchClients();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchClients();
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="client-management">
      <h2>Gestion des clients</h2>
      {error && <div className="error-message">{error}</div>}
      <button className="btn-add" onClick={handleAddClick}>+ Nouveau client</button>
      <table className="client-table">
        <thead>
          <tr>
            <th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Ville</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.nom}</td>
              <td>{client.prenom}</td>
              <td>{client.email}</td>
              <td>{client.telephone}</td>
              <td>{client.ville}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEditClick(client)}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(client.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ClientForm client={editingClient} onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;