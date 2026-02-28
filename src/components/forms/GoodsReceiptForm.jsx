import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/form.css";

const GoodsReceiptForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    reference: "",
    productName: "",
    category: "",
    quantity: "",
    unitPrice: "",
    supplier: "",
    batchNumber: "",
    expiryDate: "",
    location: "",
    notes: ""
  });

  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productName: "",
    quantity: "",
    unitPrice: "",
    batchNumber: ""
  });

  const categories = [
    "Électronique",
    "Informatique",
    "Mobilier",
    "Fournitures de bureau",
    "Produits alimentaires",
    "Produits chimiques",
    "Pièces détachées",
    "Emballages",
    "Textile",
    "Autre"
  ];

  const suppliers = [
    "Fournisseur A",
    "Fournisseur B", 
    "Fournisseur C",
    "Fournisseur D",
    "Autre"
  ];

  const locations = [
    "A1-01", "A1-02", "A1-03", "A1-04",
    "B2-01", "B2-02", "B2-03", "B2-04",
    "C3-01", "C3-02", "C3-03", "C3-04",
    "D4-01", "D4-02", "D4-03", "D4-04"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (e) => {
    setCurrentItem({
      ...currentItem,
      [e.target.name]: e.target.value
    });
  };

  const addItem = () => {
    if (!currentItem.productName || !currentItem.quantity) {
      setError("Veuillez remplir le nom du produit et la quantité");
      return;
    }

    const newItem = {
      ...currentItem,
      id: Date.now(),
      total: (parseFloat(currentItem.quantity) * parseFloat(currentItem.unitPrice || 0)).toFixed(2)
    };

    setItems([...items, newItem]);
    setCurrentItem({
      productName: "",
      quantity: "",
      unitPrice: "",
      batchNumber: ""
    });
    setError("");
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError("Veuillez ajouter au moins un article");
      return;
    }

    setLoading(true);
    setError("");

    const receiptData = {
      reference: formData.reference || `GR-${Date.now()}`,
      date: new Date().toISOString(),
      supplier: formData.supplier,
      location: formData.location,
      notes: formData.notes,
      items: items,
      totalAmount: calculateTotal(),
      status: "completed"
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8080/api/goods-receipt",
        receiptData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      setError("Erreur lors de l'enregistrement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Retour
        </button>
        <h2>Goods Receipt - Réception de marchandises</h2>
      </div>

      {success && (
        <div className="success-message">
          ✅ Réception enregistrée avec succès ! Redirection...
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="goods-receipt-form">
        {/* Informations générales */}
        <div className="form-section">
          <h3>Informations générales</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Référence *</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="GR-20250224-001"
              />
              <small>Laisser vide pour génération automatique</small>
            </div>

            <div className="form-group">
              <label>Fournisseur *</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Emplacement de stockage *</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un emplacement</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date de réception</label>
              <input
                type="text"
                value={new Date().toLocaleDateString('fr-FR')}
                disabled
                className="readonly"
              />
            </div>
          </div>
        </div>

        {/* Ajout d'articles */}
        <div className="form-section">
          <h3>Ajouter un article</h3>
          
          <div className="add-item-grid">
            <div className="form-group">
              <label>code_barre du produit *</label>
              <input
                type="text"
                name="productName"
                value={currentItem.productName}
                onChange={handleItemChange}
                placeholder="Nom du produit"
              />
            </div>

            <div className="form-group">
              <label>Quantité *</label>
              <input
                type="number"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleItemChange}
                placeholder="0"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Prix unitaire (€)</label>
              <input
                type="number"
                name="unitPrice"
                value={currentItem.unitPrice}
                onChange={handleItemChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>N° de lot</label>
              <input
                type="text"
                name="batchNumber"
                value={currentItem.batchNumber}
                onChange={handleItemChange}
                placeholder="Lot-001"
              />
            </div>

            <button type="button" className="add-item-btn" onClick={addItem}>
              + Ajouter cet article
            </button>
          </div>
        </div>

        {/* Liste des articles ajoutés */}
        {items.length > 0 && (
          <div className="form-section">
            <h3>Articles ajoutés ({items.length})</h3>
            
            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                    <th>Lot</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitPrice ? `${item.unitPrice} €` : '-'}</td>
                      <td>{item.total} €</td>
                      <td>{item.batchNumber || '-'}</td>
                      <td>
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right"><strong>Total général:</strong></td>
                    <td><strong>{calculateTotal()} €</strong></td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="form-section">
          <div className="form-group">
            <label>Notes / Commentaires</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Informations supplémentaires..."
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate("/dashboard")}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Valider la réception"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoodsReceiptForm;