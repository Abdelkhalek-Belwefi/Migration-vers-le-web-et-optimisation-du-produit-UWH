import axios from "axios";

// Adaptez l'URL si votre backend écoute sur un autre port
const API_URL = "http://localhost:8080/api/admin/warehouses";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getAllEntrepots = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const getEntrepotById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createEntrepot = async (entrepotData) => {
  const response = await axios.post(API_URL, entrepotData, getAuthHeader());
  return response.data;
};

export const updateEntrepot = async (id, entrepotData) => {
  const response = await axios.put(`${API_URL}/${id}`, entrepotData, getAuthHeader());
  return response.data;
};

export const deleteEntrepot = async (id) => {
  await axios.delete(`${API_URL}/${id}`, getAuthHeader());
};

export default {
  getAllEntrepots,
  getEntrepotById,
  createEntrepot,
  updateEntrepot,
  deleteEntrepot,
};