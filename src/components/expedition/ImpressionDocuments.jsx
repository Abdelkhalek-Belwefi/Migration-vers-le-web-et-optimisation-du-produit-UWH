import React, { useState, useEffect } from 'react';
import { getMesExpeditions } from '../../services/expeditionService';
import { FaFileAlt, FaPrint, FaBox, FaSearch, FaTimes } from 'react-icons/fa';

const ImpressionDocuments = () => {
  const [bls, setBls] = useState([]);
  const [filteredBls, setFilteredBls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // ========== État pour le filtre par type ==========
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'CLIENT', 'TRANSFERT'

  const loadExpeditions = async () => {
    try {
      setLoading(true);
      const data = await getMesExpeditions();
      
      // Trier par date d'expédition décroissante (la plus récente en premier)
      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.dateExpedition);
        const dateB = new Date(b.dateExpedition);
        return dateB - dateA;
      });
      
      const formattedBls = sortedData.map(exp => ({
        id: exp.id,
        numeroBL: exp.numeroBL,
        commandeNumero: exp.commandeNumero,
        clientNom: exp.clientNom,
        dateExpedition: exp.dateExpedition,
        typeCommande: exp.typeCommande,
        entrepotDestinationNom: exp.entrepotDestinationNom  // ← AJOUT : nom de l'entrepôt destinataire
      }));
      
      setBls(formattedBls);
      setFilteredBls(formattedBls);
      setError('');
    } catch (err) {
      console.error('Erreur chargement expéditions:', err);
      setError('Impossible de charger la liste des expéditions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpeditions();
  }, []);

  // Filtrer les expéditions en fonction du terme de recherche ET du type
  useEffect(() => {
    let filtered = [...bls];
    
    // Filtre par type (client / transfert)
    if (filterType === 'CLIENT') {
      filtered = filtered.filter(bl => bl.typeCommande === 'CLIENT');
    } else if (filterType === 'TRANSFERT') {
      filtered = filtered.filter(bl => bl.typeCommande === 'TRANSFERT');
    }
    
    // Filtre par recherche (N° BL ou N° commande)
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(bl => 
        bl.numeroBL.toLowerCase().includes(lowerSearchTerm) ||
        bl.commandeNumero.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredBls(filtered);
  }, [searchTerm, bls, filterType]);

  // ========== Fonction pour afficher le client ou l'entrepôt destinataire ==========
  const getClientDisplayName = (bl) => {
    if (bl.typeCommande === 'TRANSFERT') {
      return bl.entrepotDestinationNom || 'Entrepôt destinataire';
    }
    return bl.clientNom;
  };

  // Compter les expéditions par type
  const clientCount = bls.filter(bl => bl.typeCommande === 'CLIENT').length;
  const transfertCount = bls.filter(bl => bl.typeCommande === 'TRANSFERT').length;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleResetSearch = () => {
    setSearchTerm('');
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const imprimerBl = async (expeditionId) => {
    const url = `http://localhost:8080/api/expeditions/${expeditionId}/print`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      const html = await response.text();
      const newWindow = window.open();
      newWindow.document.write(html);
      newWindow.document.close();
    } catch (error) {
      console.error('Erreur lors de l\'impression :', error);
      alert(`Impossible de charger le document. Vérifiez que le backend est démarré (port 8080) et que l'expédition existe.`);
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <h2>Impression des documents</h2>
        <div className="loading">Chargement des expéditions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-container">
        <h2>Impression des documents</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (bls.length === 0) {
    return (
      <div className="module-container">
        <h2>Impression des documents</h2>
        <div className="coming-soon">
          <div className="coming-soon-icon"><FaPrint size={48} /></div>
          <h3>Aucun bon de livraison généré</h3>
          <p>Les bons de livraison apparaîtront ici après chaque expédition.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <h2><FaFileAlt style={{ marginRight: '8px' }} /> Bons de livraison générés</h2>
      
      {/* Boutons de filtre Client/Transfert */}
      <div className="filter-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleFilterChange('ALL')}
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
          Toutes ({bls.length})
        </button>
        <button
          onClick={() => handleFilterChange('CLIENT')}
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
          onClick={() => handleFilterChange('TRANSFERT')}
          className={`filter-btn ${filterType === 'TRANSFERT' ? 'active' : ''}`}
          style={{
            padding: '8px 16px',
            borderRadius: '30px',
            border: '1px solid #e2e8f0',
            background: filterType === 'TRANSFERT' ? '#1e293b' : 'white',
            color: filterType === 'TRANSFERT' ? 'white' : '#475569',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          Transferts ({transfertCount})
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-section" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <div className="search-form" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
            <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Rechercher par N° BL ou N° commande..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ 
                paddingLeft: '35px', 
                width: '100%', 
                padding: '10px 10px 10px 35px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {searchTerm && (
              <button
                onClick={handleResetSearch}
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#999' 
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {filteredBls.length} résultat(s) sur {bls.length}
          </div>
          {searchTerm && (
            <button 
              onClick={handleResetSearch}
              className="btn-reset"
              style={{
                padding: '8px 16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <table className="expedition-table">
        <thead>
          <tr>
            <th>N° BL</th>
            <th>Commande N°</th>
            <th>Client / Entrepôt destinataire</th>
            <th>Type</th>
            <th>Date d'expédition</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBls.map(bl => (
            <tr key={bl.id}>
              <td>{bl.numeroBL}</td>
              <td>{bl.commandeNumero}</td>
              <td>{getClientDisplayName(bl)}</td>
              <td>
                {bl.typeCommande === 'TRANSFERT' ? (
                  <span className="badge-transfert" style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Transfert</span>
                ) : (
                  <span className="badge-client" style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Client</span>
                )}
              </td>
              <td>{new Date(bl.dateExpedition).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn-expedier"
                  onClick={() => imprimerBl(bl.id)}
                  style={{ marginRight: '8px' }}
                >
                  <FaPrint style={{ marginRight: '5px' }} /> Imprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredBls.length === 0 && searchTerm && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          Aucun bon de livraison trouvé pour "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ImpressionDocuments;