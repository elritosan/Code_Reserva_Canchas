// backend/test/unit/pago.model.test.js
const db = require("../../config/db");
const ClassPago = require("../../models/Basicos/Class_pago");
const ClassReserva = require("../../models/Basicos/Class_reserva");
const ClassUsuario = require("../../models/Basicos/Class_usuario");
const ClassHorarioDisponible = require("../../models/Basicos/Class_horario_disponible");
const ClassCancha = require("../../models/Basicos/Class_cancha");
const ClassDeporte = require("../../models/Basicos/Class_deporte");
const ClassRol = require("../../models/Basicos/Class_rol");

describe("Modelo Pago - Pruebas Unitarias", () => {
  let testPagoId;
  let testReservaId;
  let testUsuarioId;
  const testTransaccionId = `trans_${Date.now()}`;

  beforeAll(async () => {
    // Configurar datos de prueba completos (rol -> usuario -> deporte -> cancha -> horario -> reserva)
    const rol = await ClassRol.crear({ nombre: `rol_${Date.now()}`.substring(0, 20) });
    const usuario = await ClassUsuario.crear({
      nombre: "Usuario Test",
      email: `test${Date.now()}@example.com`,
      password: "password123",
      id_rol: rol.id_rol
    });
    testUsuarioId = usuario.id_usuario;

    const deporte = await ClassDeporte.crear({ nombre: `deporte_${Date.now()}`.substring(0, 30) });
    const cancha = await ClassCancha.crear({
      nombre: `cancha_${Date.now()}`.substring(0, 50),
      id_deporte: deporte.id_deporte,
      precio_hora: 150 // Precio para calcular montos
    });

    const horario = await ClassHorarioDisponible.crear({
      id_cancha: cancha.id_cancha,
      dia_semana: 3, // Miércoles
      hora_inicio: "14:00",
      hora_fin: "15:00"
    });

    const reserva = await ClassReserva.crear({
      id_usuario: testUsuarioId,
      id_horario: horario.id_horario,
      fecha_reserva: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Mañana
    });
    testReservaId = reserva.id_reserva;
  });

  afterAll(async () => {
    // Limpieza en orden inverso de dependencias
    await db.query("DELETE FROM pagos WHERE id_pago = $1", [testPagoId]);
    await db.query("DELETE FROM reservas WHERE id_reserva = $1", [testReservaId]);
    await db.query("DELETE FROM horarios_disponibles WHERE id_horario IN (SELECT id_horario FROM reservas WHERE id_reserva = $1)", [testReservaId]);
    await db.query("DELETE FROM canchas WHERE id_cancha IN (SELECT id_cancha FROM horarios_disponibles WHERE id_horario IN (SELECT id_horario FROM reservas WHERE id_reserva = $1))", [testReservaId]);
    await db.query("DELETE FROM deportes WHERE id_deporte IN (SELECT id_deporte FROM canchas WHERE id_cancha IN (SELECT id_cancha FROM horarios_disponibles WHERE id_horario IN (SELECT id_horario FROM reservas WHERE id_reserva = $1)))", [testReservaId]);
    await db.query("DELETE FROM usuarios WHERE id_usuario = $1", [testUsuarioId]);
    await db.query("DELETE FROM roles WHERE id_rol IN (SELECT id_rol FROM usuarios WHERE id_usuario = $1)", [testUsuarioId]);
    await db.end();
  });

  test("crear() debería registrar un nuevo pago", async () => {
    const pago = await ClassPago.crear({
      id_reserva: testReservaId,
      monto: 150,
      metodo_pago: "tarjeta",
      transaccion_id: testTransaccionId
    });
    
    testPagoId = pago.id_pago;
    expect(pago).toMatchObject({
      id_reserva: testReservaId,
      monto: "150.00",
      metodo_pago: "tarjeta",
      estado: "pendiente",
      transaccion_id: testTransaccionId
    });
  });

  test("crear() debería fallar con datos incompletos", async () => {
    await expect(ClassPago.crear({
      id_reserva: testReservaId,
      monto: 150
    })).rejects.toThrow("Datos incompletos");
  });

  test("crear() debería fallar con monto inválido", async () => {
    await expect(ClassPago.crear({
      id_reserva: testReservaId,
      monto: -100,
      metodo_pago: "transferencia"
    })).rejects.toThrow("El monto debe ser un número positivo");
  });

  test("crear() debería fallar con método de pago inválido", async () => {
    await expect(ClassPago.crear({
      id_reserva: testReservaId,
      monto: 150,
      metodo_pago: "cripto"
    })).rejects.toThrow("Método de pago no válido");
  });

  test("obtenerTodos() debería listar todos los pagos", async () => {
    const pagos = await ClassPago.obtenerTodos();
    expect(pagos.some(p => p.id_pago === testPagoId)).toBe(true);
  });

  test("obtenerPorReserva() debería listar pagos de una reserva", async () => {
    const pagos = await ClassPago.obtenerPorReserva(testReservaId);
    expect(pagos.length).toBeGreaterThan(0);
    expect(pagos[0].id_reserva).toBe(testReservaId);
  });

  test("obtenerPorUsuario() debería listar pagos de un usuario", async () => {
    const pagos = await ClassPago.obtenerPorUsuario(testUsuarioId);
    expect(pagos.length).toBeGreaterThan(0);
    expect(pagos.some(p => p.id_reserva === testReservaId)).toBe(true);
  });

  test("actualizarEstado() debería fallar con estado inválido", async () => {
    await expect(ClassPago.actualizarEstado(testPagoId, {
      estado: "invalido"
    })).rejects.toThrow("Estado no válido");
  });

  test("eliminar() debería borrar un pago", async () => {
    // Crear pago temporal para eliminar
    const pagoTemp = await ClassPago.crear({
      id_reserva: testReservaId,
      monto: 100,
      metodo_pago: "efectivo"
    });
    
    const result = await ClassPago.eliminar(pagoTemp.id_pago);
    expect(result.id_pago).toBe(pagoTemp.id_pago);
    
    // Verificar eliminación
    const pagoEliminado = await ClassPago.obtenerPorId(pagoTemp.id_pago);
    expect(pagoEliminado).toBeUndefined();
  });
});