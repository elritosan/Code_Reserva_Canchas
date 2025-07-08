// backend/test/integration/cancha.api.test.js
const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('API Cancha - Pruebas de Integración', () => {
  let testCanchaId;
  let testDeporteId;
  const testNombre = `test_cancha_${Date.now()}`.substring(0, 50);

  beforeAll(async () => {
    // Limpiar datos de pruebas anteriores
    await db.query("DELETE FROM canchas WHERE nombre LIKE 'test_cancha_%'");
    
    // Crear deporte de prueba
    const deporteRes = await request(app)
      .post('/api/deportes')
      .send({
        nombre: `deporte_${Date.now()}`.substring(0, 30),
        descripcion: "Deporte para pruebas de canchas"
      });
    testDeporteId = deporteRes.body.data.id_deporte;
  });

  afterAll(async () => {
    // Limpieza final
    if (testCanchaId) {
      await db.query("DELETE FROM canchas WHERE id_cancha = $1", [testCanchaId]);
    }
    await db.query("DELETE FROM deportes WHERE id_deporte = $1", [testDeporteId]);
    await db.end();
  });

  test('POST /api/canchas - Debería crear una nueva cancha', async () => {
    const res = await request(app)
      .post('/api/canchas')
      .send({
        nombre: testNombre,
        id_deporte: testDeporteId,
        descripcion: "Cancha de prueba API",
        precio_hora: 150.75,
        imagen_url: "http://ejemplo.com/cancha.jpg"
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.objectContaining({
      id_cancha: expect.any(Number),
      nombre: testNombre,
      id_deporte: testDeporteId,
      precio_hora: "150.75",
      activa: true
    }));
    testCanchaId = res.body.data.id_cancha;
  });

  test('POST /api/canchas - Debería fallar al crear cancha con datos incompletos', async () => {
    const res = await request(app)
      .post('/api/canchas')
      .send({
        nombre: "", // Nombre vacío
        id_deporte: testDeporteId,
        precio_hora: 100
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/El nombre de la cancha es requerido/);
  });

  test('POST /api/canchas - Debería fallar al crear cancha sin deporte', async () => {
    const res = await request(app)
      .post('/api/canchas')
      .send({
        nombre: "Cancha sin deporte",
        precio_hora: 100
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/El deporte es requerido/);
  });

  test('POST /api/canchas - Debería fallar al crear cancha con precio inválido', async () => {
    const res = await request(app)
      .post('/api/canchas')
      .send({
        nombre: "Cancha Precio Inválido",
        id_deporte: testDeporteId,
        precio_hora: -10
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/El precio por hora debe ser un número positivo/);
  });

  test('GET /api/canchas - Debería listar todas las canchas', async () => {
    const res = await request(app)
      .get('/api/canchas')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id_cancha: expect.any(Number),
        nombre: expect.any(String),
        precio_hora: expect.any(String)
      })
    ]));
  });

  test('GET /api/canchas/deporte/:id_deporte - Debería listar canchas por deporte', async () => {
    const res = await request(app)
      .get(`/api/canchas/deporte/${testDeporteId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id_deporte).toBe(testDeporteId);
  });

  test('GET /api/canchas/:id_cancha - Debería obtener una cancha específica', async () => {
    const res = await request(app)
      .get(`/api/canchas/${testCanchaId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_cancha).toBe(testCanchaId);
    expect(res.body.data.nombre).toBe(testNombre);
  });

  test('GET /api/canchas/:id_cancha - Debería fallar con cancha inexistente', async () => {
    const res = await request(app)
      .get('/api/canchas/999999')
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Cancha no encontrada/);
  });

  test('PUT /api/canchas/:id_cancha - Debería actualizar una cancha', async () => {
    const nuevoNombre = `${testNombre}_actualizada`.substring(0, 50);
    const res = await request(app)
      .put(`/api/canchas/${testCanchaId}`)
      .send({
        nombre: nuevoNombre,
        precio_hora: 175.50,
        activa: false
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe(nuevoNombre);
    expect(res.body.data.precio_hora).toBe("175.50");
    expect(res.body.data.activa).toBe(false);
  });

  test('DELETE /api/canchas/:id_cancha - Debería desactivar una cancha sin horarios', async () => {
    // Crear cancha temporal para eliminar
    const tempCancha = await request(app)
      .post('/api/canchas')
      .send({
        nombre: `temp_${testNombre}`.substring(0, 50),
        id_deporte: testDeporteId,
        precio_hora: 100
      });

    const res = await request(app)
      .delete(`/api/canchas/${tempCancha.body.data.id_cancha}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_cancha).toBe(tempCancha.body.data.id_cancha);

    // Verificar que quedó inactiva
    const checkRes = await request(app)
      .get(`/api/canchas/${tempCancha.body.data.id_cancha}`)
      .expect(200);
      
    expect(checkRes.body.data.activa).toBe(false);
  });

  test('DELETE /api/canchas/:id_cancha - Debería fallar al eliminar cancha con horarios asociados', async () => {
    // Crear horario asociado a la cancha de prueba
    const horarioRes = await request(app)
      .post('/api/horarios')
      .send({
        id_cancha: testCanchaId,
        dia_semana: 1, // Lunes
        hora_inicio: "10:00",
        hora_fin: "11:00"
      });

    const res = await request(app)
      .delete(`/api/canchas/${testCanchaId}`)
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.detalles).toMatch(/tiene horarios asociados/);

    // Limpieza
    await db.query("DELETE FROM horarios_disponibles WHERE id_horario = $1", [horarioRes.body.data.id_horario]);
  });
});