// frontend/src/services/Basicos/rolService.jsx
import axios from 'axios';

const API_URL = "http://localhost:5000/api/roles";

export const rolService = {
  obtenerTodos: async () => {
    try {
      const res = await axios.get(API_URL);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener roles");
    }
  },

  obtenerPorId: async (id_rol) => {
    try {
      const res = await axios.get(`${API_URL}/${id_rol}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener rol");
    }
  },

  crear: async ({ nombre, descripcion }) => {
    try {
      const res = await axios.post(API_URL, { nombre, descripcion });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  actualizar: async (id_rol, { nombre, descripcion }) => {
    try {
      const res = await axios.put(`${API_URL}/${id_rol}`, { nombre, descripcion });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  eliminar: async (id_rol) => {
    try {
      const res = await axios.delete(`${API_URL}/${id_rol}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default rolService;