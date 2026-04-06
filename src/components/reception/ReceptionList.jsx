import React, { useState, useEffect } from 'react';
import { receptionService } from '../../services/receptionService';
import ReceptionForm from './ReceptionForm';
import ReceptionDetail from './ReceptionDetail';
import './styles/ReceptionList.css';
import { FaCheckCircle } from "react-icons/fa";
import { FaBox } from "react-icons/fa";

const ReceptionList = () => {
    const [receptions, setReceptions] = useState([]);
    const [filteredReceptions, setFilteredReceptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedReceptionId, setSelectedReceptionId] = useState(null);
    const [searchParams, setSearchParams] = useState({
        numeroPO: '',
        fournisseur: '',
        statut: ''
    });

    const userRole = localStorage.getItem('role');
    const isOperateur = userRole === 'OPERATEUR_ENTREPOT' || userRole === 'ADMINISTRATEUR';
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';

    // 🔹 Fonction utilitaire pour trier les réceptions par date décroissante (la plus récente en premier)
    const sortReceptionsByDateDesc = (data) => {
        return [...data].sort((a, b) => {
            // Utiliser createdAt si disponible, sinon l'ID (plus récent = ID plus grand)
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.id);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.id);
            return dateB - dateA; // Décroissant
        });
    };

    useEffect(() => {
        loadReceptions();
    }, []);

    const loadReceptions = async () => {
        try {
            setLoading(true);
            const data = await receptionService.getAllReceptions();
            const sortedData = sortReceptionsByDateDesc(data);
            setReceptions(sortedData);
            setFilteredReceptions(sortedData);
            setError('');
        } catch (err) {
            setError('Erreur lors du chargement des réceptions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const params = {};
            if (searchParams.numeroPO) params.numeroPO = searchParams.numeroPO;
            if (searchParams.fournisseur) params.fournisseur = searchParams.fournisseur;
            if (searchParams.statut) params.statut = searchParams.statut;
            
            const data = await receptionService.searchReceptions(params);
            const sortedData = sortReceptionsByDateDesc(data);
            setFilteredReceptions(sortedData);
            setError('');
        } catch (err) {
            setError('Erreur lors de la recherche');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setSearchParams({
            ...searchParams,
            [e.target.name]: e.target.value
        });
    };

    const handleReset = () => {
        setSearchParams({
            numeroPO: '',
            fournisseur: '',
            statut: ''
        });
        // On trie à nouveau la liste originale (déjà triée)
        setFilteredReceptions(receptions);
    };

    const handleValider = async (id) => {
        if (!window.confirm('Valider cette réception ? Cette action est irréversible.')) return;
        
        try {
            await receptionService.validerReception(id);
            loadReceptions(); // recharge et trie
            setSelectedReceptionId(null);
            setSuccess('✅ Réception validée avec succès !');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Erreur lors de la validation';
            setError(`❌ ${message}`);
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleFormSuccess = (newReception) => {
        setShowForm(false);
        loadReceptions(); // recharge et trie
    };

    const handleFormCancel = () => {
        setShowForm(false);
    };

    const handleRowClick = (id) => {
        setSelectedReceptionId(id);
        setShowForm(false);
    };

    const handleBackToList = () => {
        setSelectedReceptionId(null);
        setShowForm(false);
    };

    const getStatutClass = (statut) => {
        switch(statut) {
            case 'EN_ATTENTE': return 'badge-warning';
            case 'VALIDEE': return 'badge-success';
            case 'ANNULEE': return 'badge-danger';
            default: return '';
        }
    };

    const getStatutLabel = (statut) => {
        switch(statut) {
            case 'EN_ATTENTE': return 'En attente';
            case 'VALIDEE': return 'Validée';
            case 'ANNULEE': return 'Annulée';
            default: return statut;
        }
    };

    if (loading) return <div className="loading">Chargement des réceptions...</div>;

    return (
        <div className="reception-list-container">
            <div className="header">
                <h2><FaBox /> Gestion des Réceptions</h2>
                {!showForm && !selectedReceptionId && isOperateur && (
                    <button 
                        className="btn-add"
                        onClick={() => setShowForm(true)}
                    >
                        + Nouvelle réception
                    </button>
                )}
                {(showForm || selectedReceptionId) && (
                    <button 
                        className="btn-back"
                        onClick={handleBackToList}
                    >
                        ← Retour à la liste
                    </button>
                )}
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {showForm ? (
                <ReceptionForm 
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            ) : selectedReceptionId ? (
                <ReceptionDetail 
                    receptionId={selectedReceptionId}
                    onBack={handleBackToList}
                    onValidate={handleValider}
                />
            ) : (
                <>
                    <div className="search-section">
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                name="numeroPO"
                                placeholder="N° Bon de commande"
                                value={searchParams.numeroPO}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="fournisseur"
                                placeholder="Fournisseur"
                                value={searchParams.fournisseur}
                                onChange={handleInputChange}
                            />
                            <select name="statut" value={searchParams.statut} onChange={handleInputChange}>
                                <option value="">Tous les statuts</option>
                                <option value="EN_ATTENTE">En attente</option>
                                <option value="VALIDEE">Validée</option>
                                <option value="ANNULEE">Annulée</option>
                            </select>
                            <button type="submit" className="btn-search">Rechercher</button>
                            <button type="button" className="btn-reset" onClick={handleReset}>Réinitialiser</button>
                        </form>
                    </div>

                    <div className="table-container">
                        <table className="reception-table">
                            <thead>
                                <tr>
                                    <th>N° PO</th>
                                    <th>Fournisseur</th>
                                    <th>Date réception</th>
                                    <th>Statut</th>
                                    <th>Créé par</th>
                                    <th>Validé par</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReceptions.map(rec => (
                                    <tr 
                                        key={rec.id} 
                                        onClick={() => handleRowClick(rec.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td><strong>{rec.numeroPO}</strong></td>
                                        <td>{rec.fournisseur || '-'}</td>
                                        <td>{new Date(rec.dateReception).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${getStatutClass(rec.statut)}`}>
                                                {getStatutLabel(rec.statut)}
                                            </span>
                                        </td>
                                        <td>{rec.createurNom || '-'}</td>
                                        <td>{rec.valideurNom || '-'}</td>
                                        <td className="actions" onClick={(e) => e.stopPropagation()}>
                                            {rec.statut === 'EN_ATTENTE' && isResponsable && (
                                                <button 
                                                    className="btn-validate"
                                                    onClick={() => handleValider(rec.id)}
                                                    title="Valider la réception"
                                                >
                                                    <FaCheckCircle />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredReceptions.length === 0 && (
                            <div className="no-data">Aucune réception trouvée</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ReceptionList;