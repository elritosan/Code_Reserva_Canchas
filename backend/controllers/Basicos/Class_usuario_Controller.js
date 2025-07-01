// backend/controllers/Basicos/Class_usuario_Controller.js
const ClassUsuario = require("../../models/Basicos/Class_usuario");

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, telefono, id_rol } = req.body;
    const nuevoUsuario = await ClassUsuario.crear({ nombre, email, password, telefono, id_rol });
    
    res.status(201).json({
      success: true,
      mensaje: "Usuario creado exitosamente",
      data: nuevoUsuario
    });
  } catch (error) {
    const statusCode = error.message.includes('ya está registrado') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al crear usuario",
      detalles: error.message
    });
  }
};

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await ClassUsuario.obtenerTodos();
    res.json({
      success: true,
      count: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener usuarios",
      detalles: error.message
    });
  }
};

exports.obtenerUsuario = async (req, res) => {
  try {
    const usuario = await ClassUsuario.obtenerPorId(req.params.id_usuario);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado"
      });
    }
    res.json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener usuario",
      detalles: error.message
    });
  }
};

exports.obtenerUsuarioPorEmail = async (req, res) => {
  try {
    const usuario = await ClassUsuario.obtenerPorEmail(req.params.email);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado"
      });
    }
    
    // No retornar el password_hash por seguridad
    delete usuario.password_hash;
    
    res.json({ 
      success: true, 
      data: usuario 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener usuario",
      detalles: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email y contraseña son requeridos"
      });
    }

    const usuario = await ClassUsuario.login(email, password);

    res.json({
      success: true,
      data: usuario,
      mensaje: "Inicio de sesión exitoso"
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Error en autenticación",
      detalles: error.message
    });
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const usuarioActualizado = await ClassUsuario.actualizar(
      req.params.id_usuario,
      req.body
    );
    res.json({
      success: true,
      mensaje: "Usuario actualizado exitosamente",
      data: usuarioActualizado
    });
  } catch (error) {
    const statusCode = error.message.includes('ya está registrado') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: "Error al actualizar usuario",
      detalles: error.message
    });
  }
};

exports.actualizarPassword = async (req, res) => {
  try {
    await ClassUsuario.actualizarPassword(
      req.params.id_usuario,
      req.body
    );
    res.json({
      success: true,
      mensaje: "Contraseña actualizada exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al actualizar contraseña",
      detalles: error.message
    });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const usuarioEliminado = await ClassUsuario.eliminar(req.params.id_usuario);
    res.json({
      success: true,
      mensaje: "Usuario eliminado exitosamente",
      data: usuarioEliminado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al eliminar usuario",
      detalles: error.message
    });
  }
};