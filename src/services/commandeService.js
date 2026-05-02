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

// ========== NOUVELLE MÉTHODE : Créer une commande de transfert ==========
export const createCommandeTransfert = async (transfertData) => {
  const response = await axios.post(`${API_URL}/transfert`, transfertData, getAuthHeader());
  return response.data;
};

// ========== NOUVELLE MÉTHODE : Récupérer les demandes de transfert reçues ==========
export const getCommandesTransfertRecues = async () => {
  const response = await axios.get(`${API_URL}/transfert/recues`, getAuthHeader());
  return response.data;
};

// ========== NOUVELLE MÉTHODE : Accepter une demande de transfert ==========
export const accepterDemandeTransfert = async (id) => {
  const response = await axios.patch(
    `${API_URL}/transfert/${id}/accepter`,
    {},
    getAuthHeader()
  );
  return response.data;
};

// ========== NOUVELLE MÉTHODE : Refuser une demande de transfert ==========
export const refuserDemandeTransfert = async (id) => {
  const response = await axios.patch(
    `${API_URL}/transfert/${id}/refuser`,
    {},
    getAuthHeader()
  );
  return response.data;
};

// Récupérer les demandes où l'entrepôt SOURCE est celui de l'utilisateur
export const getCommandesTransfertSource = async () => {
    const response = await axios.get(`${API_URL}/transfert/source`, getAuthHeader());
    return response.data;
};

export const getCommandesTransfertAPreparer = async () => {
    const response = await axios.get(`${API_URL}/transfert/preparer`, getAuthHeader());
    return response.data;
};

// ========== NOUVELLE MÉTHODE : Récupérer les livraisons en attente pour l'entrepôt demandeur ==========
export const getLivraisonsEntrepotAttente = async () => {
    const response = await axios.get(`http://localhost:8080/api/transporteur/livraisons/entrepot/attente`, getAuthHeader());
    return response.data;
};