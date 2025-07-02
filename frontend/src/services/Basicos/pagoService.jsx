// frontend/src/services/Basicos/pagoService.jsx
import axios from 'axios';

const API_URL = "http://localhost:5000/api/pagos";

export const pagoService = {
  obtenerTodos: async () => {
    try {
      const res = await axios.get(`${API_URL}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener pagos");
    }
  },
  
  obtenerPorReserva: async (id_reserva) => {
    try {
      const res = await axios.get(`${API_URL}/reserva/${id_reserva}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener pagos");
    }
  },

  obtenerPorUsuario: async (id_usuario) => {
    try {
      const res = await axios.get(`${API_URL}/usuario/${id_usuario}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener pagos del usuario");
    }
  },

  obtenerPorId: async (id_pago) => {
    try {
      const res = await axios.get(`${API_URL}/${id_pago}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener pago");
    }
  },

  crear: async ({ id_reserva, monto, metodo_pago, transaccion_id }) => {
    try {
      const res = await axios.post(API_URL, { 
        id_reserva, monto, metodo_pago, transaccion_id 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  actualizar: async (id_pago, datos) => {
    try {
      const res = await axios.put(`${API_URL}/${id_pago}`, datos);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  actualizarEstado: async (id_pago, { estado, transaccion_id }) => {
    try {
      const res = await axios.put(`${API_URL}/${id_pago}/estado`, { 
        estado, transaccion_id 
      });
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  eliminar: async (id_pago) => {
    try {
      const res = await axios.delete(`${API_URL}/${id_pago}`);
      return res.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al eliminar pago");
    }
  },
};

export default pagoService;