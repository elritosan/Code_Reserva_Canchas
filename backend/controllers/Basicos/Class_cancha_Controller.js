// backend/controllers/Basicos/Class_cancha_Controller.js
const ClassCancha = require("../../models/Basicos/Class_cancha");

exports.crearCancha = async (req, res) => {
  try {
    const { nombre, id_deporte, descripcion, precio_hora, imagen_url } = req.body;
    const nuevaCancha = await ClassCancha.crear({ 
      nombre, 
      id_deporte, 
      descripcion, 
      precio_hora, 
      imagen_url 
    });
    
    res.status(201).json({
      success: true,
      mensaje: "Cancha creada exitosamente",
      data: nuevaCancha
    });
  } catch (error) {
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al crear cancha",
      detalles: error.message
    });
  }
};

exports.obtenerCanchas = async (req, res) => {
  try {
    const canchas = await ClassCancha.obtenerTodas();
    res.json({
      success: true,
      count: canchas.length,
      data: canchas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener canchas",
      detalles: error.message
    });
  }
};

exports.obtenerCanchasPorDeporte = async (req, res) => {
  try {
    const canchas = await ClassCancha.obtenerPorDeporte(req.params.id_deporte);
    res.json({
      success: true,
      count: canchas.length,
      data: canchas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener canchas por deporte",
      detalles: error.message
    });
  }
};

exports.obtenerCancha = async (req, res) => {
  try {
    const cancha = await ClassCancha.obtenerPorId(req.params.id_cancha);
    if (!cancha) {
      return res.status(404).json({
        success: false,
        error: "Cancha no encontrada"
      });
    }
    res.json({ success: true, data: cancha });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener cancha",
      detalles: error.message
    });
  }
};

exports.actualizarCancha = async (req, res) => {
  try {
    const canchaActualizada = await ClassCancha.actualizar(
      req.params.id_cancha,
      req.body
    );
    res.json({
      success: true,
      mensaje: "Cancha actualizada exitosamente",
      data: canchaActualizada
    });
  } catch (error) {
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al actualizar cancha",
      detalles: error.message
    });
  }
};

exports.eliminarCancha = async (req, res) => {
  try {
    const canchaEliminada = await ClassCancha.eliminar(req.params.id_cancha);
    res.json({
      success: true,
      mensaje: "Cancha eliminada exitosamente",
      data: canchaEliminada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al eliminar cancha",
      detalles: error.message
    });
  }
};