import React from 'react';
import { FaTimes, FaPrint, FaBox, FaCalendarAlt, FaMapMarkerAlt, FaTag, FaExchangeAlt } from 'react-icons/fa';
import './styles/StockDetailModal.css';

const StockDetailModal = ({ stock, onClose, onPrint, onTransfer }) => {
    if (!stock) return null;

    const getStatutLabel = (statut) => {
        switch (statut) {
            case 'DISPONIBLE': return 'Disponible';
            case 'RESERVE': return 'Réservé';
            case 'BLOQUE': return 'Bloqué';
            case 'QUALITE': return 'Contrôle qualité';
            default: return statut;
        }
    };

    const getStatutClass = (statut) => {
        switch (statut) {
            case 'DISPONIBLE': return 'status-disponible';
            case 'RESERVE': return 'status-reserve';
            case 'BLOQUE': return 'status-bloque';
            case 'QUALITE': return 'status-qualite';
            default: return '';
        }
    };

    const userRole = localStorage.getItem('role');
    const isResponsable = userRole === 'RESPONSABLE_ENTREPOT' || userRole === 'ADMINISTRATEUR';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content stock-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Détail du stock</h3>
                    <button className="modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="stock-detail-content">
                    <div className="detail-row">
                        <span className="detail-label"><FaTag /> ID Stock :</span>
                        <span className="detail-value">{stock.id}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label"><FaBox /> Article :</span>
                        <span className="detail-value">{stock.articleDesignation} ({stock.articleCode})</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Lot :</span>
                        <span className="detail-value">{stock.lot}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label"><FaMapMarkerAlt /> Emplacement :</span>
                        <span className="detail-value">{stock.emplacement}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Quantité :</span>
                        <span className="detail-value quantity">{stock.quantite}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Statut :</span>
                        <span className={`status-badge ${getStatutClass(stock.statut)}`}>
                            {getStatutLabel(stock.statut)}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label"><FaCalendarAlt /> Date réception :</span>
                        <span className="detail-value">
                            {stock.dateReception ? new Date(stock.dateReception).toLocaleDateString() : '-'}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label"><FaCalendarAlt /> Date expiration :</span>
                        <span className="detail-value">
                            {stock.dateExpiration ? new Date(stock.dateExpiration).toLocaleDateString() : '-'}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Créé le :</span>
                        <span className="detail-value">
                            {stock.createdAt ? new Date(stock.createdAt).toLocaleString() : '-'}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Modifié le :</span>
                        <span className="detail-value">
                            {stock.updatedAt ? new Date(stock.updatedAt).toLocaleString() : '-'}
                        </span>
                    </div>
                </div>

                <div className="modal-actions">
                    {isResponsable && (
                        <button className="btn-transfer" onClick={() => onTransfer(stock)}>
                            <FaExchangeAlt /> Transférer
                        </button>
                    )}
                    <button className="btn-print" onClick={() => onPrint(stock)}>
                        <FaPrint /> Imprimer
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockDetailModal;