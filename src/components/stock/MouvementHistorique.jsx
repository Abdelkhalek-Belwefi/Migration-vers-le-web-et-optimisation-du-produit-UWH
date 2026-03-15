import React, { useState, useEffect } from 'react';
import { mouvementService } from '../../services/mouvementService';
import { FaDownload, FaSearch, FaUndo } from 'react-icons/fa';
import './styles/MouvementHistorique.css';

const MouvementHistorique = () => {
    const [mouvements, setMouvements] = useState([]);
    const [filteredMouvements, setFilteredMouvements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useState({
        type: '',
        motif: '',
        dateDebut: '',
        dateFin: ''
    });

    useEffect(() => {
        fetchMouvements();
    }, []);

    const fetchMouvements = async () => {
        try {
            setLoading(true);
            const data = await mouvementService.getAllMouvements();
            console.log('📦 Mouvements reçus:', data); // Pour déboguer
            setMouvements(data);
            setFilteredMouvements(data);
            setError('');
        } catch (err) {
            setError('Erreur lors du chargement de l\'historique');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        
        let filtered = [...mouvements];

        if (searchParams.type) {
            filtered = filtered.filter(m => m.type === searchParams.type);
        }

        if (searchParams.motif) {
            filtered = filtered.filter(m => m.motif === searchParams.motif);
        }

        if (searchParams.dateDebut) {
            const debut = new Date(searchParams.dateDebut);
            filtered = filtered.filter(m => new Date(m.dateMouvement) >= debut);
        }

        if (searchParams.dateFin) {
            const fin = new Date(searchParams.dateFin);
            fin.setHours(23, 59, 59);
            filtered = filtered.filter(m => new Date(m.dateMouvement) <= fin);
        }

        setFilteredMouvements(filtered);
    };

    const handleInputChange = (e) => {
        setSearchParams({
            ...searchParams,
            [e.target.name]: e.target.value
        });
    };

    const handleReset = () => {
        setSearchParams({
            type: '',
            motif: '',
            dateDebut: '',
            dateFin: ''
        });
        setFilteredMouvements(mouvements);
    };

    const handleExportCSV = () => {
        const headers = ['Date', 'Article', 'Lot(s)', 'Emplacement(s)', 'Type', 'Qté', 'Ancien', 'Nouveau', 'Motif', 'Utilisateur', 'Commentaire'];
        const csvData = filteredMouvements.map(m => {
            // Formater les lots et emplacements selon le type
            let lots = m.lotSource || '-';
            let emplacements = m.emplacementSource || '-';
            if (m.type === 'TRANSFERT' && m.lotDestination) {
                lots = `${m.lotSource} → ${m.lotDestination}`;
                emplacements = `${m.emplacementSource} → ${m.emplacementDestination}`;
            }
            return [
                new Date(m.dateMouvement).toLocaleString(),
                m.articleDesignation,
                lots,
                emplacements,
                m.type,
                m.quantite,
                m.ancienneQuantiteSource,
                m.nouvelleQuantiteSource,
                m.motif,
                m.utilisateurNom || 'Système',
                m.commentaire || ''
            ];
        });

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `mouvements_stock_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'ENTREE': return '➕';
            case 'SORTIE': return '➖';
            case 'TRANSFERT': return '🔄';
            default: return '';
        }
    };

    const getMotifLabel = (motif) => {
        const labels = {
            'RECEPTION': '📦 Réception',
            'VENTE': '🛒 Vente',
            'TRANSFERT': '🔄 Transfert',
            'CORRECTION': '✏️ Correction',
            'RETOUR': '↩️ Retour',
            'QUALITE': '🔬 Contrôle qualité'
        };
        return labels[motif] || motif;
    };

    // Affichage des lots avec flèche pour les transferts
    const renderLots = (m) => {
        if (m.type === 'TRANSFERT' && m.lotDestination) {
            return (
                <span title={`Source: ${m.lotSource}, Destination: ${m.lotDestination}`}>
                    {m.lotSource} → {m.lotDestination}
                </span>
            );
        }
        return m.lotSource || '-';
    };

    // Affichage des emplacements avec flèche pour les transferts
    const renderEmplacements = (m) => {
        if (m.type === 'TRANSFERT' && m.emplacementDestination) {
            return (
                <span title={`Source: ${m.emplacementSource}, Destination: ${m.emplacementDestination}`}>
                    {m.emplacementSource} → {m.emplacementDestination}
                </span>
            );
        }
        return m.emplacementSource || '-';
    };

    if (loading) return <div className="loading">Chargement de l'historique...</div>;

    return (
        <div className="historique-container">
            <div className="header">
                <h2>📋 Historique des mouvements</h2>
                <button className="btn-export" onClick={handleExportCSV}>
                    <FaDownload /> Exporter CSV
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <select name="type" value={searchParams.type} onChange={handleInputChange}>
                        <option value="">Tous les types</option>
                        <option value="ENTREE">Entrées</option>
                        <option value="SORTIE">Sorties</option>
                        <option value="TRANSFERT">Transferts</option>
                    </select>

                    <select name="motif" value={searchParams.motif} onChange={handleInputChange}>
                        <option value="">Tous les motifs</option>
                        <option value="RECEPTION">Réception</option>
                        <option value="VENTE">Vente</option>
                        <option value="TRANSFERT">Transfert</option>
                        <option value="CORRECTION">Correction</option>
                        <option value="RETOUR">Retour</option>
                        <option value="QUALITE">Contrôle qualité</option>
                    </select>

                    <input
                        type="date"
                        name="dateDebut"
                        value={searchParams.dateDebut}
                        onChange={handleInputChange}
                        placeholder="Date début"
                    />

                    <input
                        type="date"
                        name="dateFin"
                        value={searchParams.dateFin}
                        onChange={handleInputChange}
                        placeholder="Date fin"
                    />

                    <button type="submit" className="btn-search">
                        <FaSearch /> Filtrer
                    </button>
                    <button type="button" className="btn-reset" onClick={handleReset}>
                        <FaUndo /> Réinitialiser
                    </button>
                </form>
            </div>

            <div className="table-container">
                <table className="mouvements-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Article</th>
                            <th>Lot(s)</th>
                            <th>Emplacement(s)</th>
                            <th>Type</th>
                            <th>Qté</th>
                            <th>Ancien</th>
                            <th>Nouveau</th>
                            <th>Motif</th>
                            <th>Utilisateur</th>
                            <th>Commentaire</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMouvements.map(m => (
                            <tr key={m.id} className={m.type?.toLowerCase()}>
                                <td>{new Date(m.dateMouvement).toLocaleString()}</td>
                                <td>{m.articleDesignation} ({m.articleCode})</td>
                                <td>{renderLots(m)}</td>
                                <td>{renderEmplacements(m)}</td>
                                <td className="type-cell">
                                    {getTypeIcon(m.type)} {m.type}
                                </td>
                                <td className="quantite-cell">{m.quantite}</td>
                                <td>{m.ancienneQuantiteSource}</td>
                                <td className="nouvelle-quantite">{m.nouvelleQuantiteSource}</td>
                                <td>{getMotifLabel(m.motif)}</td>
                                <td>{m.utilisateurNom || 'Système'}</td>
                                <td>{m.commentaire || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredMouvements.length === 0 && (
                <div className="no-data">Aucun mouvement trouvé</div>
            )}
        </div>
    );
};

export default MouvementHistorique;