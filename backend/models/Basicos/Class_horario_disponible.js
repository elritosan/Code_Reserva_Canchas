// backend/models/Basicos/Class_horario_disponible.js
const db = require("../../config/db");
const ClassCancha = require("./Class_cancha");

class ClassHorarioDisponible {
  constructor(id_horario, id_cancha, dia_semana, hora_inicio, hora_fin, disponible) {
    this.id_horario = id_horario;
    this.id_cancha = id_cancha;
    this.dia_semana = dia_semana;
    this.hora_inicio = hora_inicio;
    this.hora_fin = hora_fin;
    this.disponible = disponible;
  }

  static async crear({ id_cancha, dia_semana, hora_inicio, hora_fin }) {
    try {
      // Validaciones
      if (!id_cancha) {
        throw new Error('ID de cancha es requerido');
      }

      if (!dia_semana || dia_semana < 1 || dia_semana > 7) {
        throw new Error('Día de semana debe ser entre 1 (Lunes) y 7 (Domingo)');
      }

      if (!hora_inicio || !hora_fin) {
        throw new Error('Hora inicio y fin son requeridas');
      }

      // Verificar que la cancha existe
      const cancha = await ClassCancha.obtenerPorId(id_cancha);
      if (!cancha) {
        throw new Error('La cancha especificada no existe');
      }

      // Verificar que el horario no se solape
      const horarioSolapado = await db.query(
        `SELECT 1 FROM horarios_disponibles 
         WHERE id_cancha = $1 AND dia_semana = $2 AND 
         (($3 BETWEEN hora_inicio AND hora_fin) OR 
          ($4 BETWEEN hora_inicio AND hora_fin)) LIMIT 1`,
        [id_cancha, dia_semana, hora_inicio, hora_fin]
      );

      if (horarioSolapado.rows[0]) {
        throw new Error('El horario se solapa con otro existente');
      }

      const result = await db.query(
        `INSERT INTO horarios_disponibles 
         (id_cancha, dia_semana, hora_inicio, hora_fin) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [id_cancha, dia_semana, hora_inicio, hora_fin]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un horario con estos datos');
      }
      throw new Error(`Error al crear horario: ${error.message}`);
    }
  }

  static async obtenerTodos() {
    try {
      const result = await db.query(
        `SELECT h.*, c.nombre as nombre_cancha 
        FROM horarios_disponibles h
        JOIN canchas c ON h.id_cancha = c.id_cancha
        ORDER BY h.dia_semana, h.hora_inicio`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener todos los horarios: ${error.message}`);
    }
  }

  static async obtenerPorCancha(id_cancha) {
    try {
      const result = await db.query(
        `SELECT * FROM horarios_disponibles 
         WHERE id_cancha = $1 AND disponible = true 
         ORDER BY dia_semana, hora_inicio`,
        [id_cancha]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener horarios: ${error.message}`);
    }
  }

  static async obtenerPorId(id_horario) {
    try {
      const result = await db.query(
        "SELECT * FROM horarios_disponibles WHERE id_horario = $1",
        [id_horario]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener horario: ${error.message}`);
    }
  }

  static async actualizarDisponibilidad(id_horario, disponible) {
    try {
      const result = await db.query(
        `UPDATE horarios_disponibles SET disponible = $1 
         WHERE id_horario = $2 RETURNING *`,
        [disponible, id_horario]
      );
      if (!result.rows[0]) {
        throw new Error('Horario no encontrado');
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar disponibilidad: ${error.message}`);
    }
  }

  static async eliminar(id_horario) {
    try {
      // Verificar si el horario tiene reservas
      const tieneReservas = await db.query(
        "SELECT 1 FROM reservas WHERE id_horario = $1 LIMIT 1",
        [id_horario]
      );

      if (tieneReservas.rows[0]) {
        throw new Error('No se puede eliminar el horario porque tiene reservas asociadas');
      }

      const result = await db.query(
        "DELETE FROM horarios_disponibles WHERE id_horario = $1 RETURNING *",
        [id_horario]
      );
      
      if (!result.rows[0]) {
        throw new Error('Horario no encontrado');
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar horario: ${error.message}`);
    }
  }
}

module.exports = ClassHorarioDisponible;