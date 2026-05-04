import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notifications';

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const notificationService = {
    getMesNotifications: async () => {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    },

    getNonLues: async () => {
        const response = await axios.get(`${API_URL}/non-lues`, getAuthHeader());
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await axios.put(`${API_URL}/${id}/lu`, {}, getAuthHeader());
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await axios.put(`${API_URL}/marquer-tout-lu`, {}, getAuthHeader());
        return response.data;
    },

    deleteNotification: async (id) => {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    },

    deleteAll: async () => {
        await axios.delete(`${API_URL}/tout-supprimer`, getAuthHeader());
    }
};