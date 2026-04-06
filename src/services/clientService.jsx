// src/services/clientService.jsx
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/clients';

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getAllClients = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

export const createClient = async (client) => {
    const response = await axios.post(API_URL, client, getAuthHeader());
    return response.data;
};

export const updateClient = async (id, client) => {
    const response = await axios.put(`${API_URL}/${id}`, client, getAuthHeader());
    return response.data;
};

export const deleteClient = async (id) => {
    await axios.delete(`${API_URL}/${id}`, getAuthHeader());
};