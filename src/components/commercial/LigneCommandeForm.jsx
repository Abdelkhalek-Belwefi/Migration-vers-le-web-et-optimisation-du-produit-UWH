import React from 'react';
import './styles/commande.css';

const LigneCommandeForm = ({ ligne, index, articles, onChange, onRemove }) => (
  <div className="ligne-commande-form">
    <div className="form-row">
      <div className="form-group"><label>Article</label><select value={ligne.articleId} onChange={(e) => onChange(index, 'articleId', e.target.value)} required>
        <option value="">Choisir...</option>
        {articles.map(a => <option key={a.id} value={a.id}>{a.code} - {a.designation}</option>)}
      </select></div>
      <div className="form-group"><label>Quantité</label><input type="number" min="1" value={ligne.quantite} onChange={(e) => onChange(index, 'quantite', e.target.value)} required /></div>
      <div className="form-group"><label>Prix unitaire</label><input type="number" step="0.01" value={ligne.prixUnitaire} onChange={(e) => onChange(index, 'prixUnitaire', e.target.value)} placeholder="Auto" /></div>
      <button type="button" className="btn-remove" onClick={() => onRemove(index)}>✖</button>
    </div>
  </div>
);

export default LigneCommandeForm;