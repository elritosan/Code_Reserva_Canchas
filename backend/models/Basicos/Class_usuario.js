// backend/models/Basicos/Class_usuario.js
const db = require("../../config/db");
const bcrypt = require('bcryptjs');
const ClassRol = require("./Class_rol");

class ClassUsuario {
  constructor(id_usuario, nombre, email, password_hash, telefono, id_rol, fecha_registro, verificado) {
    this.id_usuario = id_usuario;
    this.nombre = nombre;
    this.email = email;
    this.password_hash = password_hash;
    this.telefono = telefono;
    this.id_rol = id_rol;
    this.fecha_registro = fecha_registro;
    this.verificado = verificado;
  }

  static async crear({ nombre, email, password, telefono = null, id_rol = 2 }) {
    try {
      // Validaciones
      if (!nombre || !email || !password) {
        throw new Error('Nombre, email y contraseña son requeridos');
      }

      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      // Verificar si el rol existe
      const rolExistente = await ClassRol.obtenerPorId(id_rol);
      if (!rolExistente) {
        throw new Error('El rol especificado no existe');
      }

      // Hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await db.query(
        `INSERT INTO usuarios 
         (nombre, email, password_hash, telefono, id_rol) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [nombre.trim(), email.toLowerCase().trim(), passwordHash, telefono, id_rol]
      );
      
      // No retornar el password_hash en la respuesta
      const usuario = result.rows[0];
      delete usuario.password_hash;
      return usuario;
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('El email ya está registrado');
      }
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  static async obtenerTodos() {
    try {
      const result = await db.query(
        "SELECT id_usuario, nombre, email, telefono, id_rol, fecha_registro, verificado FROM usuarios ORDER BY nombre"
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  static async obtenerPorId(id_usuario) {
    try {
      const result = await db.query(
        "SELECT id_usuario, nombre, email, telefono, id_rol, fecha_registro, verificado FROM usuarios WHERE id_usuario = $1",
        [id_usuario]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  static async obtenerPorEmail(email) {
    try {
      const result = await db.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email.toLowerCase().trim()]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  static async actualizar(id_usuario, { nombre, email, telefono, id_rol, verificado }) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (nombre !== undefined) {
        fields.push(`nombre = $${paramIndex++}`);
        values.push(nombre.trim());
      }
      if (email !== undefined) {
        fields.push(`email = $${paramIndex++}`);
        values.push(email.toLowerCase().trim());
      }
      if (telefono !== undefined) {
        fields.push(`telefono = $${paramIndex++}`);
        values.push(telefono);
      }
      if (id_rol !== undefined) {
        fields.push(`id_rol = $${paramIndex++}`);
        values.push(id_rol);
      }
      if (verificado !== undefined) {
        fields.push(`verificado = $${paramIndex++}`);
        values.push(verificado);
      }

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(id_usuario);
      const query = `UPDATE usuarios SET ${fields.join(', ')} 
                    WHERE id_usuario = $${paramIndex} 
                    RETURNING id_usuario, nombre, email, telefono, id_rol, fecha_registro, verificado`;

      const result = await db.query(query, values);
      if (!result.rows[0]) {
        throw new Error('Usuario no encontrado');
      }
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('El email ya está registrado');
      }
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  static async actualizarPassword(id_usuario, { currentPassword, newPassword }) {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Se requieren ambas contraseñas');
      }

      if (newPassword.length < 8) {
        throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
      }

      // Obtener usuario y verificar contraseña actual
      const usuario = await db.query(
        "SELECT * FROM usuarios WHERE id_usuario = $1",
        [id_usuario]
      );

      if (!usuario.rows[0]) {
        throw new Error('Usuario no encontrado');
      }

      const isMatch = await bcrypt.compare(currentPassword, usuario.rows[0].password_hash);
      if (!isMatch) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hash de la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      await db.query(
        "UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2",
        [newPasswordHash, id_usuario]
      );

      return { success: true };
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }

  static async eliminar(id_usuario) {
    try {
      // Verificar si el usuario tiene reservas/pagos asociados
      const tieneReservas = await db.query(
        "SELECT 1 FROM reservas WHERE id_usuario = $1 LIMIT 1",
        [id_usuario]
      );

      if (tieneReservas.rows[0]) {
        throw new Error('No se puede eliminar el usuario porque tiene reservas asociadas');
      }

      const result = await db.query(
        "DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario, nombre, email",
        [id_usuario]
      );
      
      if (!result.rows[0]) {
        throw new Error('Usuario no encontrado');
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}

module.exports = ClassUsuario;