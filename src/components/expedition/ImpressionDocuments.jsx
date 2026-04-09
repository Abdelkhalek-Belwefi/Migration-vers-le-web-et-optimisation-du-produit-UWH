import React, { useState, useEffect } from 'react';

const ImpressionDocuments = () => {
  const [bls, setBls] = useState([]);

  const loadBls = () => {
    const stored = localStorage.getItem('bonsLivraison');
    if (stored) {
      setBls(JSON.parse(stored));
    } else {
      setBls([]);
    }
  };

  useEffect(() => {
    loadBls();
    window.addEventListener('storage', loadBls);
    return () => window.removeEventListener('storage', loadBls);
  }, []);

  const imprimerBl = async (expeditionId) => {
    const url = `http://localhost:8080/api/expeditions/${expeditionId}/print`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // si votre API est sécurisée
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

  const supprimerBl = (id) => {
    const nouveaux = bls.filter(bl => bl.id !== id);
    localStorage.setItem('bonsLivraison', JSON.stringify(nouveaux));
    setBls(nouveaux);
  };

  if (bls.length === 0) {
    return (
      <div className="module-container">
        <h2>Impression des documents</h2>
        <div className="coming-soon">
          <div className="coming-soon-icon">🖨️</div>
          <h3>Aucun bon de livraison généré</h3>
          <p>Les bons de livraison apparaîtront ici après chaque expédition.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <h2>📄 Bons de livraison générés</h2>
      <table className="expedition-table">
        <thead>
          <tr>
            <th>N° BL</th>
            <th>Commande N°</th>
            <th>Client</th>
            <th>Date d'expédition</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bls.map(bl => (
            <tr key={bl.id}>
              <td>{bl.numeroBL}</td>
              <td>{bl.commandeNumero}</td>
              <td>{bl.clientNom}</td>
              <td>{new Date(bl.dateExpedition).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn-expedier"
                  onClick={() => imprimerBl(bl.id)}
                  style={{ marginRight: '8px' }}
                >
                  🖨️ Imprimer
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => supprimerBl(bl.id)}
                >
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImpressionDocuments;