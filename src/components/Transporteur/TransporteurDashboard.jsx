// TransporteurDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getLivraisonsEnCours, getHistoriqueLivraisons } from "../../services/transporteurService";
import LivraisonList from './LivraisonList';
import ValidationModal from './ValidationModal';

const TransporteurDashboard = ({ view = "en-cours" }) => {
  const [livraisons, setLivraisons] = useState([]);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [view]);

  const loadData = async () => {
    try {
      const data = view === "en-cours" 
        ? await getLivraisonsEnCours() 
        : await getHistoriqueLivraisons();
      setLivraisons(data);
    } catch (error) {
      console.error("Erreur chargement", error);
    }
  };

  const handleValider = (livraison) => {
    setSelectedLivraison(livraison);
    setShowModal(true);
  };

  const handleValidationSuccess = () => {
    setShowModal(false);
    loadData();
  };

  return (
    <div className="transporteur-container">
      <h2 className="text-xl font-bold mb-4">
        {view === "en-cours" ? "📦 Livraisons en cours" : "✅ Historique des livraisons"}
      </h2>
      <LivraisonList 
        livraisons={livraisons} 
        onValider={handleValider} 
        readonly={view !== "en-cours"} 
      />
      {showModal && (
        <ValidationModal
          livraison={selectedLivraison}
          onClose={() => setShowModal(false)}
          onSuccess={handleValidationSuccess}
        />
      )}
    </div>
  );
};

export default TransporteurDashboard;