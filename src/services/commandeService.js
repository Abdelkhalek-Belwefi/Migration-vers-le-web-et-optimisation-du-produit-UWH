// src/services/commandeService.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/commandes";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getAllCommandes = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const getCommandesByStatut = async (statut) => {
  const response = await axios.get(
    `${API_URL}/statut/${statut}`,
    getAuthHeader()
  );
  return response.data;
};

export const getCommandesAExpedier = async () => {
  const response = await axios.get(`${API_URL}/a-expedier`, getAuthHeader());
  return response.data;
};

export const updateStatut = async (id, statut) => {
  const response = await axios.patch(
    `${API_URL}/${id}/statut?statut=${statut}`,
    {},
    getAuthHeader()
  );
  return response.data;
};

export const createCommande = async (commandeData) => {
  const response = await axios.post(API_URL, commandeData, getAuthHeader());
  return response.data;
};

// ✅ Fonction manquante
export const updateCommande = async (id, commandeData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    commandeData,
    getAuthHeader()
  );
  return response.data;
};

export const deleteCommande = async (id) => {
  await axios.delete(`${API_URL}/${id}`, getAuthHeader());
};
