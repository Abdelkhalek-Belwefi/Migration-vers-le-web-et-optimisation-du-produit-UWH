import React, { useState, useEffect } from 'react';
import { receptionService } from '../../services/receptionService';
import { articleService } from '../../services/articleService';
import { gs1Service } from '../../services/gs1Service';
import './styles/ReceptionForm.css';

const ReceptionForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        numeroPO: '',
        fournisseur: '',
        bonLivraison: '',
        dateReception: new Date().toISOString().split('T')[0],
        lignes: []
    });
    const [currentLine, setCurrentLine] = useState({
        articleId: '',
        quantiteAttendue: '',
        quantiteRecue: '',
        lot: '',
        dateExpiration: '',
        emplacementDestination: ''
    });
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [scanLoading, setScanLoading] = useState(false);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        try {
            const data = await articleService.getAllArticles();
            setArticles(data);
        } catch (err) {
            console.error('Erreur chargement articles:', err);
        }
    };

    // ===== GESTION DU SCAN =====
    const handleScan = async (e) => {
        const scannedCode = e.target.value;
        if (!scannedCode || scannedCode.length < 3) return;

        setScanLoading(true);

        try {
            // 1. Vérifier si c'est un numéro de PO
            if (scannedCode.toUpperCase().startsWith('PO-')) {
                try {
                    const reception = await receptionService.getReceptionByPO(scannedCode);
                    if (reception) {
                        alert(`La réception ${scannedCode} existe déjà. Vous pouvez la modifier.`);
                    }
                } catch (err) {
                    // PO non trouvé, on le met dans le champ
                    setFormData({
                        ...formData,
                        numeroPO: scannedCode
                    });
                }
            } 
            // 2. Essayer de décoder comme code GS1
            else {
                const gs1Data = await gs1Service.decodeGS1(scannedCode);
                
                if (gs1Data && gs1Data.gtin) {
                    const article = articles.find(a => 
                        a.gtin === gs1Data.gtin || a.codeArticleERP === gs1Data.gtin
                    );
                    
                    if (article) {
                        setCurrentLine({
                            articleId: article.id.toString(),
                            quantiteAttendue: gs1Data.quantite ? gs1Data.quantite.toString() : '1',
                            quantiteRecue: gs1Data.quantite ? gs1Data.quantite.toString() : '1',
                            lot: gs1Data.lot || '',
                            dateExpiration: gs1Data.dateExpiration || '',
                            emplacementDestination: ''
                        });
                        
                        alert(`✅ Article trouvé : ${article.designation}`);
                    } else {
                        setError('Article non trouvé pour ce code GS1');
                    }
                } else {
                    setError('Format de code non reconnu');
                }
            }
        } catch (err) {
            console.error('Erreur scan:', err);
            setError('Erreur lors du décodage du code');
        } finally {
            setScanLoading(false);
            e.target.value = ''; // Vider le champ
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLineChange = (e) => {
        setCurrentLine({
            ...currentLine,
            [e.target.name]: e.target.value
        });
    };

    const handleAddLine = () => {
        if (!currentLine.articleId) {
            alert('Veuillez sélectionner un article');
            return;
        }

        const quantiteAttendue = parseInt(currentLine.quantiteAttendue);
        if (isNaN(quantiteAttendue) || quantiteAttendue <= 0) {
            alert('La quantité commandée doit être un nombre valide supérieur à 0');
            return;
        }

        const quantiteRecue = currentLine.quantiteRecue ? parseInt(currentLine.quantiteRecue) : 0;
        const selectedArticle = articles.find(a => a.id === parseInt(currentLine.articleId));
        
        if (!selectedArticle) {
            alert('Article sélectionné invalide');
            return;
        }

        const newLine = {
            articleId: parseInt(currentLine.articleId),
            quantiteAttendue: quantiteAttendue,
            quantiteRecue: quantiteRecue,
            lot: currentLine.lot || null,
            dateExpiration: currentLine.dateExpiration || null,
            emplacementDestination: currentLine.emplacementDestination || null,
            articleCode: selectedArticle.codeArticleERP,
            articleDesignation: selectedArticle.designation
        };

        setFormData({
            ...formData,
            lignes: [...formData.lignes, newLine]
        });

        setCurrentLine({
            articleId: '',
            quantiteAttendue: '',
            quantiteRecue: '',
            lot: '',
            dateExpiration: '',
            emplacementDestination: ''
        });
    };

    const handleRemoveLine = (index) => {
        const newLines = [...formData.lignes];
        newLines.splice(index, 1);
        setFormData({ ...formData, lignes: newLines });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.lignes.length === 0) {
            alert('Ajoutez au moins une ligne d\'article');
            return;
        }

        if (!formData.numeroPO.trim()) {
            alert('Le numéro de bon de commande est obligatoire');
            return;
        }

        // ✅ Conversion des dates au format ISO standard
        const receptionData = {
            numeroPO: formData.numeroPO,
            fournisseur: formData.fournisseur || null,
            bonLivraison: formData.bonLivraison || null,
            dateReception: formData.dateReception 
                ? new Date(formData.dateReception + 'T12:00:00').toISOString() 
                : new Date().toISOString(),
            lignes: formData.lignes.map(line => ({
                articleId: line.articleId,
                quantiteAttendue: line.quantiteAttendue,
                quantiteRecue: line.quantiteRecue,
                lot: line.lot,
                dateExpiration: line.dateExpiration 
                    ? new Date(line.dateExpiration + 'T12:00:00').toISOString() 
                    : null,
                emplacementDestination: line.emplacementDestination
            }))
        };

        console.log('📤 Données envoyées:', JSON.stringify(receptionData, null, 2));

        setLoading(true);
        setError('');

        try {
            const result = await receptionService.createReception(receptionData);
            setSuccess('Réception créée avec succès !');
            setTimeout(() => {
                if (onSuccess) onSuccess(result);
            }, 1500);
        } catch (err) {
            console.error('❌ Erreur création:', err);
            setError(err.response?.data?.message || err.message || 'Erreur lors de la création');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reception-form-container">
            <h2>📥 Nouvelle réception</h2>

            {/* ✅ ZONE DE SCAN */}
            <div className="scan-section">
                <h3>📷 Scanner un code</h3>
                <div className="scan-input-wrapper">
                    <input
                        type="text"
                        placeholder="Scannez le code-barres (PO, article ou GS1)..."
                        onBlur={handleScan}
                        onKeyPress={(e) => e.key === 'Enter' && handleScan(e)}
                        disabled={scanLoading}
                        autoFocus
                    />
                    {scanLoading && <span className="scan-spinner">🔍</span>}
                </div>
                <p className="scan-help">
                    Formats supportés :<br />
                    • PO-XXXX : charge une réception existante<br />
                    • Code GS1 : pré-remplit l'article, le lot et la date
                </p>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Informations générales</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>N° Bon de commande *</label>
                            <input
                                type="text"
                                name="numeroPO"
                                value={formData.numeroPO}
                                onChange={handleInputChange}
                                required
                                placeholder="PO-2025-001"
                            />
                        </div>
                        <div className="form-group">
                            <label>Fournisseur</label>
                            <input
                                type="text"
                                name="fournisseur"
                                value={formData.fournisseur}
                                onChange={handleInputChange}
                                placeholder="Nom du fournisseur"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Bon de livraison</label>
                            <input
                                type="text"
                                name="bonLivraison"
                                value={formData.bonLivraison}
                                onChange={handleInputChange}
                                placeholder="BL-2025-001"
                            />
                        </div>
                        <div className="form-group">
                            <label>Date réception</label>
                            <input
                                type="date"
                                name="dateReception"
                                value={formData.dateReception}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Articles reçus</h3>
                    
                    <div className="line-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Article *</label>
                                <select
                                    name="articleId"
                                    value={currentLine.articleId}
                                    onChange={handleLineChange}
                                >
                                    <option value="">Sélectionner...</option>
                                    {articles.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.codeArticleERP} - {a.designation}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Qté commandée *</label>
                                <input
                                    type="number"
                                    name="quantiteAttendue"
                                    value={currentLine.quantiteAttendue}
                                    onChange={handleLineChange}
                                    min="1"
                                    placeholder="1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Qté reçue</label>
                                <input
                                    type="number"
                                    name="quantiteRecue"
                                    value={currentLine.quantiteRecue}
                                    onChange={handleLineChange}
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Lot</label>
                                <input
                                    type="text"
                                    name="lot"
                                    value={currentLine.lot}
                                    onChange={handleLineChange}
                                    placeholder="LOT-001"
                                />
                            </div>
                            <div className="form-group">
                                <label>Date expiration</label>
                                <input
                                    type="date"
                                    name="dateExpiration"
                                    value={currentLine.dateExpiration}
                                    onChange={handleLineChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Emplacement</label>
                                <input
                                    type="text"
                                    name="emplacementDestination"
                                    value={currentLine.emplacementDestination}
                                    onChange={handleLineChange}
                                    placeholder="RAYON-A-01"
                                />
                            </div>
                            <div className="form-group">
                                <button 
                                    type="button" 
                                    className="btn-add-line"
                                    onClick={handleAddLine}
                                >
                                    ➕ Ajouter
                                </button>
                            </div>
                        </div>
                    </div>

                    {formData.lignes.length > 0 && (
                        <div className="lines-table-container">
                            <table className="lines-table">
                                <thead>
                                    <tr>
                                        <th>Article</th>
                                        <th>Qté commandée</th>
                                        <th>Qté reçue</th>
                                        <th>Lot</th>
                                        <th>Expiration</th>
                                        <th>Emplacement</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.lignes.map((line, index) => (
                                        <tr key={index}>
                                            <td>{line.articleCode} - {line.articleDesignation}</td>
                                            <td>{line.quantiteAttendue}</td>
                                            <td>{line.quantiteRecue}</td>
                                            <td>{line.lot || '-'}</td>
                                            <td>{line.dateExpiration ? new Date(line.dateExpiration).toLocaleDateString() : '-'}</td>
                                            <td>{line.emplacementDestination || '-'}</td>
                                            <td>
                                                <button 
                                                    type="button"
                                                    className="btn-remove"
                                                    onClick={() => handleRemoveLine(index)}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>
                        Annuler
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Création...' : 'Créer la réception'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReceptionForm;