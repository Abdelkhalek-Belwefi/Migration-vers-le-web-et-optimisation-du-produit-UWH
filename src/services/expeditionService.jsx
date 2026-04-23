import axios from 'axios';

const API_URL = 'http://localhost:8080/api/expeditions';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const expedierCommande = async (commandeId, transporteur) => {
  const response = await axios.post(`${API_URL}/expedier`, null, {
    params: { commandeId, transporteur },
    ...getAuthHeader()
  });
  return response.data;
};

export const getMesExpeditions = async () => {
  const response = await axios.get(`${API_URL}/mes-expeditions`, getAuthHeader());
  return response.data;
};

export const deleteExpedition = async (expeditionId) => {
  const response = await axios.delete(`${API_URL}/${expeditionId}`, getAuthHeader());
  return response.data;
};

export const getTransporteurs = async () => {
  const response = await axios.get(`${API_URL}/transporteurs`, getAuthHeader());
  return response.data;
};

// NOUVELLE FONCTION
export const expedierCommandeAvecId = async (commandeId, transporteurId) => {
  const response = await axios.post(`${API_URL}/expedier-avec-id`, null, {
    params: { commandeId, transporteurId },
    ...getAuthHeader()
  });
  return response.data;
};