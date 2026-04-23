// src/services/transporteurService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/transporteur';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getLivraisonsEnCours = async () => {
  const response = await axios.get(`${API_URL}/livraisons/en-cours`, getAuthHeader());
  return response.data;
};

export const getHistoriqueLivraisons = async () => {
  const response = await axios.get(`${API_URL}/livraisons/historique`, getAuthHeader());
  return response.data;
};

export const validerLivraison = async (livraisonId, validationData) => {
  const response = await axios.post(`${API_URL}/livraisons/${livraisonId}/valider`, validationData, getAuthHeader());
  return response.data;
};