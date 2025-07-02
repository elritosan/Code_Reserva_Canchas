// frontend/src/services/Basicos/reservaService.jsx
import axios from 'axios';

const API_URL = "http://localhost:5000/api/reservas";

export const reservaService = {
  obtenerTodos: async () => {
    try {
      const res = await axios.get(`${API_URL}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener reservas");
    }
  },

  obtenerPorUsuario: async (id_usuario) => {
    try {
      const res = await axios.get(`${API_URL}/usuario/${id_usuario}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener reservas");
    }
  },

  obtenerPorId: async (id_reserva) => {
    try {
      const res = await axios.get(`${API_URL}/${id_reserva}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener reserva");
    }
  },

  crear: async ({ id_usuario, id_horario, fecha_reserva }) => {
    try {
      const res = await axios.post(API_URL, { 
        id_usuario, id_horario, fecha_reserva 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  actualizarEstado: async (id_reserva, estado) => {
    try {
      const res = await axios.put(`${API_URL}/${id_reserva}/estado`, { 
        estado 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  eliminar: async (id_reserva) => {
    try {
      const res = await axios.delete(`${API_URL}/${id_reserva}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default reservaService;