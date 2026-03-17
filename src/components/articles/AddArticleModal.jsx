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
    FaList,
    FaHashtag
} from 'react-icons/fa';
import { articleService } from '../../services/articleService';
import './styles/AddArticleModal.css';

// Liste des catégories
const CATEGORIES = [
    { value: 'ELECTRONIQUE', label: 'Électronique' },
    { value: 'MOBILIER', label: 'Mobilier' },
    { value: 'CONSOMMABLE', label: 'Consommable' },
    { value: 'MATIERE_PREMIERE', label: 'Matière première' },
    { value: 'PRODUIT_FINI', label: 'Produit fini' },
    { value: 'EMBALLAGE', label: 'Emballage' },
    { value: 'OUTILLAGE', label: 'Outillage' },
    { value: 'PIECE_DETACHEE', label: 'Pièce détachée' },
    { value: 'AUTRE', label: 'Autre' }
];

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
        numSerie: '',
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
                numSerie: articleToEdit.numSerie || '',
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
            resetForm();
        }
    }, [articleToEdit, isEditMode, show]);

    // Focus sur le champ de scan
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
            numSerie: '',
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
     * ====================================================
     * 🎯 VERSION FINALE CORRIGÉE - Décodage GS1
     * ====================================================
     * Basé sur votre code scanné :
     * (01)06123456789014(17)260330(10)61234567890141C(21)SER000317260330
     */
    const decodeBarcode = (barcode) => {
        console.log('🔍 DÉCODAGE - Code reçu:', barcode);
        
        if (!barcode || barcode.length < 8) {
            return { error: 'Code trop court' };
        }
        
        // Garder la structure avec parenthèses pour mieux identifier les AI
        let codeWithParens = barcode;
        const result = {
            format: 'GS1',
            gtin: null,
            lot: null,
            numSerie: null,
            dateExpiration: null,
            dateObj: null
        };
        
        /**
         * 🎯 Extraction séquentielle des identifiants d'application
         * On parcourt le code caractère par caractère pour détecter les parenthèses
         */
        
        // Méthode 1: Extraction par regex avec parenthèses
        console.log('🔄 Extraction avec parenthèses...');
        
        // GTIN (01) - 14 chiffres après (01)
        const gtinMatch = barcode.match(/\(01\)(\d{14})/);
        if (gtinMatch) {
            result.gtin = gtinMatch[1];
            console.log('✅ GTIN trouvé (01):', result.gtin);
        }
        
        // Date expiration (17) - 6 chiffres après (17)
        const expMatch = barcode.match(/\(17\)(\d{6})/);
        if (expMatch) {
            const expDate = expMatch[1];
            result.dateExpiration = expDate;
            
            // Convertir YYMMDD en objet Date
            const year = 2000 + parseInt(expDate.substring(0, 2));
            const month = parseInt(expDate.substring(2, 4)) - 1; // Mois 0-11
            const day = parseInt(expDate.substring(4, 6));
            
            result.dateObj = new Date(year, month, day);
            console.log('✅ Date expiration trouvée (17):', expDate, '→', result.dateObj.toISOString());
        }
        
        // LOT (10) - jusqu'au prochain AI ou fin
        const lotMatch = barcode.match(/\(10\)([^\(]+)/);
        if (lotMatch) {
            // Nettoyer le lot (enlever les parenthèses suivantes si présentes)
            let lot = lotMatch[1];
            // Si le lot contient une parenthèse ouvrante, on coupe avant
            if (lot.includes('(')) {
                lot = lot.substring(0, lot.indexOf('('));
            }
            result.lot = lot.trim();
            console.log('✅ LOT trouvé (10):', result.lot);
        }
        
        // Numéro série (21) - jusqu'au prochain AI ou fin
        const snMatch = barcode.match(/\(21\)([^\(]+)/);
        if (snMatch) {
            let numSerie = snMatch[1];
            // Nettoyer
            if (numSerie.includes('(')) {
                numSerie = numSerie.substring(0, numSerie.indexOf('('));
            }
            result.numSerie = numSerie.trim();
            console.log('✅ Numéro série trouvé (21):', result.numSerie);
        }
        
        // Si on n'a rien trouvé avec parenthèses, essayer sans parenthèses
        if (!result.gtin && !result.lot && !result.numSerie) {
            console.log('🔄 Tentative sans parenthèses...');
            let cleanCode = barcode.replace(/[()]/g, '');
            
            // GTIN (01) - commence par 01 suivi de 14 chiffres
            const gtinRaw = cleanCode.match(/01(\d{14})/);
            if (gtinRaw) result.gtin = gtinRaw[1];
            
            // Date (17)
            const expRaw = cleanCode.match(/17(\d{6})/);
            if (expRaw) {
                result.dateExpiration = expRaw[1];
                const year = 2000 + parseInt(expRaw[1].substring(0, 2));
                const month = parseInt(expRaw[1].substring(2, 4)) - 1;
                const day = parseInt(expRaw[1].substring(4, 6));
                result.dateObj = new Date(year, month, day);
            }
            
            // LOT (10) - prend tout jusqu'à rencontrer un autre AI (2 chiffres)
            const lotRaw = cleanCode.match(/10(\d+[A-Za-z]*?)(?=\d{2}|$)/);
            if (lotRaw) result.lot = lotRaw[1];
            
            // Série (21)
            const snRaw = cleanCode.match(/21([A-Za-z0-9]+?)(?=\d{2}|$)/);
            if (snRaw) result.numSerie = snRaw[1];
        }
        
        console.log('✅ RÉSULTAT DÉCODAGE:', result);
        return result;
    };

    /**
     * Calcule la durée d'expiration en jours
     */
    const calculateExpirationDays = (expDate) => {
        if (!expDate) return '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log('📅 Calcul expiration:', {
            aujourdhui: today.toISOString(),
            expiration: expDate.toISOString(),
            diffJours: diffDays
        });
        
        return diffDays > 0 ? diffDays : 0;
    };

    /**
     * Gère le scan du code-barres
     */
    const handleScan = async (e) => {
        const scannedValue = e.target.value.trim();
        
        if (!scannedValue || scannedValue.length < 8) {
            return;
        }

        console.log('📷 SCAN - Valeur:', scannedValue);
        setScanning(true);
        setError('');
        setSuccess('');

        try {
            // Décoder le code
            const decoded = decodeBarcode(scannedValue);
            
            if (decoded.error) {
                setError(decoded.error);
                setScanning(false);
                return;
            }
            
            // Message de succès
            let successMsg = '✅ Données extraites:';
            if (decoded.gtin) successMsg += ` GTIN:${decoded.gtin}`;
            if (decoded.lot) successMsg += ` LOT:${decoded.lot}`;
            if (decoded.numSerie) successMsg += ` SÉRIE:${decoded.numSerie}`;
            setSuccess(successMsg);
            
            // Préparer les mises à jour
            const updates = {};
            
            if (decoded.gtin) {
                updates.gtin = decoded.gtin;
            }
            
            if (decoded.lot) {
                // Pour votre code, le LOT est "61234567890141C"
                updates.lotDefaut = decoded.lot;
                console.log('✅ Lot affecté:', decoded.lot);
            }
            
            if (decoded.numSerie) {
                // Pour votre code, le N° SÉRIE est "SER000317260330"
                updates.numSerie = decoded.numSerie;
                console.log('✅ Numéro série affecté:', decoded.numSerie);
            }
            
            if (decoded.dateObj) {
                const days = calculateExpirationDays(decoded.dateObj);
                updates.dureeExpirationJours = days;
                console.log('✅ Durée expiration calculée:', days, 'jours');
            }
            
            // Essayer de trouver l'article par GTIN
            if (decoded.gtin) {
                try {
                    const article = await articleService.findByGTIN(decoded.gtin);
                    if (article) {
                        setFormData({
                            id: article.id,
                            codeArticleERP: article.codeArticleERP || '',
                            gtin: article.gtin || '',
                            numSerie: article.numSerie || '',
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
                    console.log('ℹ️ Nouvel article à créer');
                }
            }
            
            // Mettre à jour le formulaire
            if (Object.keys(updates).length > 0) {
                setFormData(prev => {
                    const newFormData = { ...prev, ...updates };
                    console.log('📋 Formulaire mis à jour:', newFormData);
                    return newFormData;
                });
            }
            
        } catch (err) {
            console.error('❌ Erreur scan:', err);
            setError('Erreur lors du décodage');
        } finally {
            setScanning(false);
            e.target.value = '';
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
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
            setError('Le nom est obligatoire');
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
            setError(err.message || `Erreur lors de ${isEditMode ? 'la modification' : "l'ajout"}`);
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

                {/* Zone de scan */}
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
                            placeholder="Scannez le code GS1"
                            onChange={handleScan}
                            disabled={scanning}
                            autoComplete="off"
                        />
                        {scanning && <span className="scanning-indicator">🔍 Décodage...</span>}
                    </div>
                 
                </div>

                <form onSubmit={handleSubmit} ref={formRef}>
                    {/* Code ERP et GTIN */}
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
                                <FaBarcode /> GTIN (GS1)
                            </label>
                            <input
                                type="text"
                                name="gtin"
                                value={formData.gtin}
                                onChange={handleChange}
                                disabled={loading || !canEdit}
                                placeholder="14 chiffres"
                                maxLength="14"
                                pattern="[0-9]*"
                                inputMode="numeric"
                            />
                        </div>
                    </div>

                    {/* Numéro de série */}
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>
                                <FaHashtag /> Numéro de série
                            </label>
                            <input
                                type="text"
                                name="numSerie"
                                value={formData.numSerie}
                                onChange={handleChange}
                                disabled={loading || !canEdit}
                                placeholder="Numéro de série (AI 21)"
                                className={formData.numSerie ? 'filled' : ''}
                            />
                            <small className="field-hint">
                                Identifiant unique pour traçabilité unitaire
                            </small>
                        </div>
                    </div>

                    {/* Nom et Catégorie */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                 Nom 
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
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                disabled={loading || !canEdit}
                                className="category-select"
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
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

                    {/* Unité de mesure */}
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

                    {/* Poids et Volume */}
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

                    {/* Lot et Expiration */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Lot par défaut</label>
                            <input
                                type="text"
                                name="lotDefaut"
                                value={formData.lotDefaut}
                                onChange={handleChange}
                                disabled={loading || !canEdit}
                                placeholder="Numéro de lot (AI 10)"
                                className={formData.lotDefaut ? 'filled' : ''}
                            />
                            <small className="field-hint">Lot: {formData.lotDefaut || 'Non défini'}</small>
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
                                placeholder="Jours restants"
                            />
                            <small className="field-hint">
                                {formData.dureeExpirationJours ? 
                                    `Expire dans ${formData.dureeExpirationJours} jours` : 
                                    'Basé sur date (AI 17)'}
                            </small>
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