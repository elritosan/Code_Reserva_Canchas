// backend/test/integration/rol.api.test.js
const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('API Rol - Pruebas de Integración', () => {
  let testRolId;
  const testNombre = `test_api_rol_${Date.now()}`.substring(0, 20);

  beforeAll(async () => {
    // Limpiar datos de pruebas anteriores
    await db.query("DELETE FROM roles WHERE nombre LIKE 'test_api_rol_%'");
  });

  afterAll(async () => {
    // Limpieza final
    if (testRolId) {
      await db.query("DELETE FROM roles WHERE id_rol = $1", [testRolId]);
    }
    await db.end();
  });

  test('POST /api/roles - Debería crear un nuevo rol', async () => {
    const res = await request(app)
      .post('/api/roles')
      .send({
        nombre: testNombre,
        descripcion: "Rol de prueba API"
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.objectContaining({
      id_rol: expect.any(Number),
      nombre: testNombre,
      descripcion: "Rol de prueba API"
    }));
    testRolId = res.body.data.id_rol;
  });

  test('POST /api/roles - Debería fallar al crear rol con nombre vacío', async () => {
    const res = await request(app)
      .post('/api/roles')
      .send({
        nombre: "",
        descripcion: "Rol inválido"
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/El nombre del rol es requerido/);
  });

  test('GET /api/roles - Debería listar todos los roles', async () => {
    const res = await request(app)
      .get('/api/roles')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id_rol: expect.any(Number),
        nombre: expect.any(String)
      })
    ]));
  });

  test('GET /api/roles/:id_rol - Debería obtener un rol específico', async () => {
    const res = await request(app)
      .get(`/api/roles/${testRolId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_rol).toBe(testRolId);
    expect(res.body.data.nombre).toBe(testNombre);
  });

  test('GET /api/roles/:id_rol - Debería fallar con rol inexistente', async () => {
    const res = await request(app)
      .get('/api/roles/999999')
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Rol no encontrado/);
  });

  test('PUT /api/roles/:id_rol - Debería actualizar un rol', async () => {
    const nuevoNombre = `${testNombre}_actualizado`.substring(0, 20);
    const res = await request(app)
      .put(`/api/roles/${testRolId}`)
      .send({
        nombre: nuevoNombre,
        descripcion: "Descripción actualizada"
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe(nuevoNombre);
    expect(res.body.data.descripcion).toBe("Descripción actualizada");
  });

  test('DELETE /api/roles/:id_rol - Debería eliminar un rol sin usuarios asociados', async () => {
    // Crear rol temporal para eliminar
    const rolTemp = await request(app)
      .post('/api/roles')
      .send({
        nombre: `temp_${testNombre}`.substring(0, 20),
        descripcion: "Rol temporal"
      });

    const res = await request(app)
      .delete(`/api/roles/${rolTemp.body.data.id_rol}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_rol).toBe(rolTemp.body.data.id_rol);
  });

  test('DELETE /api/roles/:id_rol - Debería fallar al eliminar rol con usuarios asociados', async () => {
    // Crear usuario asociado al rol de prueba
    const usuarioRes = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: "Usuario Test",
        email: `test${Date.now()}@example.com`,
        password: "password123",
        id_rol: testRolId
      });

    const res = await request(app)
      .delete(`/api/roles/${testRolId}`)
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.detalles).toMatch(/asignado a usuarios/);

    // Limpieza del usuario creado
    await db.query("DELETE FROM usuarios WHERE id_usuario = $1", [usuarioRes.body.data.id_usuario]);
  });
});