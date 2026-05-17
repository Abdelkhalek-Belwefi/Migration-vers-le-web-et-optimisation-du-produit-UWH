import React, { useState, useEffect } from 'react';
import { getAllClients, deleteClient } from '../../services/clientService';
import ClientForm from './ClientForm';
import ClientDetailModal from './ClientDetailModal';
import '../../styles/warehouse-modules.css';
import { FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [emailFilter, setEmailFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getAllClients();
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Filtre par email
  useEffect(() => {
    if (emailFilter.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.email?.toLowerCase().includes(emailFilter.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [emailFilter, clients]);

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

  const handleRowClick = (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  const handleClearFilter = () => {
    setEmailFilter('');
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="client-management">
      <h2>Gestion des clients</h2>
      {error && <div className="error-message">{error}</div>}
      
      {/* Barre de filtre par email */}
      <div className="search-section" style={{ marginBottom: '20px' }}>
        <div className="search-form" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Filtrer par email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              style={{ paddingLeft: '35px', width: '100%' }}
            />
            {emailFilter && (
              <button
                onClick={handleClearFilter}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button className="btn-add" onClick={handleAddClick}>+ Nouveau client</button>
        </div>
      </div>

      <table className="client-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Ville</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map(client => (
            <tr 
              key={client.id} 
              onClick={() => handleRowClick(client)}
              style={{ cursor: 'pointer' }}
              className="clickable-row"
            >
              <td>{client.nom}</td>
              <td>{client.prenom}</td>
              <td>{client.email}</td>
              <td>{client.telephone}</td>
              <td>{client.ville}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <button className="btn-edit" onClick={() => handleEditClick(client)}><FiEdit2 /></button>
                <button className="btn-delete" onClick={() => handleDelete(client.id)}><FaTrash /></button>
               </td>
             </tr>
          ))}
        </tbody>
      </table>
      
      {filteredClients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Aucun client trouvé avec cet email
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ClientForm client={editingClient} onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showDetailModal && selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default ClientList;