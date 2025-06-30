// backend/controllers/Basicos/Class_reserva_Controller.js
const ClassReserva = require("../../models/Basicos/Class_reserva");

exports.crearReserva = async (req, res) => {
  try {
    const { id_usuario, id_horario, fecha_reserva } = req.body;
    const nuevaReserva = await ClassReserva.crear({ 
      id_usuario, 
      id_horario, 
      fecha_reserva 
    });
    
    res.status(201).json({
      success: true,
      mensaje: "Reserva creada exitosamente",
      data: nuevaReserva
    });
  } catch (error) {
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al crear reserva",
      detalles: error.message
    });
  }
};

exports.obtenerReservasPorUsuario = async (req, res) => {
  try {
    const reservas = await ClassReserva.obtenerPorUsuario(req.params.id_usuario);
    res.json({
      success: true,
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener reservas",
      detalles: error.message
    });
  }
};

exports.obtenerReserva = async (req, res) => {
  try {
    const reserva = await ClassReserva.obtenerPorId(req.params.id_reserva);
    if (!reserva) {
      return res.status(404).json({
        success: false,
        error: "Reserva no encontrada"
      });
    }
    res.json({ success: true, data: reserva });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener reserva",
      detalles: error.message
    });
  }
};

exports.actualizarEstadoReserva = async (req, res) => {
  try {
    const { estado } = req.body;
    const reservaActualizada = await ClassReserva.actualizarEstado(
      req.params.id_reserva,
      estado
    );
    res.json({
      success: true,
      mensaje: "Estado de reserva actualizado",
      data: reservaActualizada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al actualizar reserva",
      detalles: error.message
    });
  }
};

exports.eliminarReserva = async (req, res) => {
  try {
    const reservaEliminada = await ClassReserva.eliminar(req.params.id_reserva);
    res.json({
      success: true,
      mensaje: "Reserva eliminada exitosamente",
      data: reservaEliminada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al eliminar reserva",
      detalles: error.message
    });
  }
};