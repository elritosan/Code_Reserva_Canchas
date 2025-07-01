// frontend/src/services/Basicos/usuarioService.jsx
import axios from 'axios';

const API_URL = "http://localhost:5000/api/usuarios";

export const usuarioService = {
  obtenerTodos: async () => {
    try {
      const res = await axios.get(API_URL);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener usuarios");
    }
  },

  obtenerPorId: async (id_usuario) => {
    try {
      const res = await axios.get(`${API_URL}/${id_usuario}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener usuario");
    }
  },

  obtenerPorEmail: async (email) => {
    try {
      const res = await axios.get(`${API_URL}/email/${encodeURIComponent(email)}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener usuario por email");
    }
  },

  crear: async ({ nombre, email, password, telefono, id_rol }) => {
    try {
      const res = await axios.post(API_URL, { nombre, email, password, telefono, id_rol });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  actualizar: async (id_usuario, { nombre, email, telefono, id_rol, verificado }) => {
    try {
      const res = await axios.put(`${API_URL}/${id_usuario}`, { 
        nombre, email, telefono, id_rol, verificado 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  actualizarPassword: async (id_usuario, { currentPassword, newPassword }) => {
    try {
      const res = await axios.put(`${API_URL}/${id_usuario}/password`, { 
        currentPassword, newPassword 
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  eliminar: async (id_usuario) => {
    try {
      const res = await axios.delete(`${API_URL}/${id_usuario}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default usuarioService;