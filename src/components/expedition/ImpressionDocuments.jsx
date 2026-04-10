import React, { useState, useEffect } from 'react';
import { getMesExpeditions } from '../../services/expeditionService';
import { FaFileAlt, FaPrint, FaBox } from 'react-icons/fa';

const ImpressionDocuments = () => {
  const [bls, setBls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExpeditions = async () => {
    try {
      setLoading(true);
      const data = await getMesExpeditions();
      const formattedBls = data.map(exp => ({
        id: exp.id,
        numeroBL: exp.numeroBL,
        commandeNumero: exp.commandeNumero,
        clientNom: exp.clientNom,
        dateExpedition: exp.dateExpedition
      }));
      setBls(formattedBls);
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
                  <FaPrint style={{ marginRight: '5px' }} /> Imprimer
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