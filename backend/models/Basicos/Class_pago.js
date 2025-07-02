// backend/models/Basicos/Class_pago.js
const db = require("../../config/db");
const ClassReserva = require("./Class_reserva");

class ClassPago {
  constructor(id_pago, id_reserva, monto, metodo_pago, estado, fecha_pago, transaccion_id) {
    this.id_pago = id_pago;
    this.id_reserva = id_reserva;
    this.monto = monto;
    this.metodo_pago = metodo_pago;
    this.estado = estado;
    this.fecha_pago = fecha_pago;
    this.transaccion_id = transaccion_id;
  }

  static async crear({ id_reserva, monto, metodo_pago, transaccion_id = null }) {
    try {
      // Validaciones
      if (!id_reserva || !monto || !metodo_pago) {
        throw new Error('Datos incompletos: reserva, monto y método son requeridos');
      }

      if (isNaN(monto) || monto <= 0) {
        throw new Error('El monto debe ser un número positivo');
      }

      const metodosPermitidos = ['tarjeta', 'transferencia', 'efectivo'];
      if (!metodosPermitidos.includes(metodo_pago)) {
        throw new Error('Método de pago no válido');
      }

      // Verificar que la reserva existe
      const reserva = await ClassReserva.obtenerPorId(id_reserva);
      if (!reserva) {
        throw new Error('La reserva especificada no existe');
      }

      const result = await db.query(
        `INSERT INTO pagos 
         (id_reserva, monto, metodo_pago, estado, transaccion_id) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [id_reserva, monto, metodo_pago, 'pendiente', transaccion_id]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al registrar pago: ${error.message}`);
    }
  }

  static async obtenerTodos() {
    try {
      const result = await db.query(
        `SELECT p.*, 
        r.fecha_reserva,
        u.nombre as nombre_usuario,
        h.hora_inicio, h.hora_fin,
        c.nombre as nombre_cancha
        FROM pagos p
        JOIN reservas r ON p.id_reserva = r.id_reserva
        JOIN usuarios u ON r.id_usuario = u.id_usuario
        JOIN horarios_disponibles h ON r.id_horario = h.id_horario
        JOIN canchas c ON h.id_cancha = c.id_cancha
        ORDER BY p.fecha_pago DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener todos los pagos: ${error.message}`);
    }
  }

  static async obtenerPorReserva(id_reserva) {
    try {
      const result = await db.query(
        "SELECT * FROM pagos WHERE id_reserva = $1 ORDER BY fecha_pago DESC",
        [id_reserva]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener pagos: ${error.message}`);
    }
  }

  static async obtenerPorId(id_pago) {
    try {
      const result = await db.query(
        "SELECT * FROM pagos WHERE id_pago = $1",
        [id_pago]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener pago: ${error.message}`);
    }
  }

  static async actualizarEstado(id_pago, { estado, transaccion_id = null }) {
    try {
      const estadosPermitidos = ['pendiente', 'completado', 'rechazado', 'reembolsado'];
      if (!estadosPermitidos.includes(estado)) {
        throw new Error('Estado no válido');
      }

      const result = await db.query(
        `UPDATE pagos SET estado = $1, fecha_pago = CASE WHEN $1 = 'completado' THEN NOW() ELSE fecha_pago END, 
         transaccion_id = COALESCE($2, transaccion_id)
         WHERE id_pago = $3 RETURNING *`,
        [estado, transaccion_id, id_pago]
      );

      if (!result.rows[0]) {
        throw new Error('Pago no encontrado');
      }

      // Si el pago se completa, actualizar estado de la reserva
      if (estado === 'completado') {
        await ClassReserva.actualizarEstado(
          result.rows[0].id_reserva, 
          'confirmada'
        );
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar pago: ${error.message}`);
    }
  }

  static async obtenerPorUsuario(id_usuario) {
    try {
      const result = await db.query(
        `SELECT p.*, r.fecha_reserva 
         FROM pagos p
         JOIN reservas r ON p.id_reserva = r.id_reserva
         WHERE r.id_usuario = $1
         ORDER BY p.fecha_pago DESC`,
        [id_usuario]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener pagos del usuario: ${error.message}`);
    }
  }
}

module.exports = ClassPago;