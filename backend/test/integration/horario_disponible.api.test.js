// backend/test/integration/horario_disponible.api.test.js
const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('API Horario Disponible - Pruebas de Integración', () => {
  let testHorarioId;
  let testCanchaId;
  let testDeporteId;
  const testDiaSemana = 1; // Lunes
  const testHoraInicio = "10:00";
  const testHoraFin = "11:00";

  beforeAll(async () => {
    // Limpiar datos de pruebas anteriores
    await db.query("DELETE FROM horarios_disponibles WHERE hora_inicio = $1", [testHoraInicio]);
    
    // Crear deporte y cancha de prueba
    const deporteRes = await request(app)
      .post('/api/deportes')
      .send({
        nombre: `deporte_${Date.now()}`.substring(0, 30),
        descripcion: "Deporte para pruebas de horarios"
      });
    testDeporteId = deporteRes.body.data.id_deporte;

    const canchaRes = await request(app)
      .post('/api/canchas')
      .send({
        nombre: `cancha_${Date.now()}`.substring(0, 50),
        id_deporte: testDeporteId,
        precio_hora: 100
      });
    testCanchaId = canchaRes.body.data.id_cancha;
  });

  afterAll(async () => {
    // Limpieza final (en orden inverso de dependencias)
    if (testHorarioId) {
      await db.query("DELETE FROM horarios_disponibles WHERE id_horario = $1", [testHorarioId]);
    }
    await db.query("DELETE FROM canchas WHERE id_cancha = $1", [testCanchaId]);
    await db.query("DELETE FROM deportes WHERE id_deporte = $1", [testDeporteId]);
    await db.end();
  });

  test('POST /api/horarios - Debería crear un nuevo horario disponible', async () => {
    const res = await request(app)
      .post('/api/horarios')
      .send({
        id_cancha: testCanchaId,
        dia_semana: testDiaSemana,
        hora_inicio: testHoraInicio,
        hora_fin: testHoraFin
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.objectContaining({
      id_horario: expect.any(Number),
      id_cancha: testCanchaId,
      dia_semana: testDiaSemana,
      hora_inicio: expect.stringMatching(/10:00:00/),
      hora_fin: expect.stringMatching(/11:00:00/),
      disponible: true
    }));
    testHorarioId = res.body.data.id_horario;
  });

  test('POST /api/horarios - Debería fallar con datos incompletos', async () => {
    const res = await request(app)
      .post('/api/horarios')
      .send({
        id_cancha: testCanchaId,
        dia_semana: testDiaSemana
        // Faltan horas
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Hora inicio y fin son requeridas/);
  });

  test('POST /api/horarios - Debería fallar con día inválido', async () => {
    const res = await request(app)
      .post('/api/horarios')
      .send({
        id_cancha: testCanchaId,
        dia_semana: 8, // Día inválido
        hora_inicio: "12:00",
        hora_fin: "13:00"
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Día de semana debe ser entre 1 \(Lunes\) y 7 \(Domingo\)/);
  });

  test('POST /api/horarios - Debería fallar con solapamiento de horarios', async () => {
    const res = await request(app)
      .post('/api/horarios')
      .send({
        id_cancha: testCanchaId,
        dia_semana: testDiaSemana,
        hora_inicio: "10:30", // Se solapa con el horario creado anteriormente
        hora_fin: "11:30"
      })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.detalles).toMatch(/El horario se solapa con otro existente/);
  });

  test('GET /api/horarios - Debería listar todos los horarios', async () => {
    const res = await request(app)
      .get('/api/horarios')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id_horario: expect.any(Number),
        id_cancha: expect.any(Number),
        dia_semana: expect.any(Number)
      })
    ]));
  });

  test('GET /api/horarios/cancha/:id_cancha - Debería listar horarios por cancha', async () => {
    const res = await request(app)
      .get(`/api/horarios/cancha/${testCanchaId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id_cancha).toBe(testCanchaId);
  });

  test('GET /api/horarios/:id_horario - Debería obtener un horario específico', async () => {
    const res = await request(app)
      .get(`/api/horarios/${testHorarioId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_horario).toBe(testHorarioId);
    expect(res.body.data.hora_inicio).toMatch(/10:00:00/);
  });

  test('PUT /api/horarios/:id_horario - Debería actualizar un horario', async () => {
    const res = await request(app)
      .put(`/api/horarios/${testHorarioId}`)
      .send({
        dia_semana: 2, // Martes
        hora_inicio: "14:00",
        hora_fin: "15:00"
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.dia_semana).toBe(2);
    expect(res.body.data.hora_inicio).toMatch(/14:00:00/);
  });

  test('PUT /api/horarios/:id_horario/disponibilidad - Debería actualizar disponibilidad', async () => {
    const res = await request(app)
      .put(`/api/horarios/${testHorarioId}/disponibilidad`)
      .send({
        disponible: false
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.disponible).toBe(false);
  });
  
  test('DELETE /api/horarios/:id_horario - Debería eliminar un horario sin reservas', async () => {
    // Crear horario temporal para eliminar
    const tempHorario = await request(app)
      .post('/api/horarios')
      .send({
        id_cancha: testCanchaId,
        dia_semana: 3, // Miércoles
        hora_inicio: "15:00",
        hora_fin: "16:00"
      });

    const res = await request(app)
      .delete(`/api/horarios/${tempHorario.body.data.id_horario}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_horario).toBe(tempHorario.body.data.id_horario);
  });

});