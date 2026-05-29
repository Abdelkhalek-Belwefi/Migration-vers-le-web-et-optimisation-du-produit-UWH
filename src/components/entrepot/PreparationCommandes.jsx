import React, { useState, useEffect } from 'react';
import { getCommandesByStatut, updateStatut, getCommandesTransfertAPreparer } from '../../services/commandeService';
import { stockService } from '../../services/stockService';
import '../../styles/warehouse-modules.css';
import { FaExchangeAlt } from 'react-icons/fa';
import { FaBox } from "react-icons/fa";
import { MdSync } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaMapMarkerAlt, FaBoxes } from "react-icons/fa";

const PreparationCommandes = () => {
  const [commandesClient, setCommandesClient] = useState([]);
  const [commandesTransfert, setCommandesTransfert] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransfert, setLoadingTransfert] = useState(true);
  const [error, setError] = useState('');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('client');
  const [articleStockMap, setArticleStockMap] = useState({});
  const [loadingStock, setLoadingStock] = useState(false);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      setLoadingTransfert(true);
      
      const commandesClientData = await getCommandesByStatut('EN_ATTENTE');
      setCommandesClient(commandesClientData);
      
      const commandesTransfertData = await getCommandesTransfertAPreparer();
      setCommandesTransfert(commandesTransfertData);
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setLoadingTransfert(false);
    }
  };

  useEffect(() => {
    loadCommandes();
  }, []);

  const loadArticleStockLocations = async (lignes) => {
    if (!lignes || lignes.length === 0) return;
    
    setLoadingStock(true);
    const stockMap = {};
    
    try {
      for (const ligne of lignes) {
        const articleId = ligne.articleId;
        if (!articleId) continue;
        
        try {
          const stocks = await stockService.getStocksByArticle(articleId);
          
          if (stocks && stocks.length > 0) {
            const stocksDisponibles = stocks.filter(s => s.quantite > 0);
            
            stockMap[articleId] = {
              designation: ligne.articleDesignation,
              code: ligne.articleCode,
              quantiteDemandee: ligne.quantite,
              emplacements: stocksDisponibles.map(s => ({
                lot: s.lot,
                emplacement: s.emplacement,
                quantite: s.quantite,
                statut: s.statut
              })),
              quantiteTotale: stocksDisponibles.reduce((sum, s) => sum + s.quantite, 0)
            };
          } else {
            stockMap[articleId] = {
              designation: ligne.articleDesignation,
              code: ligne.articleCode,
              quantiteDemandee: ligne.quantite,
              emplacements: [],
              quantiteTotale: 0,
              message: "⚠️ Aucun stock disponible"
            };
          }
        } catch (err) {
          console.error(`Erreur chargement stock pour article ${articleId}:`, err);
          stockMap[articleId] = {
            designation: ligne.articleDesignation,
            code: ligne.articleCode,
            quantiteDemandee: ligne.quantite,
            emplacements: [],
            quantiteTotale: 0,
            message: "❌ Erreur de chargement"
          };
        }
      }
      
      setArticleStockMap(stockMap);
    } catch (err) {
      console.error("Erreur globale:", err);
    } finally {
      setLoadingStock(false);
    }
  };

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

  const handleShowDetails = async (commande) => {
    setSelectedCommande(commande);
    setArticleStockMap({});
    await loadArticleStockLocations(commande.lignes);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCommande(null);
    setArticleStockMap({});
  };

  const totalClient = commandesClient.length;
  const totalTransfert = commandesTransfert.length;

  if (loading && loadingTransfert) return <div className="loading">Chargement des commandes...</div>;

  return (
    <div className="commande-management">
      <div className="preparation-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <h2>Préparation de commandes</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', background: '#dbeafe', color: '#1e40af' }}><FaBox /> Commandes client: {totalClient}</span>
          <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', background: '#fef3c7', color: '#92400e' }}><MdSync /> Transferts: {totalTransfert}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
        <button 
          style={{ background: 'transparent', border: 'none', padding: '10px 24px', fontSize: '0.9rem', fontWeight: '600', color: activeTab === 'client' ? '#3b82f6' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '30px 30px 0 0', borderBottom: activeTab === 'client' ? '2px solid #3b82f6' : 'none' }}
          onClick={() => setActiveTab('client')}
        >
          <FaBox /> Commandes client ({totalClient})
        </button>
        <button 
          style={{ background: 'transparent', border: 'none', padding: '10px 24px', fontSize: '0.9rem', fontWeight: '600', color: activeTab === 'transfert' ? '#3b82f6' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '30px 30px 0 0', borderBottom: activeTab === 'transfert' ? '2px solid #3b82f6' : 'none' }}
          onClick={() => setActiveTab('transfert')}
        >
          <FaExchangeAlt /> Transferts ({totalTransfert})
        </button>
      </div>

      {activeTab === 'client' && (
        <>
          {commandesClient.length === 0 ? (
            <p>Aucune commande client en attente.</p>
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
                {commandesClient.map(cmd => (
                  <tr key={cmd.id}>
                    <td>{cmd.numeroCommande}</td>
                    <td>{cmd.clientNom}</td>
                    <td>{new Date(cmd.dateCommande).toLocaleDateString()}</td>
                    <td>{cmd.lignes?.length || 0}</td>
                    <td>
                      <button className="btn-details" onClick={() => handleShowDetails(cmd)}>
                        <FaClipboardList /> Détails
                      </button>
                      <button className="btn-preparer" onClick={() => handlePreparer(cmd.id)}>
                        <FaCheckCircle /> Préparer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === 'transfert' && (
        <>
          {commandesTransfert.length === 0 ? (
            <p>Aucun transfert en attente de préparation.</p>
          ) : (
            <table className="commande-table">
              <thead>
                <tr>
                  <th>N° transfert</th>
                  <th>Entrepôt source</th>
                  <th>Entrepôt destination</th>
                  <th>Date demande</th>
                  <th>Articles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {commandesTransfert.map(cmd => (
                  <tr key={cmd.id}>
                    <td>{cmd.numeroCommande}</td>
                    <td>{cmd.entrepotSourceNom || `Entrepôt #${cmd.entrepotSourceId}`}</td>
                    <td>{cmd.entrepotDestinationNom || `Entrepôt #${cmd.entrepotDestinationId}`}</td>
                    <td>{new Date(cmd.dateCommande).toLocaleDateString()}</td>
                    <td>{cmd.lignes?.length || 0}</td>
                    <td>
                      <button className="btn-details" onClick={() => handleShowDetails(cmd)}>
                        <FaClipboardList /> Détails
                      </button>
                      <button className="btn-preparer" onClick={() => handlePreparer(cmd.id)}>
                        <FaCheckCircle /> Préparer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {showModal && selectedCommande && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: '850px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails de la commande {selectedCommande.numeroCommande}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {selectedCommande.typeCommande === 'TRANSFERT' ? (
                <>
                  <p><strong>Type :</strong> Transfert entre entrepôts</p>
                  <p><strong>Entrepôt demandeur :</strong> {selectedCommande.entrepotDestinationNom || `Entrepôt #${selectedCommande.entrepotDestinationId}`}</p>
                  <p><strong>Entrepôt fournisseur :</strong> {selectedCommande.entrepotSourceNom || `Entrepôt #${selectedCommande.entrepotSourceId}`}</p>
                </>
              ) : (
                <p><strong>Client :</strong> {selectedCommande.clientNom}</p>
              )}
              <p><strong>Date de commande :</strong> {new Date(selectedCommande.dateCommande).toLocaleString()}</p>
              <p><strong>Date de livraison souhaitée :</strong> {selectedCommande.dateLivraisonSouhaitee ? new Date(selectedCommande.dateLivraisonSouhaitee).toLocaleDateString() : 'Non spécifiée'}</p>
              <p><strong>Notes :</strong> {selectedCommande.notes || 'Aucune'}</p>
              
              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Articles à préparer</h4>
              
              {loadingStock ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div className="loading-spinner-small"></div>
                  <p>Chargement des stocks...</p>
                </div>
              ) : (
                <table className="detail-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Désignation</th>
                      <th>Qté commandée</th>
                      <th>Stock dispo</th>
                      <th>Emplacements (Lot - Quantité)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCommande.lignes?.map((ligne, idx) => {
                      const stockInfo = articleStockMap[ligne.articleId];
                      const estInsuffisant = stockInfo && stockInfo.quantiteTotale < ligne.quantite;
                      return (
                        <tr key={idx} style={{ backgroundColor: estInsuffisant ? '#fef2f2' : 'transparent' }}>
                          <td style={{ fontWeight: '500' }}>{ligne.articleCode}</td>
                          <td>{ligne.articleDesignation}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{ligne.quantite}</td>
                          <td style={{ textAlign: 'center' }}>
                            {stockInfo ? (
                              <span style={{ 
                                color: stockInfo.quantiteTotale >= ligne.quantite ? '#10b981' : '#dc2626',
                                fontWeight: 'bold'
                              }}>
                                {stockInfo.quantiteTotale} u
                                {estInsuffisant && (
                                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#dc2626' }}>
                                    Manque {ligne.quantite - stockInfo.quantiteTotale} u
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>...</span>
                            )}
                          </td>
                          <td>
                            {stockInfo && stockInfo.emplacements && stockInfo.emplacements.length > 0 ? (
                              <div style={{ fontSize: '0.8rem' }}>
                                {stockInfo.emplacements.map((emp, i) => (
                                  <div key={i} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '4px 0',
                                    borderBottom: i < stockInfo.emplacements.length - 1 ? '1px solid #e2e8f0' : 'none'
                                  }}>
                                    <span><FaMapMarkerAlt style={{ color: '#3b82f6' }} /> {emp.emplacement}</span>
                                    <span><FaBoxes /> Lot: {emp.lot}</span>
                                    <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{emp.quantite} u</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                {stockInfo?.message || 'Aucun stock trouvé'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-preparer" onClick={() => handlePreparer(selectedCommande.id)}>
                <FaCheckCircle /> Valider la préparation
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