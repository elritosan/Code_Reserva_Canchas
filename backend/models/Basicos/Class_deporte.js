// backend/models/Basicos/Class_deporte.js
const db = require("../../config/db");

class ClassDeporte {
  constructor(id_deporte, nombre, descripcion, imagen_url) {
    this.id_deporte = id_deporte;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.imagen_url = imagen_url;
  }

  static async crear({ nombre, descripcion = null, imagen_url = null }) {
    try {
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre del deporte es requerido');
      }

      const result = await db.query(
        `INSERT INTO deportes 
         (nombre, descripcion, imagen_url) 
         VALUES ($1, $2, $3) RETURNING *`,
        [nombre.trim(), descripcion, imagen_url]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un deporte con ese nombre');
      }
      throw new Error(`Error al crear deporte: ${error.message}`);
    }
  }

  static async obtenerTodos() {
    try {
      const result = await db.query(
        "SELECT * FROM deportes ORDER BY nombre"
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener deportes: ${error.message}`);
    }
  }

  static async obtenerPorId(id_deporte) {
    try {
      const result = await db.query(
        "SELECT * FROM deportes WHERE id_deporte = $1",
        [id_deporte]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener deporte: ${error.message}`);
    }
  }

  static async actualizar(id_deporte, { nombre, descripcion, imagen_url }) {
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
      if (imagen_url !== undefined) {
        fields.push(`imagen_url = $${paramIndex++}`);
        values.push(imagen_url);
      }

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(id_deporte);
      const query = `UPDATE deportes SET ${fields.join(', ')} 
                    WHERE id_deporte = $${paramIndex} RETURNING *`;

      const result = await db.query(query, values);
      if (!result.rows[0]) {
        throw new Error('Deporte no encontrado');
      }
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un deporte con ese nombre');
      }
      throw new Error(`Error al actualizar deporte: ${error.message}`);
    }
  }

  static async eliminar(id_deporte) {
    try {
      // Verificar si el deporte tiene canchas asociadas
      const tieneCanchas = await db.query(
        "SELECT 1 FROM canchas WHERE id_deporte = $1 LIMIT 1",
        [id_deporte]
      );

      if (tieneCanchas.rows[0]) {
        throw new Error('No se puede eliminar el deporte porque tiene canchas asociadas');
      }

      const result = await db.query(
        "DELETE FROM deportes WHERE id_deporte = $1 RETURNING *",
        [id_deporte]
      );
      
      if (!result.rows[0]) {
        throw new Error('Deporte no encontrado');
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar deporte: ${error.message}`);
    }
  }
}

module.exports = ClassDeporte;