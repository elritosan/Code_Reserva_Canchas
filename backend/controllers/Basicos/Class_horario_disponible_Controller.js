// backend/controllers/Basicos/Class_horario_disponible_Controller.js
const ClassHorarioDisponible = require("../../models/Basicos/Class_horario_disponible");

exports.crearHorario = async (req, res) => {
  try {
    const { id_cancha, dia_semana, hora_inicio, hora_fin } = req.body;
    const nuevoHorario = await ClassHorarioDisponible.crear({ 
      id_cancha, 
      dia_semana, 
      hora_inicio, 
      hora_fin 
    });
    
    res.status(201).json({
      success: true,
      mensaje: "Horario creado exitosamente",
      data: nuevoHorario
    });
  } catch (error) {
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al crear horario",
      detalles: error.message
    });
  }
};

exports.obtenerTodosHorarios = async (req, res) => {
  try {
    const horarios = await ClassHorarioDisponible.obtenerTodos();
    res.json({
      success: true,
      count: horarios.length,
      data: horarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener horarios",
      detalles: error.message
    });
  }
};

exports.obtenerHorariosPorCancha = async (req, res) => {
  try {
    const horarios = await ClassHorarioDisponible.obtenerPorCancha(req.params.id_cancha);
    res.json({
      success: true,
      count: horarios.length,
      data: horarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener horarios",
      detalles: error.message
    });
  }
};

exports.obtenerHorario = async (req, res) => {
  try {
    const horario = await ClassHorarioDisponible.obtenerPorId(req.params.id_horario);
    if (!horario) {
      return res.status(404).json({
        success: false,
        error: "Horario no encontrado"
      });
    }
    res.json({ success: true, data: horario });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener horario",
      detalles: error.message
    });
  }
};

exports.actualizarDisponibilidad = async (req, res) => {
  try {
    const { disponible } = req.body;
    const horarioActualizado = await ClassHorarioDisponible.actualizarDisponibilidad(
      req.params.id_horario,
      disponible
    );
    res.json({
      success: true,
      mensaje: "Disponibilidad actualizada",
      data: horarioActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al actualizar disponibilidad",
      detalles: error.message
    });
  }
};

exports.eliminarHorario = async (req, res) => {
  try {
    const horarioEliminado = await ClassHorarioDisponible.eliminar(req.params.id_horario);
    res.json({
      success: true,
      mensaje: "Horario eliminado exitosamente",
      data: horarioEliminado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al eliminar horario",
      detalles: error.message
    });
  }
};