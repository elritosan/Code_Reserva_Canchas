// backend/test/unit/reserva.model.test.js
const db = require("../../config/db");
const ClassReserva = require("../../models/Basicos/Class_reserva");
const ClassUsuario = require("../../models/Basicos/Class_usuario");
const ClassHorarioDisponible = require("../../models/Basicos/Class_horario_disponible");
const ClassCancha = require("../../models/Basicos/Class_cancha");
const ClassDeporte = require("../../models/Basicos/Class_deporte");
const ClassRol = require("../../models/Basicos/Class_rol");

describe("Modelo Reserva - Pruebas Unitarias", () => {
  let testReservaId;
  let testUsuarioId;
  let testHorarioId;
  let testHorarioAlternoId; // Nuevo horario para pruebas alternas
  const testFecha = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Fecha de mañana

  beforeAll(async () => {
    // Crear datos de prueba relacionados
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
      precio_hora: 100
    });
    
    // Crear dos horarios de prueba
    const horario1 = await ClassHorarioDisponible.crear({
      id_cancha: cancha.id_cancha,
      dia_semana: 1, // Lunes
      hora_inicio: "10:00",
      hora_fin: "11:00"
    });
    testHorarioId = horario1.id_horario;

    const horario2 = await ClassHorarioDisponible.crear({
      id_cancha: cancha.id_cancha,
      dia_semana: 2, // Martes
      hora_inicio: "12:00",
      hora_fin: "13:00"
    });
    testHorarioAlternoId = horario2.id_horario;
  });

  afterAll(async () => {
    // Limpieza en orden correcto
    await db.query("DELETE FROM reservas WHERE id_reserva = $1", [testReservaId]);
    await db.query("DELETE FROM horarios_disponibles WHERE id_horario IN ($1, $2)", [testHorarioId, testHorarioAlternoId]);
    await db.query("DELETE FROM canchas WHERE id_cancha IN (SELECT id_cancha FROM horarios_disponibles WHERE id_horario IN ($1, $2))", [testHorarioId, testHorarioAlternoId]);
    await db.query("DELETE FROM deportes WHERE id_deporte IN (SELECT id_deporte FROM canchas WHERE id_cancha IN (SELECT id_cancha FROM horarios_disponibles WHERE id_horario IN ($1, $2)))", [testHorarioId, testHorarioAlternoId]);
    await db.query("DELETE FROM usuarios WHERE id_usuario = $1", [testUsuarioId]);
    await db.query("DELETE FROM roles WHERE id_rol IN (SELECT id_rol FROM usuarios WHERE id_usuario = $1)", [testUsuarioId]);
    await db.end();
  });

  test("crear() debería registrar una nueva reserva", async () => {
    const reserva = await ClassReserva.crear({
      id_usuario: testUsuarioId,
      id_horario: testHorarioId,
      fecha_reserva: testFecha
    });
    
    testReservaId = reserva.id_reserva;
    
    // Comparación de fechas sin zona horaria
    const fechaEsperada = new Date(testFecha);
    const fechaRecibida = new Date(reserva.fecha_reserva);
    
    expect(reserva).toMatchObject({
      id_usuario: testUsuarioId,
      id_horario: testHorarioId,
      estado: 'pendiente'
    });
    expect(fechaRecibida.toISOString().split('T')[0]).toBe(fechaEsperada.toISOString().split('T')[0]);
  });

  test("crear() debería fallar con datos incompletos", async () => {
    await expect(ClassReserva.crear({
      id_usuario: testUsuarioId,
      fecha_reserva: testFecha
    })).rejects.toThrow("Datos incompletos");
  });

  test("crear() debería fallar con horario no disponible", async () => {
    // El horario ya está reservado por la prueba anterior
    await expect(ClassReserva.crear({
      id_usuario: testUsuarioId,
      id_horario: testHorarioId,
      fecha_reserva: testFecha
    })).rejects.toThrow("El horario no está disponible");
  });

  test("obtenerTodos() debería listar todas las reservas", async () => {
    const reservas = await ClassReserva.obtenerTodos();
    expect(reservas.some(r => r.id_reserva === testReservaId)).toBe(true);
  });

  test("obtenerPorUsuario() debería listar reservas del usuario", async () => {
    const reservas = await ClassReserva.obtenerPorUsuario(testUsuarioId);
    expect(reservas.length).toBeGreaterThan(0);
    expect(reservas[0].id_usuario).toBe(testUsuarioId);
  });

  test("actualizarEstado() debería cambiar el estado y liberar horario", async () => {
    const reserva = await ClassReserva.actualizarEstado(testReservaId, 'cancelada');
    expect(reserva.estado).toBe('cancelada');

    // Verificar que el horario se liberó
    const horario = await ClassHorarioDisponible.obtenerPorId(testHorarioId);
    expect(horario.disponible).toBe(true);
  });

  test("eliminar() debería borrar la reserva y liberar horario", async () => {
    // Crear reserva temporal para eliminar
    const horarioTemp = await ClassHorarioDisponible.crear({
      id_cancha: 1, // Asumiendo que existe
      dia_semana: 2,
      hora_inicio: "12:00",
      hora_fin: "13:00"
    });
    const reservaTemp = await ClassReserva.crear({
      id_usuario: testUsuarioId,
      id_horario: horarioTemp.id_horario,
      fecha_reserva: testFecha
    });

    const result = await ClassReserva.eliminar(reservaTemp.id_reserva);
    expect(result.id_reserva).toBe(reservaTemp.id_reserva);

    // Verificar que el horario está disponible
    const horario = await ClassHorarioDisponible.obtenerPorId(horarioTemp.id_horario);
    expect(horario.disponible).toBe(true);

    // Limpieza
    await db.query("DELETE FROM horarios_disponibles WHERE id_horario = $1", [horarioTemp.id_horario]);
  });

  test("eliminar() debería fallar si la reserva está confirmada", async () => {
    // Crear reserva con horario alterno
    const reservaConfirmada = await ClassReserva.crear({
      id_usuario: testUsuarioId,
      id_horario: testHorarioAlternoId,
      fecha_reserva: testFecha
    });
    
    // Confirmar la reserva
    await ClassReserva.actualizarEstado(reservaConfirmada.id_reserva, 'confirmada');
    
    // Intentar eliminar
    try {
      await ClassReserva.eliminar(reservaConfirmada.id_reserva);
      fail("Debería haber lanzado un error");
    } catch (error) {
      expect(error.message).toMatch(/No se puede eliminar una reserva confirmada/);
    } finally {
      // Limpieza
      await db.query("UPDATE reservas SET estado = 'cancelada' WHERE id_reserva = $1", [reservaConfirmada.id_reserva]);
      await ClassReserva.eliminar(reservaConfirmada.id_reserva);
    }
  });
});