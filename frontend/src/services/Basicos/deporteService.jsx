// frontend/src/services/Basicos/deporteService.jsx
import axios from 'axios';

const API_URL = "http://localhost:5000/api/deportes";

export const deporteService = {
  obtenerTodos: async () => {
    try {
      const res = await axios.get(API_URL);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener deportes");
    }
  },

  obtenerPorId: async (id_deporte) => {
    try {
      const res = await axios.get(`${API_URL}/${id_deporte}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener deporte");
    }
  },

  crear: async ({ nombre, descripcion, imagen_url }) => {
    try {
      const res = await axios.post(API_URL, { nombre, descripcion, imagen_url });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  actualizar: async (id_deporte, { nombre, descripcion, imagen_url }) => {
    try {
      const res = await axios.put(`${API_URL}/${id_deporte}`, { 
        nombre, descripcion, imagen_url 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  eliminar: async (id_deporte) => {
    try {
      const res = await axios.delete(`${API_URL}/${id_deporte}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default deporteService;