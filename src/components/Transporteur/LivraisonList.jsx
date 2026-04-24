import React from 'react';
import './LivraisonList.css';

const LivraisonList = ({ livraisons, onValider, onRowClick, readonly = false }) => {
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
      <div className="table-responsive">
        <table className="livraison-table">
          <thead>
            <tr>
              <th>N° BL</th>
              <th>Client</th>
              <th>Adresse</th>
              <th>Statut</th>
              <th>Date assignation</th>
              {!readonly && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {livraisons.map(liv => (
              <tr 
                key={liv.id} 
                onClick={() => handleRowClick(liv)}
                className="clickable-row"
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                <td className="bl-number">{liv.numeroBL}</td>
                <td>{liv.clientNom}</td>
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