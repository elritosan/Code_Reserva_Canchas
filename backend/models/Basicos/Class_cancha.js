// backend/models/Basicos/Class_cancha.js
const db = require("../../config/db");
const ClassDeporte = require("./Class_deporte");

class ClassCancha {
  constructor(id_cancha, nombre, id_deporte, descripcion, precio_hora, imagen_url, activa) {
    this.id_cancha = id_cancha;
    this.nombre = nombre;
    this.id_deporte = id_deporte;
    this.descripcion = descripcion;
    this.precio_hora = precio_hora;
    this.imagen_url = imagen_url;
    this.activa = activa;
  }

  static async crear({ nombre, id_deporte, descripcion = null, precio_hora, imagen_url = null }) {
    try {
      // Validaciones
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre de la cancha es requerido');
      }

      if (!id_deporte) {
        throw new Error('El deporte es requerido');
      }

      if (!precio_hora || isNaN(precio_hora) || precio_hora <= 0) {
        throw new Error('El precio por hora debe ser un número positivo');
      }

      // Verificar que el deporte existe
      const deporte = await ClassDeporte.obtenerPorId(id_deporte);
      if (!deporte) {
        throw new Error('El deporte especificado no existe');
      }

      const result = await db.query(
        `INSERT INTO canchas 
         (nombre, id_deporte, descripcion, precio_hora, imagen_url) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [nombre.trim(), id_deporte, descripcion, precio_hora, imagen_url]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe una cancha con ese nombre para este deporte');
      }
      throw new Error(`Error al crear cancha: ${error.message}`);
    }
  }

  static async obtenerTodas() {
    try {
      const result = await db.query(
        "SELECT * FROM canchas ORDER BY nombre"
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener canchas: ${error.message}`);
    }
  }

  static async obtenerPorDeporte(id_deporte) {
    try {
      const result = await db.query(
        "SELECT * FROM canchas WHERE id_deporte = $1 AND activa = true ORDER BY nombre",
        [id_deporte]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener canchas por deporte: ${error.message}`);
    }
  }

  static async obtenerPorId(id_cancha) {
    try {
      const result = await db.query(
        "SELECT * FROM canchas WHERE id_cancha = $1",
        [id_cancha]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener cancha: ${error.message}`);
    }
  }

  static async actualizar(id_cancha, { nombre, id_deporte, descripcion, precio_hora, imagen_url, activa }) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (nombre !== undefined) {
        fields.push(`nombre = $${paramIndex++}`);
        values.push(nombre.trim());
      }
      if (id_deporte !== undefined) {
        fields.push(`id_deporte = $${paramIndex++}`);
        values.push(id_deporte);
      }
      if (descripcion !== undefined) {
        fields.push(`descripcion = $${paramIndex++}`);
        values.push(descripcion);
      }
      if (precio_hora !== undefined) {
        fields.push(`precio_hora = $${paramIndex++}`);
        values.push(precio_hora);
      }
      if (imagen_url !== undefined) {
        fields.push(`imagen_url = $${paramIndex++}`);
        values.push(imagen_url);
      }
      if (activa !== undefined) {
        fields.push(`activa = $${paramIndex++}`);
        values.push(activa);
      }

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(id_cancha);
      const query = `UPDATE canchas SET ${fields.join(', ')} 
                    WHERE id_cancha = $${paramIndex} RETURNING *`;

      const result = await db.query(query, values);
      if (!result.rows[0]) {
        throw new Error('Cancha no encontrada');
      }
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe una cancha con ese nombre para este deporte');
      }
      throw new Error(`Error al actualizar cancha: ${error.message}`);
    }
  }

  static async eliminar(id_cancha) {
    try {
      // Verificar si la cancha tiene horarios/reservas asociadas
      const tieneHorarios = await db.query(
        "SELECT 1 FROM horarios_disponibles WHERE id_cancha = $1 LIMIT 1",
        [id_cancha]
      );

      if (tieneHorarios.rows[0]) {
        throw new Error('No se puede eliminar la cancha porque tiene horarios asociados');
      }

      // Eliminación lógica (desactivación)
      const result = await db.query(
        `UPDATE canchas SET activa = false 
         WHERE id_cancha = $1 RETURNING *`,
        [id_cancha]
      );
      
      if (!result.rows[0]) {
        throw new Error('Cancha no encontrada');
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar cancha: ${error.message}`);
    }
  }
}

module.exports = ClassCancha;