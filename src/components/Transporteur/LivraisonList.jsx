import React, { useState } from 'react';
import './LivraisonList.css';

const LivraisonList = ({ livraisons, onValider, onRowClick, readonly = false }) => {
  // ========== État pour le filtre ==========
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'CLIENT', 'TRANSFERT'

  // ========== Fonction pour obtenir le nom du client ou du transfert ==========
  const getClientDisplayName = (livraison) => {
    if (livraison.typeCommande === 'TRANSFERT') {
      return `Transfert sortant - ${livraison.entrepotDestinationNom || 'Entrepôt destinataire'}`;
    }
    return livraison.clientNom;
  };

  // ========== Filtrer les livraisons selon le type ==========
  const filteredLivraisons = livraisons.filter(liv => {
    if (filterType === 'CLIENT') return liv.typeCommande === 'CLIENT';
    if (filterType === 'TRANSFERT') return liv.typeCommande === 'TRANSFERT';
    return true;
  });

  // ========== Compter les livraisons par type ==========
  const clientCount = livraisons.filter(liv => liv.typeCommande === 'CLIENT').length;
  const transfertCount = livraisons.filter(liv => liv.typeCommande === 'TRANSFERT').length;

  if (!livraisons.length) {
    return <div className="empty-state">Aucune livraison trouvée</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      ASSIGNEE: { label: 'Assignée', class: 'status-assignee' },
      EN_COURS: { label: 'En cours', class: 'status-en-cours' },
      LIVREE: { label: 'Livrée', class: 'status-livree' },
      ECHOUEE: { label: 'Échouée', class: 'status-echouee' }
    };
    const config = statusConfig[statut] || { label: statut, class: '' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const handleRowClick = (livraison) => {
    if (onRowClick) onRowClick(livraison);
  };

  return (
    <div className="livraison-list-container">
      {/* ========== NOUVEAU : Boutons de filtre ========== */}
      <div className="filter-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterType('ALL')}
          className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
          style={{
            padding: '8px 16px',
            borderRadius: '30px',
            border: '1px solid #e2e8f0',
            background: filterType === 'ALL' ? '#1e293b' : 'white',
            color: filterType === 'ALL' ? 'white' : '#475569',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          Toutes ({livraisons.length})
        </button>
        <button
          onClick={() => setFilterType('CLIENT')}
          className={`filter-btn ${filterType === 'CLIENT' ? 'active' : ''}`}
          style={{
            padding: '8px 16px',
            borderRadius: '30px',
            border: '1px solid #e2e8f0',
            background: filterType === 'CLIENT' ? '#1e293b' : 'white',
            color: filterType === 'CLIENT' ? 'white' : '#475569',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          Commandes client ({clientCount})
        </button>
        <button
          onClick={() => setFilterType('TRANSFERT')}
          className={`filter-btn ${filterType === 'TRANSFERT' ? 'active' : ''}`}
          style={{
            padding: '8px 16px',
            borderRadius: '30px',
            background: filterType === 'TRANSFERT' ? '#1e293b' : 'white',
            color: filterType === 'TRANSFERT' ? 'white' : '#475569',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          Transferts sortants ({transfertCount})
        </button>
      </div>

      <div className="table-responsive">
        <table className="livraison-table">
          <thead>
            <tr>
              <th>N° BL</th>
              <th>Client / Transfert</th>
              <th>Adresse</th>
              <th>Statut</th>
              <th>Date assignation</th>
              {!readonly && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredLivraisons.map(liv => (
              <tr 
                key={liv.id} 
                onClick={() => handleRowClick(liv)}
                className="clickable-row"
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                <td className="bl-number">{liv.numeroBL}</td>
                <td>{getClientDisplayName(liv)}</td>
                <td className="address-cell">{liv.adresseLivraison}</td>
                <td>{getStatusBadge(liv.statut)}</td>
                <td>{formatDate(liv.dateAssignation)}</td>
                {!readonly && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-valider"
                      onClick={() => onValider(liv)}
                      disabled={liv.statut === 'LIVREE'}
                    >
                      {liv.statut === 'LIVREE' ? 'Déjà livrée' : 'Valider'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LivraisonList;