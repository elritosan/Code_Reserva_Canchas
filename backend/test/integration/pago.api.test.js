// backend/test/integration/pago.api.test.js
const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('API Pago - Pruebas de Integración', () => {
  let testPagoId;
  let testReservaId;
  let testUsuarioId;
  let testHorarioId;
  let testCanchaId;
  let testDeporteId;
  let testRolId;
  const testTransaccionId = `trans_${Date.now()}`;

  beforeAll(async () => {
    // Limpiar datos de pruebas anteriores
    await db.query("DELETE FROM pagos WHERE transaccion_id LIKE 'trans_%'");
    
    // Crear datos de prueba completos (rol -> usuario -> deporte -> cancha -> horario -> reserva)
    const rolRes = await request(app)
      .post('/api/roles')
      .send({
        nombre: `rol_${Date.now()}`.substring(0, 20),
        descripcion: "Rol para pruebas de pago"
      });
    testRolId = rolRes.body.data.id_rol;

    const usuarioRes = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: "Usuario Test Pago",
        email: `test_pago${Date.now()}@example.com`,
        password: "password123",
        id_rol: testRolId
      });
    testUsuarioId = usuarioRes.body.data.id_usuario;

    const deporteRes = await request(app)
      .post('/api/deportes')
      .send({
        nombre: `deporte_pago_${Date.now()}`.substring(0, 30),
        descripcion: "Deporte para pruebas de pago"
      });
    testDeporteId = deporteRes.body.data.id_deporte;

    const canchaRes = await request(app)
      .post('/api/canchas')
      .send({
        nombre: "Cancha Test Pago",
        id_deporte: testDeporteId,
        precio_hora: 150.50
      });
    testCanchaId = canchaRes.body.data.id_cancha;

    const horarioRes = await request(app)
      .post('/api/horarios')
      .send({
        id_cancha: testCanchaId,
        dia_semana: 3, // Miércoles
        hora_inicio: "14:00",
        hora_fin: "15:00"
      });
    testHorarioId = horarioRes.body.data.id_horario;

    const reservaRes = await request(app)
      .post('/api/reservas')
      .send({
        id_usuario: testUsuarioId,
        id_horario: testHorarioId,
        fecha_reserva: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Mañana
      });
    testReservaId = reservaRes.body.data.id_reserva;
  });

  afterAll(async () => {
    // Limpieza en orden inverso de dependencias
    await db.query("DELETE FROM pagos WHERE id_pago = $1", [testPagoId]);
    await db.query("DELETE FROM reservas WHERE id_reserva = $1", [testReservaId]);
    await db.query("DELETE FROM horarios_disponibles WHERE id_horario = $1", [testHorarioId]);
    await db.query("DELETE FROM canchas WHERE id_cancha = $1", [testCanchaId]);
    await db.query("DELETE FROM deportes WHERE id_deporte = $1", [testDeporteId]);
    await db.query("DELETE FROM usuarios WHERE id_usuario = $1", [testUsuarioId]);
    await db.query("DELETE FROM roles WHERE id_rol = $1", [testRolId]);
    await db.end();
  });

  test('POST /api/pagos - Debería registrar un nuevo pago', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .send({
        id_reserva: testReservaId,
        monto: 150.50,
        metodo_pago: "tarjeta",
        transaccion_id: testTransaccionId
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.objectContaining({
      id_pago: expect.any(Number),
      id_reserva: testReservaId,
      monto: "150.50",
      metodo_pago: "tarjeta",
      estado: "pendiente",
      transaccion_id: testTransaccionId
    }));
    testPagoId = res.body.data.id_pago;
  });

  test('POST /api/pagos - Debería fallar con datos incompletos', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .send({
        id_reserva: testReservaId,
        monto: 150.50
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Datos incompletos/);
  });

  test('POST /api/pagos - Debería fallar con monto inválido', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .send({
        id_reserva: testReservaId,
        monto: -100,
        metodo_pago: "transferencia"
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/El monto debe ser un número positivo/);
  });

  test('POST /api/pagos - Debería fallar con método de pago inválido', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .send({
        id_reserva: testReservaId,
        monto: 150.50,
        metodo_pago: "criptomoneda"
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Método de pago no válido/);
  });

  test('GET /api/pagos - Debería listar todos los pagos', async () => {
    const res = await request(app)
      .get('/api/pagos')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id_pago: expect.any(Number),
        id_reserva: expect.any(Number),
        monto: expect.any(String)
      })
    ]));
  });

  test('GET /api/pagos/reserva/:id_reserva - Debería listar pagos por reserva', async () => {
    const res = await request(app)
      .get(`/api/pagos/reserva/${testReservaId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id_pago: testPagoId,
        id_reserva: testReservaId
      })
    ]));
  });

  test('GET /api/pagos/usuario/:id_usuario - Debería listar pagos por usuario', async () => {
    const res = await request(app)
      .get(`/api/pagos/usuario/${testUsuarioId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.some(p => p.id_pago === testPagoId)).toBe(true);
  });

  test('GET /api/pagos/:id_pago - Debería obtener un pago específico', async () => {
    const res = await request(app)
      .get(`/api/pagos/${testPagoId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_pago).toBe(testPagoId);
    expect(res.body.data.id_reserva).toBe(testReservaId);
  });

  test('PUT /api/pagos/:id_pago - Debería actualizar un pago', async () => {
    const res = await request(app)
      .put(`/api/pagos/${testPagoId}`)
      .send({
        monto: 160.75,
        metodo_pago: "transferencia"
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.monto).toBe("160.75");
    expect(res.body.data.metodo_pago).toBe("transferencia");
  });

  test('PUT /api/pagos/:id_pago/estado - Debería fallar con estado inválido', async () => {
    const res = await request(app)
      .put(`/api/pagos/${testPagoId}/estado`)
      .send({
        estado: "invalido"
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Estado no válido/);
  });

  test('DELETE /api/pagos/:id_pago - Debería eliminar un pago', async () => {
    // Crear pago temporal para eliminar
    const tempPago = await request(app)
      .post('/api/pagos')
      .send({
        id_reserva: testReservaId,
        monto: 100,
        metodo_pago: "efectivo"
      });

    const res = await request(app)
      .delete(`/api/pagos/${tempPago.body.data.id_pago}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_pago).toBe(tempPago.body.data.id_pago);
  });
});