// frontend/src/services/Basicos/horarioDisponibleService.jsx
import axios from 'axios';

const API_URL = "http://localhost:5000/api/horarios";

export const horarioDisponibleService = {
  obtenerTodos: async () => {
    try {
      const res = await axios.get(API_URL);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener todos los horarios");
    }
  },
  
  obtenerPorCancha: async (id_cancha) => {
    try {
      const res = await axios.get(`${API_URL}/cancha/${id_cancha}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener horarios");
    }
  },

  obtenerPorId: async (id_horario) => {
    try {
      const res = await axios.get(`${API_URL}/${id_horario}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener horario");
    }
  },

  crear: async ({ id_cancha, dia_semana, hora_inicio, hora_fin }) => {
    try {
      const res = await axios.post(API_URL, { 
        id_cancha, dia_semana, hora_inicio, hora_fin 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  actualizarDisponibilidad: async (id_horario, disponible) => {
    try {
      const res = await axios.put(`${API_URL}/${id_horario}/disponibilidad`, { 
        disponible 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  eliminar: async (id_horario) => {
    try {
      const res = await axios.delete(`${API_URL}/${id_horario}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default horarioDisponibleService;