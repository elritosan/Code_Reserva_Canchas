// backend/test/integration/reserva.api.test.js
const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('API Reserva - Pruebas de Integración', () => {
  let testReservaId;
  let testUsuarioId;
  let testHorarioId;
  let testCanchaId;
  let testDeporteId;
  let testRolId;
  const testFecha = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Fecha de mañana

  beforeAll(async () => {
    // Limpiar datos de pruebas anteriores
    await db.query("DELETE FROM reservas WHERE fecha_creacion > NOW() - INTERVAL '1 DAY'");
    
    // Crear datos de prueba necesarios (rol -> usuario -> deporte -> cancha -> horario)
    const rolRes = await request(app)
      .post('/api/roles')
      .send({ nombre: `rol_test_${Date.now()}`.substring(0, 20) });
    testRolId = rolRes.body.data.id_rol;

    const usuarioRes = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: "Usuario Test",
        email: `test${Date.now()}@example.com`,
        password: "password123",
        id_rol: testRolId
      });
    testUsuarioId = usuarioRes.body.data.id_usuario;

    const deporteRes = await request(app)
      .post('/api/deportes')
      .send({ nombre: `deporte_test_${Date.now()}`.substring(0, 30) });
    testDeporteId = deporteRes.body.data.id_deporte;

    const canchaRes = await request(app)
      .post('/api/canchas')
      .send({
        nombre: `cancha_test_${Date.now()}`.substring(0, 50),
        id_deporte: testDeporteId,
        precio_hora: 150.00
      });
    testCanchaId = canchaRes.body.data.id_cancha;

    const horarioRes = await request(app)
      .post('/api/horarios')
      .send({
        id_cancha: testCanchaId,
        dia_semana: 1, // Lunes
        hora_inicio: "10:00",
        hora_fin: "11:00"
      });
    testHorarioId = horarioRes.body.data.id_horario;
  });

  afterAll(async () => {
    // Limpieza en orden inverso de dependencias
    if (testReservaId) await db.query("DELETE FROM reservas WHERE id_reserva = $1", [testReservaId]);
    await db.query("DELETE FROM horarios_disponibles WHERE id_horario = $1", [testHorarioId]);
    await db.query("DELETE FROM canchas WHERE id_cancha = $1", [testCanchaId]);
    await db.query("DELETE FROM deportes WHERE id_deporte = $1", [testDeporteId]);
    await db.query("DELETE FROM usuarios WHERE id_usuario = $1", [testUsuarioId]);
    await db.query("DELETE FROM roles WHERE id_rol = $1", [testRolId]);
    await db.end();
  });

  test('POST /api/reservas - Debería crear una nueva reserva', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .send({
        id_usuario: testUsuarioId,
        id_horario: testHorarioId,
        fecha_reserva: testFecha
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.objectContaining({
      id_reserva: expect.any(Number),
      id_usuario: testUsuarioId,
      id_horario: testHorarioId,
      estado: 'pendiente'
    }));
    testReservaId = res.body.data.id_reserva;
  });

  test('POST /api/reservas - Debería fallar con datos incompletos', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .send({
        id_usuario: testUsuarioId,
        fecha_reserva: testFecha
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Datos incompletos/);
  });

  test('POST /api/reservas - Debería fallar con horario no disponible', async () => {
    // El horario ya está reservado por la prueba anterior
    const res = await request(app)
      .post('/api/reservas')
      .send({
        id_usuario: testUsuarioId,
        id_horario: testHorarioId,
        fecha_reserva: testFecha
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.detalles).toMatch(/El horario no está disponible/);
  });

  test('GET /api/reservas - Debería listar todas las reservas', async () => {
    const res = await request(app)
      .get('/api/reservas')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id_reserva: expect.any(Number),
        nombre_usuario: expect.any(String),
        nombre_cancha: expect.any(String)
      })
    ]));
  });

  test('GET /api/reservas/usuario/:id_usuario - Debería listar reservas de un usuario', async () => {
    const res = await request(app)
      .get(`/api/reservas/usuario/${testUsuarioId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.some(r => r.id_reserva === testReservaId)).toBe(true);
  });

  test('GET /api/reservas/:id_reserva - Debería obtener una reserva específica', async () => {
    const res = await request(app)
      .get(`/api/reservas/${testReservaId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_reserva).toBe(testReservaId);
    expect(res.body.data.id_usuario).toBe(testUsuarioId);
  });

  test('PUT /api/reservas/:id_reserva/estado - Debería actualizar el estado de una reserva', async () => {
    const res = await request(app)
      .put(`/api/reservas/${testReservaId}/estado`)
      .send({ estado: 'confirmada' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.estado).toBe('confirmada');
  });

  test('DELETE /api/reservas/:id_reserva - Debería eliminar una reserva pendiente', async () => {
    // Crear reserva temporal para eliminar
    const horarioTemp = await request(app)
      .post('/api/horarios')
      .send({
        id_cancha: testCanchaId,
        dia_semana: 2, // Martes
        hora_inicio: "12:00",
        hora_fin: "13:00"
      });

    const reservaTemp = await request(app)
      .post('/api/reservas')
      .send({
        id_usuario: testUsuarioId,
        id_horario: horarioTemp.body.data.id_horario,
        fecha_reserva: testFecha
      });

    const res = await request(app)
      .delete(`/api/reservas/${reservaTemp.body.data.id_reserva}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_reserva).toBe(reservaTemp.body.data.id_reserva);

    // Limpieza
    await db.query("DELETE FROM horarios_disponibles WHERE id_horario = $1", [horarioTemp.body.data.id_horario]);
  });

  test('DELETE /api/reservas/:id_reserva - Debería fallar al eliminar reserva confirmada', async () => {
    const res = await request(app)
      .delete(`/api/reservas/${testReservaId}`) // Reserva confirmada en prueba anterior
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/No se puede eliminar una reserva confirmada/);
  });
});