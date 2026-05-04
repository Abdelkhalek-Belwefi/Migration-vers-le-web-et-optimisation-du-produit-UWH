import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import NotificationList from './NotificationList';
import { notificationService } from '../../services/notificationService';
import './NotificationBadge.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [nonLuCount, setNonLuCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const stompClientRef = useRef(null);

    const userId = localStorage.getItem('userId');

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNonLues();
            setNotifications(data.notifications || []);
            setNonLuCount(data.count || 0);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectWebSocket = () => {
        if (!userId || !window.SockJS || !window.Stomp) return;

        const socket = new window.SockJS('http://localhost:8080/ws-notifications');
        const client = window.Stomp.over(socket);
        
        client.connect({}, () => {
            client.subscribe(`/topic/notifications/${userId}`, (message) => {
                const newNotification = JSON.parse(message.body);
                setNotifications(prev => [newNotification, ...prev]);
                setNonLuCount(prev => prev + 1);
            });
        });
        
        stompClientRef.current = client;
    };

    useEffect(() => {
        loadNotifications();
        
        // Charger StompJS
        const loadStomp = async () => {
            await import('sockjs-client');
            await import('@stomp/stompjs');
            window.SockJS = window.SockJS || (await import('sockjs-client')).default;
            window.Stomp = (await import('@stomp/stompjs')).Stomp;
            connectWebSocket();
        };
        loadStomp();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
        };
    }, [userId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, statut: 'LU' } : n
        ));
        setNonLuCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, statut: 'LU' })));
        setNonLuCount(0);
    };

    const handleDeleteAll = async () => {
        if (window.confirm('Supprimer toutes les notifications ?')) {
            await notificationService.deleteAll();
            setNotifications([]);
            setNonLuCount(0);
        }
    };

    const handleRefresh = () => {
        loadNotifications();
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button 
                className="notification-bell-btn"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <FaBell />
                {nonLuCount > 0 && (
                    <span className="notification-badge">{nonLuCount > 99 ? '99+' : nonLuCount}</span>
                )}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>📬 Notifications</h4>
                        <div className="notification-header-actions">
                            {nonLuCount > 0 && (
                                <button onClick={handleMarkAllAsRead}>✓ Tout lire</button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={handleDeleteAll}>🗑️ Supprimer</button>
                            )}
                            <button onClick={handleRefresh}>🔄</button>
                        </div>
                    </div>
                    
                    <NotificationList 
                        notifications={notifications}
                        loading={loading}
                        onMarkAsRead={handleMarkAsRead}
                        onClose={() => setShowDropdown(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default NotificationBell;