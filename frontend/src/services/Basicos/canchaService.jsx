// frontend/src/services/Basicos/canchaService.jsx
import axios from 'axios';

const API_URL = "http://localhost:5000/api/canchas";

export const canchaService = {
  obtenerTodas: async () => {
    try {
      const res = await axios.get(API_URL);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener canchas");
    }
  },

  obtenerPorDeporte: async (id_deporte) => {
    try {
      const res = await axios.get(`${API_URL}/deporte/${id_deporte}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener canchas por deporte");
    }
  },

  obtenerPorId: async (id_cancha) => {
    try {
      const res = await axios.get(`${API_URL}/${id_cancha}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener cancha");
    }
  },

  crear: async ({ nombre, id_deporte, descripcion, precio_hora, imagen_url }) => {
    try {
      const res = await axios.post(API_URL, { 
        nombre, id_deporte, descripcion, precio_hora, imagen_url 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  actualizar: async (id_cancha, { nombre, id_deporte, descripcion, precio_hora, imagen_url, activa }) => {
    try {
      const res = await axios.put(`${API_URL}/${id_cancha}`, { 
        nombre, id_deporte, descripcion, precio_hora, imagen_url, activa 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  eliminar: async (id_cancha) => {
    try {
      const res = await axios.delete(`${API_URL}/${id_cancha}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default canchaService;