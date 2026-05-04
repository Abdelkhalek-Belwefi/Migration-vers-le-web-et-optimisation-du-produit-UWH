import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import './NotificationBadge.css';

const NotificationList = ({ notifications, loading, onMarkAsRead, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'à l\'instant';
        if (diffMins < 60) return `il y a ${diffMins} min`;
        if (diffHours < 24) return `il y a ${diffHours} h`;
        if (diffDays === 1) return 'hier';
        return date.toLocaleDateString('fr-FR');
    };

    const getIcon = (type) => {
        switch (type) {
            case 'INFO':
                return <FaInfoCircle />;
            case 'SUCCES':
                return <FaCheckCircle />;
            case 'ALERTE':
                return <FaExclamationTriangle />;
            case 'ERREUR':
                return <FaTimesCircle />;
            default:
                return <FaInfoCircle />;
        }
    };

    const getIconClass = (type) => {
        switch (type) {
            case 'INFO': return 'info';
            case 'SUCCES': return 'succes';
            case 'ALERTE': return 'alerte';
            case 'ERREUR': return 'erreur';
            default: return 'info';
        }
    };

    const handleClick = (notification) => {
        if (notification.statut === 'NON_LU') {
            onMarkAsRead(notification.id);
        }
        if (notification.lienAction) {
            onClose();
            window.location.href = notification.lienAction;
        }
    };

    if (loading) {
        return (
            <div className="notification-list">
                <div className="empty-notifications">
                    <div className="loading-spinner-small"></div>
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="notification-list">
                <div className="empty-notifications">
                    <div className="empty-icon">📭</div>
                    <p>Aucune notification</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-list">
            {notifications.map((notif) => (
                <div 
                    key={notif.id} 
                    className={`notification-item ${notif.statut === 'NON_LU' ? 'non-lu' : ''}`}
                    onClick={() => handleClick(notif)}
                >
                    <div className={`notification-icon ${getIconClass(notif.type)}`}>
                        {getIcon(notif.type)}
                    </div>
                    <div className="notification-content">
                        <div className="notification-title">{notif.titre}</div>
                        <div className="notification-message">{notif.message}</div>
                        <div className="notification-date">{formatDate(notif.createdAt)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationList;