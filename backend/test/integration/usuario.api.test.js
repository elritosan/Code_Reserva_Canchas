// backend/test/integration/usuario.api.test.js
const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');
const bcrypt = require('bcryptjs');

describe('API Usuario - Pruebas de Integración', () => {
  let testUsuarioId;
  let testRolId;
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'password123';

  beforeAll(async () => {
    // Limpiar datos de pruebas anteriores
    await db.query("DELETE FROM usuarios WHERE email LIKE 'test%@example.com'");
    
    // Crear rol de prueba
    const rolRes = await request(app)
      .post('/api/roles')
      .send({
        nombre: `test_rol_${Date.now()}`.substring(0, 20),
        descripcion: "Rol para pruebas de usuario"
      });
    testRolId = rolRes.body.data.id_rol;
  });

  afterAll(async () => {
    // Limpieza final
    if (testUsuarioId) {
      await db.query("DELETE FROM usuarios WHERE id_usuario = $1", [testUsuarioId]);
    }
    await db.query("DELETE FROM roles WHERE id_rol = $1", [testRolId]);
    await db.end();
  });

  test('POST /api/usuarios - Debería crear un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: "Usuario Test",
        email: testEmail,
        password: testPassword,
        id_rol: testRolId
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.objectContaining({
      id_usuario: expect.any(Number),
      nombre: "Usuario Test",
      email: testEmail.toLowerCase(),
      id_rol: testRolId
    }));
    expect(res.body.data.password_hash).toBeUndefined();
    testUsuarioId = res.body.data.id_usuario;
  });

  test('POST /api/usuarios - Debería fallar al crear usuario con datos incompletos', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: "Usuario Incompleto",
        email: "",
        password: "123"
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Nombre, email y contraseña son requeridos/);
  });

  test('POST /api/usuarios - Debería fallar con contraseña muy corta', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: "Usuario Pass Corta",
        email: `shortpass${Date.now()}@example.com`,
        password: "123",
        id_rol: testRolId
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/La contraseña debe tener al menos 8 caracteres/);
  });

  test('POST /api/usuarios/login - Debería autenticar usuario correctamente', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: testEmail,
        password: testPassword
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_usuario).toBe(testUsuarioId);
    expect(res.body.data.email).toBe(testEmail.toLowerCase());
    expect(res.body.data.password_hash).toBeUndefined();
  });

  test('POST /api/usuarios/login - Debería fallar con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: testEmail,
        password: "wrongpassword"
      })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Error en autenticación/);
  });

  test('GET /api/usuarios - Debería listar todos los usuarios', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id_usuario: expect.any(Number),
        nombre: expect.any(String),
        email: expect.any(String)
      })
    ]));
  });

  test('GET /api/usuarios/:id_usuario - Debería obtener un usuario específico', async () => {
    const res = await request(app)
      .get(`/api/usuarios/${testUsuarioId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_usuario).toBe(testUsuarioId);
    expect(res.body.data.email).toBe(testEmail.toLowerCase());
  });

  test('GET /api/usuarios/email/:email - Debería obtener usuario por email', async () => {
    const res = await request(app)
      .get(`/api/usuarios/email/${testEmail}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_usuario).toBe(testUsuarioId);
    expect(res.body.data.email).toBe(testEmail.toLowerCase());
  });

  test('PUT /api/usuarios/:id_usuario - Debería actualizar un usuario', async () => {
    const nuevoEmail = `updated${Date.now()}@example.com`;
    const res = await request(app)
      .put(`/api/usuarios/${testUsuarioId}`)
      .send({
        nombre: "Usuario Actualizado",
        email: nuevoEmail,
        telefono: "123456789"
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe("Usuario Actualizado");
    expect(res.body.data.email).toBe(nuevoEmail.toLowerCase());
    expect(res.body.data.telefono).toBe("123456789");
  });

  test('PUT /api/usuarios/:id_usuario/password - Debería actualizar contraseña', async () => {
    const res = await request(app)
      .put(`/api/usuarios/${testUsuarioId}/password`)
      .send({
        currentPassword: testPassword,
        newPassword: "newpassword123"
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.mensaje).toMatch(/Contraseña actualizada exitosamente/);
  });

  test('DELETE /api/usuarios/:id_usuario - Debería eliminar un usuario sin reservas', async () => {
    // Crear usuario temporal para eliminar
    const tempUser = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: "Usuario Temporal",
        email: `temp${Date.now()}@example.com`,
        password: "password123",
        id_rol: testRolId
      });

    const res = await request(app)
      .delete(`/api/usuarios/${tempUser.body.data.id_usuario}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id_usuario).toBe(tempUser.body.data.id_usuario);
  });
});