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
import { categoryService } from '../../services/categoryService'; // Ajout
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
    const [categories, setCategories] = useState([]); // Nouvel état pour les catégories dynamiques
    const [isLoadingCode, setIsLoadingCode] = useState(false); // ← AJOUTÉ
    
    const scanInputRef = useRef(null);
    const formRef = useRef(null);

    // Charger les catégories depuis l'API
    const loadCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch (err) {
            console.error('Erreur chargement catégories', err);
        }
    };

    // ==========   Charger le prochain code ERP ==========
    const loadNextCodeERP = async () => {
        setIsLoadingCode(true);
        try {
            const nextCode = await articleService.getNextCodeERP();
            //   Met à jour SEULEMENT le champ codeArticleERP sans effacer les autres champs ==>  (grâce à ...prev)
            setFormData(prev => ({ ...prev, codeArticleERP: nextCode }));
        } catch (err) {
            console.error('Erreur chargement code ERP:', err);
            // Fallback : générer un code temporaire
            setFormData(prev => ({ ...prev, codeArticleERP: `ART-${Date.now()}` }));
        } finally {
            setIsLoadingCode(false);
        }
    };

    // Charger les catégories quand le modal s'ouvre
    useEffect(() => {
        if (show) {
            loadCategories();
        }
    }, [show]);

    // Charger les données si on est en mode édition, ou charger le code ERP si nouveau
    useEffect(() => {
        if (articleToEdit && isEditMode) {
            console.log(' Mode édition - Chargement article:', articleToEdit);
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
        } else if (show && !isEditMode) {
            resetForm();
            loadNextCodeERP(); // ← CHARGER LE CODE ERP À L'OUVERTURE
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

    // Fonction decodeBarcode 
    const decodeBarcode = (barcode) => {
        console.log(' DÉCODAGE - Code reçu:', barcode);

        if (!barcode || barcode.length < 8) {
            return { error: 'Code trop court' };
        }
        // netoyer le code barre a par les espaces
        // \s = tout espace blanc 
        // g = global (remplace PARTOUT dans la chaîne, pas juste le premier).
        let cleanBarcode = barcode.replace(/\s/g, '');
        console.log(' Code nettoyé des espaces:', cleanBarcode);

        const result = {
            format: 'GS1',
            gtin: null,
            lot: null,
            numSerie: null,
            dateExpiration: null,
            dateObj: null
        };
        // en regex 
        // match recherche les motif 
        // la methode match return une tableau 
        //  \d est une chiffre de 0 a 9 
        const gtinMatch = cleanBarcode.match(/\(01\)(\d{14})/);
        if (gtinMatch) {
            result.gtin = gtinMatch[1];
            console.log(' GTIN trouvé (avec parenthèses):', result.gtin);
        }
        // Trouve (17) suivi de 6 chiffres
        const expMatch = cleanBarcode.match(/\(17\)(\d{6})/);
        // On vérifie que la regex a trouvé quelque chose
        if (expMatch) {
            const expDate = expMatch[1];
            // On sauvegarde la date brute (format texte) dans result
            result.dateExpiration = expDate;
            const year = 2000 + parseInt(expDate.substring(0, 2));
            const month = parseInt(expDate.substring(2, 4)) - 1;
            const day = parseInt(expDate.substring(4, 6));
            result.dateObj = new Date(year, month, day);
            console.log(' Date expiration trouvée:', expDate);
        }

        const lotMatch = cleanBarcode.match(/\(10\)([^\(]+)/);
        if (lotMatch) {
            let lot = lotMatch[1];
            // en va verifier si le lot contient (')
            if (lot.includes('(')) lot = lot.substring(0, lot.indexOf('('));
            result.lot = lot.trim();
            console.log(' LOT trouvé:', result.lot);
        }

        const snMatch = cleanBarcode.match(/\(21\)([^\(]+)/);
        if (snMatch) {
            let sn = snMatch[1];
            if (sn.includes('(')) sn = sn.substring(0, sn.indexOf('('));
            result.numSerie = sn.trim();
            console.log(' Numéro série trouvé:', result.numSerie);
        }

        if (!result.gtin) {
            console.log(' Tentative sans parenthèses pour le GTIN...');
            // en va remplacer les () par par des espce 
            const withoutParens = cleanBarcode.replace(/[()]/g, '');
            const gtinRaw = withoutParens.match(/01(\d{14})/);
            if (gtinRaw) {
                result.gtin = gtinRaw[1];
                console.log(' GTIN trouvé (sans parenthèses):', result.gtin);
            } else {
                const digitsMatch = withoutParens.match(/\d{13,14}/);
                if (digitsMatch) {
                    result.gtin = digitsMatch[0];
                    console.log(' GTIN extrait par digits:', result.gtin);
                }
            }
        }

        console.log(' RÉSULTAT DÉCODAGE FINAL:', result);
        return result;
    };
    // calcul expiration data 
    const calculateExpirationDays = (expDate) => {
        if (!expDate) return '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = expDate - today;
        // diffTime  c’est une durée en millisecondes
        // en va convertir les milliseconde en jours 
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        console.log(' Calcul expiration:', {
            aujourdhui: today.toISOString(),
            expiration: expDate.toISOString(),
            diffJours: diffDays
        });
        return diffDays > 0 ? diffDays : 0;
    };

    const handleScan = async (e) => {
        //récupère la valeur scannée (input) et effacer les espace 
        const scannedValue = e.target.value.trim();
        if (!scannedValue || scannedValue.length < 8) return;

        setScanning(true);
        setError('');
        setSuccess('');

        try {
            // elle extrait le gtin lot et numserie et datexp
            const decoded = decodeBarcode(scannedValue);
            if (decoded.error) {
                setError(decoded.error);
                setScanning(false);
                return;
            }
            // construire un message comme ca Données extraites: GTIN:12345 LOT:A12 SÉRIE:999
            let successMsg = ' Données extraites:';
            if (decoded.gtin) successMsg += ` GTIN:${decoded.gtin}`;
            if (decoded.lot) successMsg += ` LOT:${decoded.lot}`;
            if (decoded.numSerie) successMsg += ` SÉRIE:${decoded.numSerie}`;
            setSuccess(successMsg);
            // on prépare les données pour remplir le formulaire
            const updates = {};
            if (decoded.gtin) updates.gtin = decoded.gtin;
            if (decoded.lot) updates.lotDefaut = decoded.lot;
            if (decoded.numSerie) updates.numSerie = decoded.numSerie;
            if (decoded.dateObj) updates.dureeExpirationJours = calculateExpirationDays(decoded.dateObj);

            if (decoded.gtin) {
                try {
                    // cherche si l’article existe déjà dans la base
                    const article = await articleService.findByGTIN(decoded.gtin);
                    if (article) {
                        // remplit TOUT le formulaire automatiquement
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
                        setSuccess(' Article trouvé en base !');
                        setScanning(false);
                        e.target.value = '';
                        return;
                    }
                } catch (err) {
                    console.log('ℹ Nouvel article à créer');
                }
            }

            if (Object.keys(updates).length > 0) {
                setFormData(prev => ({ ...prev, ...updates }));
            }
        } catch (err) {
            console.error(' Erreur scan:', err);
            setError('Erreur lors du décodage');
        } finally {
            setScanning(false);
            e.target.value = '';
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'gtin') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
        } else {
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: parseFloat(value) || 0 });
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

    // ========== MÉTHODE HANDLESUBMIT MODIFIÉE (GESTION DES ERREURS D'UNICITÉ) ==========
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;
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
            // ========== GESTION DES ERREURS D'UNICITÉ ==========
            const errorMessage = err.response?.data?.message || err.message;
            
            if (errorMessage.includes('GTIN') && errorMessage.includes('existe déjà')) {
                setError(`❌ ${errorMessage}\n\n Un article avec ce code-barres (GTIN) existe déjà dans la base.`);
            } else if (errorMessage.includes('code ERP') && errorMessage.includes('existe déjà')) {
                setError(`❌ ${errorMessage}\n\n Un article avec ce code ERP existe déjà dans la base.`);
            } else if (errorMessage.includes('numéro de série') && errorMessage.includes('existe déjà')) {
                setError(`❌ ${errorMessage}\n\n Un article avec ce numéro de série existe déjà dans la base.`);
            } else {
                setError(errorMessage || `Erreur lors de ${isEditMode ? 'la modification' : "l'ajout"}`);
            }
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
                    <h3><FaBoxOpen /> {isEditMode ? 'Modifier un article' : 'Ajouter un article'}</h3>
                    <button className="modal-close" onClick={onClose}><FaTimes /></button>
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <div className="scan-section">
                    <label htmlFor="scanInput"><FaCamera /> Scanner un code-barres</label>
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
                    <div className="form-row">
                        <div className="form-group">
                            <label><FaTag /> Code ERP </label>
                            <input 
                                type="text" 
                                name="codeArticleERP" 
                                value={isLoadingCode ? "Chargement..." : formData.codeArticleERP} 
                                onChange={handleChange} 
                                required 
                                disabled={true}
                                placeholder="Généré automatiquement"
                            />
                            
                        </div>
                        <div className="form-group">
                            <label><FaBarcode /> GTIN (GS1)</label>
                            <input type="text" name="gtin" value={formData.gtin} onChange={handleChange} disabled={loading || !canEdit} placeholder="14 chiffres" maxLength="14" pattern="[0-9]*" inputMode="numeric" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label><FaHashtag /> Numéro de série</label>
                            <input type="text" name="numSerie" value={formData.numSerie} onChange={handleChange} disabled={loading || !canEdit} placeholder="Numéro de série (AI 21)" className={formData.numSerie ? 'filled' : ''} />
                            <small className="field-hint">Identifiant unique pour traçabilité unitaire</small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom *</label>
                            <input type="text" name="designation" value={formData.designation} onChange={handleChange} required disabled={loading || !canEdit} placeholder="Nom de l'article" />
                        </div>
                        <div className="form-group">
                            <label><FaList /> Catégorie</label>
                            <select name="category" value={formData.category} onChange={handleChange} disabled={loading || !canEdit} className="category-select">
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label><FaAlignLeft /> Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" disabled={loading || !canEdit} placeholder="Description détaillée (optionnelle)" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Unité de mesure *</label>
                            <select name="uniteMesure" value={formData.uniteMesure} onChange={handleChange} required disabled={loading || !canEdit}>
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

                    <div className="form-row">
                        <div className="form-group">
                            <label><FaWeight /> Poids (kg)</label>
                            <input type="number" name="poids" value={formData.poids} onChange={handleNumberChange} step="0.01" min="0" disabled={loading || !canEdit} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label><FaCube /> Volume (m³)</label>
                            <input type="number" name="volume" value={formData.volume} onChange={handleNumberChange} step="0.01" min="0" disabled={loading || !canEdit} placeholder="0.00" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Lot par défaut</label>
                            <input type="text" name="lotDefaut" value={formData.lotDefaut} onChange={handleChange} disabled={loading || !canEdit} placeholder="Numéro de lot (AI 10)" className={formData.lotDefaut ? 'filled' : ''} />
                            <small className="field-hint">Lot: {formData.lotDefaut || 'Non défini'}</small>
                        </div>
                        <div className="form-group">
                            <label><FaCalendarAlt /> Durée expiration (jours)</label>
                            <input type="number" name="dureeExpirationJours" value={formData.dureeExpirationJours} onChange={handleNumberChange} min="0" disabled={loading || !canEdit} placeholder="Jours restants" />
                            <small className="field-hint">{formData.dureeExpirationJours ? `Expire dans ${formData.dureeExpirationJours} jours` : 'Basé sur date (AI 17)'}</small>
                        </div>
                    </div>

                    {canEdit && (
                        <div className="form-group checkbox">
                            <label><input type="checkbox" name="actif" checked={formData.actif} onChange={handleChange} disabled={loading} /> Article actif</label>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}><FaTimes /> Annuler</button>
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