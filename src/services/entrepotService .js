import axios from "axios";

// URL pour les opérations ADMIN (CRUD complet)
const API_ADMIN_URL = "http://localhost:8080/api/admin/warehouses";

// URL pour les opérations publiques (lecture seule pour RESPONSABLE_ENTREPOT)
const API_PUBLIC_URL = "http://localhost:8080/api/admin/warehouses/public";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Pour la lecture seule (accessible à RESPONSABLE_ENTREPOT et ADMIN)
export const getAllEntrepots = async () => {
  const response = await axios.get(API_PUBLIC_URL, getAuthHeader());
  return response.data;
};

// Pour les opérations ADMIN (CRUD complet)
export const getAllEntrepotsAdmin = async () => {
  const response = await axios.get(API_ADMIN_URL, getAuthHeader());
  return response.data;
};

export const getEntrepotById = async (id) => {
  const response = await axios.get(`${API_ADMIN_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createEntrepot = async (entrepotData) => {
  const response = await axios.post(API_ADMIN_URL, entrepotData, getAuthHeader());
  return response.data;
};

export const updateEntrepot = async (id, entrepotData) => {
  const response = await axios.put(`${API_ADMIN_URL}/${id}`, entrepotData, getAuthHeader());
  return response.data;
};

export const deleteEntrepot = async (id) => {
  await axios.delete(`${API_ADMIN_URL}/${id}`, getAuthHeader());
};

export default {
  getAllEntrepots,
  getAllEntrepotsAdmin,
  getEntrepotById,
  createEntrepot,
  updateEntrepot,
  deleteEntrepot,
};