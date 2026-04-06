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