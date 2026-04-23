import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiNavigation, FiClock } from 'react-icons/fi';
import './LivraisonList.css';

const LivraisonList = ({ livraisons, onValider, readonly = false }) => {
  if (!livraisons.length) return <div className="text-center p-10 text-slate-400">Aucune mission trouvée</div>;

  return (
    <div className="td-livraison-list">
      <div className="td-table-wrapper">
        <table className="td-livraison-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Destination</th>
              <th>Code OTP</th>
              <th>État</th>
              {!readonly && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {livraisons.map((liv, idx) => (
              <motion.tr 
                key={liv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <td><span className="font-bold">#{liv.numeroBL}</span></td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold">{liv.clientNom}</span>
                    <span className="text-xs text-slate-500">{liv.adresseLivraison}</span>
                  </div>
                </td>
                <td><span className="td-otp-display">{liv.codeOtp}</span></td>
                <td>
                  <span className={`td-status-badge ${liv.statut.toLowerCase()}`}>
                    {liv.statut === 'LIVREE' ? <FiCheck /> : <FiClock />}
                    {liv.statut}
                  </span>
                </td>
                {!readonly && (
                  <td>
                    <button onClick={() => onValider(liv)} className="td-btn-validate">
                      Valider <FiNavigation />
                    </button>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LivraisonList;