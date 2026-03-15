import React, { useState, useEffect } from "react";
import { receptionService } from "../../services/receptionService";
import { articleService } from "../../services/articleService";
import "./styles/ReceptionLineForm.css";

import {
  FaPlus,
  FaEdit,
  FaSave,
  FaTimes
} from "react-icons/fa";

const ReceptionLineForm = ({ receptionId, onLineAdded, onCancel, editingLine }) => {

  const [formData, setFormData] = useState({
    articleId: "",
    quantiteAttendue: 0,
    quantiteRecue: 0,
    lot: "",                         // ✅ Champ lot
    emplacementDestination: ""
  });

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadArticles();

    if (editingLine) {
      setFormData({
        articleId: editingLine.articleId,
        quantiteAttendue: editingLine.quantiteAttendue,
        quantiteRecue: editingLine.quantiteRecue,
        lot: editingLine.lot || "",           // ✅ Pré-remplir le lot
        emplacementDestination: editingLine.emplacementDestination || ""
      });
    }
  }, [editingLine]);

  const loadArticles = async () => {
    try {
      const data = await articleService.getAllArticles();
      setArticles(data);
    } catch (err) {
      console.error("Erreur chargement articles:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingLine) {
        await receptionService.updateLine(
          editingLine.id,
          formData.quantiteRecue,
          formData.lot,                // ✅ Lot inclus
          null,
          formData.emplacementDestination
        );
      } else {
        await receptionService.addLine(receptionId, {
          articleId: parseInt(formData.articleId),
          quantiteAttendue: parseInt(formData.quantiteAttendue),
          quantiteRecue: parseInt(formData.quantiteRecue),
          lot: formData.lot,            // ✅ Lot inclus
          emplacementDestination: formData.emplacementDestination
        });
      }
      onLineAdded();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="line-form-container">
      <h4>
        {editingLine ? <><FaEdit /> Modifier la ligne</> : <><FaPlus /> Ajouter un article</>}
      </h4>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Article *</label>
            {editingLine ? (
              <input
                type="text"
                value={`${editingLine.articleCode} - ${editingLine.articleDesignation}`}
                disabled
              />
            ) : (
              <select
                name="articleId"
                value={formData.articleId}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner...</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.codeArticleERP} - {a.designation}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label>Quantité commandée *</label>
            <input
              type="number"
              name="quantiteAttendue"
              value={formData.quantiteAttendue}
              onChange={handleChange}
              min="1"
              required
              disabled={editingLine}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Quantité reçue</label>
            <input
              type="number"
              name="quantiteRecue"
              value={formData.quantiteRecue}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Lot</label>                 {/* ✅ Libellé Lot */}
            <input
              type="text"
              name="lot"
              value={formData.lot}
              onChange={handleChange}
              placeholder="LOT-001"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label>Emplacement destination</label>
            <input
              type="text"
              name="emplacementDestination"
              value={formData.emplacementDestination}
              onChange={handleChange}
              placeholder="RAYON-A-01"
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            <FaTimes /> Annuler
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            <FaSave /> {loading ? "Enregistrement..." : editingLine ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReceptionLineForm;