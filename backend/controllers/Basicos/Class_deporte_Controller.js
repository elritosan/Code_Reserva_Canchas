// backend/controllers/Basicos/Class_deporte_Controller.js
const ClassDeporte = require("../../models/Basicos/Class_deporte");

exports.crearDeporte = async (req, res) => {
  try {
    const { nombre, descripcion, imagen_url } = req.body;

    // Validación manual
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "El nombre del deporte es requerido"
      });
    }

    const nuevoDeporte = await ClassDeporte.crear({ nombre, descripcion, imagen_url });
    
    res.status(201).json({
      success: true,
      mensaje: "Deporte creado exitosamente",
      data: nuevoDeporte
    });
  } catch (error) {
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al crear deporte",
      detalles: error.message
    });
  }
};

exports.obtenerDeportes = async (req, res) => {
  try {
    const deportes = await ClassDeporte.obtenerTodos();
    res.json({
      success: true,
      count: deportes.length,
      data: deportes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener deportes",
      detalles: error.message
    });
  }
};

exports.obtenerDeporte = async (req, res) => {
  try {
    const deporte = await ClassDeporte.obtenerPorId(req.params.id_deporte);
    if (!deporte) {
      return res.status(404).json({
        success: false,
        error: "Deporte no encontrado"
      });
    }
    res.json({ success: true, data: deporte });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener deporte",
      detalles: error.message
    });
  }
};

exports.actualizarDeporte = async (req, res) => {
  try {
    const deporteActualizado = await ClassDeporte.actualizar(
      req.params.id_deporte,
      req.body
    );
    
    if (!deporteActualizado) {
      return res.status(404).json({
        success: false,
        error: "Deporte no encontrado"
      });
    }
    
    res.json({
      success: true,
      mensaje: "Deporte actualizado exitosamente",
      data: deporteActualizado
    });
  } catch (error) {
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al actualizar deporte",
      detalles: error.message
    });
  }
};

exports.eliminarDeporte = async (req, res) => {
  try {
    const deporteEliminado = await ClassDeporte.eliminar(req.params.id_deporte);
    
    if (!deporteEliminado) {
      return res.status(404).json({
        success: false,
        error: "Deporte no encontrado"
      });
    }
    
    res.json({
      success: true,
      mensaje: "Deporte eliminado exitosamente",
      data: deporteEliminado
    });
  } catch (error) {
    const statusCode = error.message.includes('tiene canchas asociadas') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al eliminar deporte",
      detalles: error.message
    });
  }
};