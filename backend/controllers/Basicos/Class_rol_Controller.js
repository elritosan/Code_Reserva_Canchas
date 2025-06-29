// backend/controllers/Basicos/Class_rol_Controller.js
const ClassRol = require("../../models/Basicos/Class_rol");

exports.crearRol = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const nuevoRol = await ClassRol.crear({ nombre, descripcion });
    
    res.status(201).json({
      success: true,
      mensaje: "Rol creado exitosamente",
      data: nuevoRol
    });
  } catch (error) {
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al crear rol",
      detalles: error.message
    });
  }
};

exports.obtenerRoles = async (req, res) => {
  try {
    const roles = await ClassRol.obtenerTodos();
    res.json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener roles",
      detalles: error.message
    });
  }
};

exports.obtenerRol = async (req, res) => {
  try {
    const rol = await ClassRol.obtenerPorId(req.params.id_rol);
    if (!rol) {
      return res.status(404).json({
        success: false,
        error: "Rol no encontrado"
      });
    }
    res.json({ success: true, data: rol });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener rol",
      detalles: error.message
    });
  }
};

exports.actualizarRol = async (req, res) => {
  try {
    const rolActualizado = await ClassRol.actualizar(
      req.params.id_rol,
      req.body
    );
    res.json({
      success: true,
      mensaje: "Rol actualizado exitosamente",
      data: rolActualizado
    });
  } catch (error) {
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al actualizar rol",
      detalles: error.message
    });
  }
};

exports.eliminarRol = async (req, res) => {
  try {
    const rolEliminado = await ClassRol.eliminar(req.params.id_rol);
    res.json({
      success: true,
      mensaje: "Rol eliminado exitosamente",
      data: rolEliminado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al eliminar rol",
      detalles: error.message
    });
  }
};