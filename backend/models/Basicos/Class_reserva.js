// backend/models/Basicos/Class_reserva.js
const db = require("../../config/db");
const ClassUsuario = require("./Class_usuario");
const ClassHorarioDisponible = require("./Class_horario_disponible");

class ClassReserva {
  constructor(id_reserva, id_usuario, id_horario, fecha_reserva, estado, fecha_creacion) {
    this.id_reserva = id_reserva;
    this.id_usuario = id_usuario;
    this.id_horario = id_horario;
    this.fecha_reserva = fecha_reserva;
    this.estado = estado;
    this.fecha_creacion = fecha_creacion;
  }

  static async crear({ id_usuario, id_horario, fecha_reserva }) {
    try {
      // Validaciones
      if (!id_usuario || !id_horario || !fecha_reserva) {
        throw new Error('Datos incompletos: usuario, horario y fecha son requeridos');
      }

      // Verificar que el usuario existe
      const usuario = await ClassUsuario.obtenerPorId(id_usuario);
      if (!usuario) {
        throw new Error('El usuario especificado no existe');
      }

      // Verificar que el horario existe y está disponible
      const horario = await ClassHorarioDisponible.obtenerPorId(id_horario);
      if (!horario || !horario.disponible) {
        throw new Error('El horario no está disponible');
      }

      // Verificar que no haya otra reserva para el mismo horario y fecha
      const reservaExistente = await db.query(
        "SELECT 1 FROM reservas WHERE id_horario = $1 AND fecha_reserva = $2 LIMIT 1",
        [id_horario, fecha_reserva]
      );

      if (reservaExistente.rows[0]) {
        throw new Error('Ya existe una reserva para este horario y fecha');
      }

      const result = await db.query(
        `INSERT INTO reservas 
         (id_usuario, id_horario, fecha_reserva) 
         VALUES ($1, $2, $3) RETURNING *`,
        [id_usuario, id_horario, fecha_reserva]
      );

      // Actualizar disponibilidad del horario
      await ClassHorarioDisponible.actualizarDisponibilidad(id_horario, false);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear reserva: ${error.message}`);
    }
  }

  static async obtenerPorUsuario(id_usuario) {
    try {
      const result = await db.query(
        `SELECT r.*, h.dia_semana, h.hora_inicio, h.hora_fin, c.nombre as nombre_cancha 
         FROM reservas r
         JOIN horarios_disponibles h ON r.id_horario = h.id_horario
         JOIN canchas c ON h.id_cancha = c.id_cancha
         WHERE r.id_usuario = $1
         ORDER BY r.fecha_reserva DESC`,
        [id_usuario]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener reservas: ${error.message}`);
    }
  }

  static async obtenerPorId(id_reserva) {
    try {
      const result = await db.query(
        `SELECT r.*, h.dia_semana, h.hora_inicio, h.hora_fin, c.nombre as nombre_cancha 
         FROM reservas r
         JOIN horarios_disponibles h ON r.id_horario = h.id_horario
         JOIN canchas c ON h.id_cancha = c.id_cancha
         WHERE r.id_reserva = $1`,
        [id_reserva]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener reserva: ${error.message}`);
    }
  }

  static async actualizarEstado(id_reserva, estado) {
    try {
      const estadosPermitidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
      if (!estadosPermitidos.includes(estado)) {
        throw new Error('Estado no válido');
      }

      const result = await db.query(
        `UPDATE reservas SET estado = $1 
         WHERE id_reserva = $2 RETURNING *`,
        [estado, id_reserva]
      );

      if (!result.rows[0]) {
        throw new Error('Reserva no encontrada');
      }

      // Si se cancela, liberar el horario
      if (estado === 'cancelada') {
        await ClassHorarioDisponible.actualizarDisponibilidad(
          result.rows[0].id_horario, 
          true
        );
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar reserva: ${error.message}`);
    }
  }

  static async eliminar(id_reserva) {
    try {
      // Obtener reserva para liberar horario
      const reserva = await this.obtenerPorId(id_reserva);
      if (!reserva) {
        throw new Error('Reserva no encontrada');
      }

      const result = await db.query(
        "DELETE FROM reservas WHERE id_reserva = $1 RETURNING *",
        [id_reserva]
      );

      // Liberar horario asociado
      await ClassHorarioDisponible.actualizarDisponibilidad(
        reserva.id_horario, 
        true
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar reserva: ${error.message}`);
    }
  }
}

module.exports = ClassReserva;