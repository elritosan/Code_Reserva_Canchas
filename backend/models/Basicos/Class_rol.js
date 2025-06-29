// backend/models/Basicos/Class_rol.js
const db = require("../../config/db");

class ClassRol {
  constructor(id_rol, nombre, descripcion) {
    this.id_rol = id_rol;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }

  static async crear({ nombre, descripcion = null }) {
    try {
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre del rol es requerido');
      }

      const result = await db.query(
        `INSERT INTO roles (nombre, descripcion) 
         VALUES ($1, $2) RETURNING *`,
        [nombre.trim(), descripcion]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un rol con ese nombre');
      }
      throw new Error(`Error al crear rol: ${error.message}`);
    }
  }

  static async obtenerTodos() {
    try {
      const result = await db.query("SELECT * FROM roles ORDER BY nombre");
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener roles: ${error.message}`);
    }
  }

  static async obtenerPorId(id_rol) {
    try {
      const result = await db.query(
        "SELECT * FROM roles WHERE id_rol = $1",
        [id_rol]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener rol: ${error.message}`);
    }
  }

  static async actualizar(id_rol, { nombre, descripcion }) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (nombre !== undefined) {
        fields.push(`nombre = $${paramIndex++}`);
        values.push(nombre.trim());
      }
      if (descripcion !== undefined) {
        fields.push(`descripcion = $${paramIndex++}`);
        values.push(descripcion);
      }

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(id_rol);
      const query = `UPDATE roles SET ${fields.join(', ')} 
                     WHERE id_rol = $${paramIndex} RETURNING *`;

      const result = await db.query(query, values);
      if (!result.rows[0]) {
        throw new Error('Rol no encontrado');
      }
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un rol con ese nombre');
      }
      throw new Error(`Error al actualizar rol: ${error.message}`);
    }
  }

  static async eliminar(id_rol) {
    try {
      // Verificar si el rol está asignado a usuarios
      const enUso = await db.query(
        "SELECT 1 FROM usuarios WHERE id_rol = $1 LIMIT 1",
        [id_rol]
      );
      if (enUso.rows[0]) {
        throw new Error('No se puede eliminar el rol porque está asignado a usuarios');
      }

      const result = await db.query(
        "DELETE FROM roles WHERE id_rol = $1 RETURNING *",
        [id_rol]
      );
      if (!result.rows[0]) {
        throw new Error('Rol no encontrado');
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar rol: ${error.message}`);
    }
  }
}

module.exports = ClassRol;