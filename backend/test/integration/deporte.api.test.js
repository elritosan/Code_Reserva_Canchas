// backend/test/integration/deporte.api.test.js
const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('API Deporte - Pruebas de Integración', () => {
  let testDeporteId;
  const testNombre = `test_deporte_${Date.now()}`.substring(0, 30);

  beforeAll(async () => {
    // Limpiar datos de pruebas anteriores
    await db.query("DELETE FROM deportes WHERE nombre LIKE 'test_deporte_%'");
  });

  afterAll(async () => {
    // Limpieza final
    if (testDeporteId) {
      await db.query("DELETE FROM deportes WHERE id_deporte = $1", [testDeporteId]);
    }
    await db.end();
  });

  test('POST /api/deportes - Debería crear un nuevo deporte', async () => {
    const res = await request(app)
      .post('/api/deportes')
      .send({
        nombre: testNombre,
        descripcion: "Deporte de prueba API",
        imagen_url: "http://ejemplo.com/imagen.jpg"
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.objectContaining({
      id_deporte: expect.any(Number),
      nombre: testNombre,
      descripcion: "Deporte de prueba API",
      imagen_url: "http://ejemplo.com/imagen.jpg"
    }));
    testDeporteId = res.body.data.id_deporte;
  });

  test('POST /api/deportes - Debería fallar al crear deporte con nombre vacío', async () => {
    const res = await request(app)
      .post('/api/deportes')
      .send({
        nombre: "",
        descripcion: "Deporte inválido"
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/El nombre del deporte es requerido/);
  });

  test('GET /api/deportes - Debería listar todos los deportes', async () => {
    const res = await request(app)
      .get('/api/deportes')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id_deporte: expect.any(Number),
        nombre: expect.any(String)
      })
    ]));
  });

  test('GET /api/deportes/:id_deporte - Debería obtener un deporte específico', async () => {
    const res = await request(app)
      .get(`/api/deportes/${testDeporteId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_deporte).toBe(testDeporteId);
    expect(res.body.data.nombre).toBe(testNombre);
  });

  test('GET /api/deportes/:id_deporte - Debería fallar con deporte inexistente', async () => {
    const res = await request(app)
      .get('/api/deportes/999999')
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Deporte no encontrado/);
  });

  test('PUT /api/deportes/:id_deporte - Debería actualizar un deporte', async () => {
    const nuevoNombre = `${testNombre}_actualizado`.substring(0, 30);
    const res = await request(app)
      .put(`/api/deportes/${testDeporteId}`)
      .send({
        nombre: nuevoNombre,
        descripcion: "Descripción actualizada",
        imagen_url: "http://ejemplo.com/nueva-imagen.jpg"
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe(nuevoNombre);
    expect(res.body.data.descripcion).toBe("Descripción actualizada");
  });

  test('DELETE /api/deportes/:id_deporte - Debería eliminar un deporte sin canchas asociadas', async () => {
    // Crear deporte temporal para eliminar
    const tempDeporte = await request(app)
      .post('/api/deportes')
      .send({
        nombre: `temp_${testNombre}`.substring(0, 30),
        descripcion: "Deporte temporal"
      });

    const res = await request(app)
      .delete(`/api/deportes/${tempDeporte.body.data.id_deporte}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_deporte).toBe(tempDeporte.body.data.id_deporte);
  });

});