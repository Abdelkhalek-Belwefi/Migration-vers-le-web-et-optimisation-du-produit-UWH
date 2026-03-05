import React, { useState, useEffect, useRef } from 'react';
import { 
    FaSave, 
    FaTimes, 
    FaBarcode,
    FaWeight,
    FaCube,
    FaCalendarAlt,
    FaTag,
    FaCamera,
    FaBoxOpen,
    FaFont,
    FaAlignLeft,
    FaList
} from 'react-icons/fa';
import { articleService } from '../../services/articleService';
import './styles/AddArticleModal.css';

const AddArticleModal = ({ 
    show, 
    onClose, 
    onArticleAdded, 
    articleToEdit = null, 
    isEditMode = false,
    roles 
}) => {
    // État du formulaire
    const [formData, setFormData] = useState({
        id: null,
        codeArticleERP: '',
        gtin: '',
        designation: '',
        description: '',
        category: '',
        uniteMesure: '',
        poids: 0,
        volume: 0,
        lotDefaut: '',
        dureeExpirationJours: '',
        actif: true
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [scanning, setScanning] = useState(false);
    
    const scanInputRef = useRef(null);
    const formRef = useRef(null);

    // Charger les données si on est en mode édition
    useEffect(() => {
        if (articleToEdit && isEditMode) {
            console.log('📝 Mode édition - Chargement article:', articleToEdit);
            setFormData({
                id: articleToEdit.id,
                codeArticleERP: articleToEdit.codeArticleERP || '',
                gtin: articleToEdit.gtin || '',
                designation: articleToEdit.designation || '',
                description: articleToEdit.description || '',
                category: articleToEdit.category || '',
                uniteMesure: articleToEdit.uniteMesure || '',
                poids: articleToEdit.poids || 0,
                volume: articleToEdit.volume || 0,
                lotDefaut: articleToEdit.lotDefaut || '',
                dureeExpirationJours: articleToEdit.dureeExpirationJours || '',
                actif: articleToEdit.actif !== undefined ? articleToEdit.actif : true
            });
        } else {
            // Reset en mode ajout
            resetForm();
        }
    }, [articleToEdit, isEditMode, show]);

    // Focus sur le champ de scan quand le modal s'ouvre
    useEffect(() => {
        if (show && scanInputRef.current) {
            setTimeout(() => {
                scanInputRef.current.focus();
            }, 100);
        }
    }, [show]);

    // Reset du formulaire
    const resetForm = () => {
        setFormData({
            id: null,
            codeArticleERP: '',
            gtin: '',
            designation: '',
            description: '',
            category: '',
            uniteMesure: '',
            poids: 0,
            volume: 0,
            lotDefaut: '',
            dureeExpirationJours: '',
            actif: true
        });
        setError('');
        setSuccess('');
    };

    /**
     * Décode un code-barres (EAN-13, GTIN-14 ou GS1 complet)
     */
    const decodeBarcode = (barcode) => {
        console.log('🔍 Décodage du code-barres:', barcode);
        
        if (!barcode || barcode.length < 8) {
            return { error: 'Code trop court' };
        }
        
        const result = {};
        
        // 👉 Cas 1: EAN-13 (13 chiffres)
        if (/^\d{13}$/.test(barcode)) {
            console.log('✅ EAN-13 détecté');
            result.gtin = barcode;
            result.format = 'EAN-13';
            return result;
        }
        
        // 👉 Cas 2: GTIN-14 (14 chiffres)
        if (/^\d{14}$/.test(barcode)) {
            console.log('✅ GTIN-14 détecté');
            result.gtin = barcode;
            result.format = 'GTIN-14';
            return result;
        }
        
        // 👉 Cas 3: Code GS1 avec AI
        console.log('Tentative de décodage GS1...');
        
        // Nettoyer le code
        let cleanCode = barcode
            .replace(/[()\[\]{}]/g, '')        // Enlever parenthèses
            .replace(/\s+/g, '')                // Enlever espaces
            .replace(/\u001D/g, '')              // Enlever séparateur GS
            .replace(/[^A-Za-z0-9]/g, '');      // Garder lettres et chiffres
        
        // Extraire GTIN (AI 01)
        const gtinMatch = cleanCode.match(/(?:01|\(01\))?(\d{14})/);
        if (gtinMatch) {
            result.gtin = gtinMatch[1];
            console.log('GTIN extrait:', result.gtin);
        } else {
            // Chercher simplement 13-14 chiffres
            const digitsMatch = cleanCode.match(/\d{13,14}/);
            if (digitsMatch) {
                result.gtin = digitsMatch[0];
                console.log('GTIN extrait (simple):', result.gtin);
            }
        }
        
        // Extraire LOT (AI 10)
        const lotMatch = cleanCode.match(/(?:10|\(10\))([A-Za-z0-9]{1,20})/);
        if (lotMatch) {
            result.lot = lotMatch[1];
            console.log('Lot extrait:', result.lot);
        }
        
        // Extraire date expiration (AI 17)
        const expMatch = cleanCode.match(/(?:17|\(17\))(\d{6})/);
        if (expMatch) {
            const expDate = expMatch[1];
            const year = 2000 + parseInt(expDate.substring(0, 2));
            const month = parseInt(expDate.substring(2, 4));
            const day = parseInt(expDate.substring(4, 6));
            result.expiration = `${day}/${month}/${year}`;
            console.log('Date expiration extraite:', result.expiration);
        }
        
        // Extraire quantité (AI 30)
        const qtyMatch = cleanCode.match(/(?:30|\(30\))(\d+)/);
        if (qtyMatch) {
            result.quantity = parseInt(qtyMatch[1]);
            console.log('Quantité extraite:', result.quantity);
        }
        
        // Extraire poids (AI 3103)
        const weightMatch = cleanCode.match(/(?:3103|\(3103\))(\d{6})/);
        if (weightMatch) {
            result.weight = parseInt(weightMatch[1]) / 1000;
            console.log('Poids extrait (kg):', result.weight);
        }
        
        result.format = 'GS1';
        console.log('Résultat décodage:', result);
        return result;
    };

    /**
     * Gère le scan du code-barres
     */
    const handleScan = async (e) => {
        const scannedValue = e.target.value.trim();
        
        if (!scannedValue || scannedValue.length < 8) {
            return;
        }

        console.log('📷 Scan détecté:', scannedValue);
        setScanning(true);
        setError('');
        setSuccess('');

        try {
            // Étape 1: Décoder le code
            const decoded = decodeBarcode(scannedValue);
            
            if (decoded.error) {
                setError(decoded.error);
                return;
            }
            
            // Étape 2: Mettre à jour le formulaire avec les données décodées
            const updates = {};
            
            if (decoded.gtin) {
                updates.gtin = decoded.gtin;
                setSuccess(`GTIN ${decoded.format} détecté: ${decoded.gtin}`);
                
                // Étape 3: Essayer de trouver l'article par GTIN
                try {
                    const article = await articleService.findByGTIN(decoded.gtin);
                    if (article) {
                        // Article trouvé ! Charger toutes ses données
                        setFormData({
                            id: article.id,
                            codeArticleERP: article.codeArticleERP || '',
                            gtin: article.gtin || '',
                            designation: article.designation || '',
                            description: article.description || '',
                            category: article.category || '',
                            uniteMesure: article.uniteMesure || '',
                            poids: article.poids || 0,
                            volume: article.volume || 0,
                            lotDefaut: article.lotDefaut || '',
                            dureeExpirationJours: article.dureeExpirationJours || '',
                            actif: article.actif
                        });
                        setSuccess('✅ Article trouvé en base !');
                        setScanning(false);
                        e.target.value = '';
                        return;
                    }
                } catch (err) {
                    console.log('Article non trouvé en base');
                }
            }
            
            if (decoded.lot) {
                updates.lotDefaut = decoded.lot;
            }
            
            if (decoded.weight) {
                updates.poids = decoded.weight;
            }
            
            if (decoded.expiration) {
                // Pourrait calculer la durée en jours depuis aujourd'hui
                // setDureeExpirationJours(calculerJours(decoded.expiration));
            }
            
            // Mettre à jour le formulaire avec les données trouvées
            setFormData(prev => ({
                ...prev,
                ...updates
            }));
            
        } catch (err) {
            console.error('❌ Erreur scan:', err);
            setError('Erreur lors du décodage du code-barres');
        } finally {
            setScanning(false);
            e.target.value = '';
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Validation spéciale pour GTIN (chiffres uniquement)
        if (name === 'gtin') {
            const gtinValue = value.replace(/\D/g, '');
            setFormData({
                ...formData,
                [name]: gtinValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: parseFloat(value) || 0
        });
    };

    const validateForm = () => {
        if (!formData.codeArticleERP.trim()) {
            setError('Le code ERP est obligatoire');
            return false;
        }
        if (!formData.designation.trim()) {
            setError('La désignation est obligatoire');
            return false;
        }
        if (!formData.uniteMesure) {
            setError("L'unité de mesure est obligatoire");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let result;
            if (isEditMode && formData.id) {
                result = await articleService.updateArticle(formData.id, formData);
            } else {
                result = await articleService.createArticle(formData);
            }
            onArticleAdded(result);
            onClose();
            resetForm();
        } catch (err) {
            setError(err.message || `Erreur lors de ${isEditMode ? 'la modification' : "l'ajout"} de l'article`);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const isAdmin = roles?.isAdmin;
    const canEdit = isAdmin || (!isEditMode);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>
                        <FaBoxOpen /> {isEditMode ? 'Modifier un article' : 'Ajouter un article'}
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                {/* Zone de scan GS1 */}
                <div className="scan-section">
                    <label htmlFor="scanInput">
                        <FaCamera /> Scanner un code-barres
                    </label>
                    <div className="scan-input-wrapper">
                        <FaBarcode className="scan-icon" />
                        <input
                            ref={scanInputRef}
                            type="text"
                            id="scanInput"
                            placeholder="Scannez le code-barres (EAN-13, GTIN-14, GS1)"
                            onChange={handleScan}
                            disabled={scanning}
                            autoComplete="off"
                        />
                        {scanning && <span className="scanning-indicator">🔍 Décodage...</span>}
                    </div>
                    <small className="scan-hint">
                        Formats supportés : EAN-13 (13 chiffres), GTIN-14 (14 chiffres), GS1 complet
                    </small>
                </div>

                <form onSubmit={handleSubmit} ref={formRef}>
                    {/* Section Code ERP et GTIN */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaTag /> Code ERP *
                            </label>
                            <input
                                type="text"
                                name="codeArticleERP"
                                value={formData.codeArticleERP}
                                onChange={handleChange}
                                required
                                disabled={loading || !canEdit}
                                placeholder="Ex: ART-001"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <FaBarcode /> GTIN (Code GS1)
                            </label>
                            <input
                                type="text"
                                name="gtin"
                                value={formData.gtin}
                                onChange={handleChange}
                                disabled={loading || !canEdit}
                                placeholder="14 chiffres max"
                                maxLength="14"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                className={formData.gtin && formData.gtin.length !== 14 ? 'input-error' : ''}
                            />
                            {formData.gtin && formData.gtin.length !== 14 && (
                                <small className="error-text">Le GTIN doit faire 14 chiffres</small>
                            )}
                        </div>
                    </div>

                    {/* Section Désignation et Catégorie */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaFont /> Désignation *
                            </label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                required
                                disabled={loading || !canEdit}
                                placeholder="Nom de l'article"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <FaList /> Catégorie
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                disabled={loading || !canEdit}
                                placeholder="Ex: MOBILIER, ELECTRONIQUE..."
                            />
                        </div>
                    </div>

                    {/* Section Description */}
                    <div className="form-group">
                        <label>
                            <FaAlignLeft /> Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            disabled={loading || !canEdit}
                            placeholder="Description détaillée (optionnelle)"
                        />
                    </div>

                    {/* Section Unité de mesure */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Unité de mesure *</label>
                            <select
                                name="uniteMesure"
                                value={formData.uniteMesure}
                                onChange={handleChange}
                                required
                                disabled={loading || !canEdit}
                            >
                                <option value="">Sélectionner</option>
                                <option value="PIECE">Pièce</option>
                                <option value="KG">Kilogramme</option>
                                <option value="LITRE">Litre</option>
                                <option value="METRE">Mètre</option>
                                <option value="CARTON">Carton</option>
                                <option value="PALETTE">Palette</option>
                            </select>
                        </div>
                    </div>

                    {/* Section Poids et Volume */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaWeight /> Poids (kg)
                            </label>
                            <input
                                type="number"
                                name="poids"
                                value={formData.poids}
                                onChange={handleNumberChange}
                                step="0.01"
                                min="0"
                                disabled={loading || !canEdit}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <FaCube /> Volume (m³)
                            </label>
                            <input
                                type="number"
                                name="volume"
                                value={formData.volume}
                                onChange={handleNumberChange}
                                step="0.01"
                                min="0"
                                disabled={loading || !canEdit}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Section Lot et Expiration */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Lot par défaut</label>
                            <input
                                type="text"
                                name="lotDefaut"
                                value={formData.lotDefaut}
                                onChange={handleChange}
                                disabled={loading || !canEdit}
                                placeholder="Ex: LOT001"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <FaCalendarAlt /> Durée expiration (jours)
                            </label>
                            <input
                                type="number"
                                name="dureeExpirationJours"
                                value={formData.dureeExpirationJours}
                                onChange={handleNumberChange}
                                min="0"
                                disabled={loading || !canEdit}
                                placeholder="Ex: 365"
                            />
                        </div>
                    </div>

                    {/* Checkbox Actif */}
                    {canEdit && (
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="actif"
                                    checked={formData.actif}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                Article actif
                            </label>
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                            <FaTimes /> Annuler
                        </button>
                        {canEdit && (
                            <button type="submit" className="btn-submit" disabled={loading}>
                                <FaSave /> {loading ? 'En cours...' : (isEditMode ? 'Modifier' : 'Ajouter')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddArticleModal;