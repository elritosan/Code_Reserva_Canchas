const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');
const bcrypt = require('bcryptjs');

describe('API Auth - Pruebas de Integración', () => {
  let testUser;
  const testData = {
    nombre: "Test User",
    email: `test${Date.now()}@example.com`,
    password: 'securePassword123',
    telefono: "0991234567"
  };

  beforeAll(async () => {
    // Crear usuario de prueba directamente en DB
    const hashedPassword = await bcrypt.hash(testData.password, 10);
    const res = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, telefono, id_rol) 
       VALUES ($1, $2, $3, $4, 2) RETURNING id_usuario, email`,
      [testData.nombre, testData.email, hashedPassword, testData.telefono]
    );
    testUser = res.rows[0];
  });

  afterAll(async () => {
    await db.query("DELETE FROM usuarios WHERE email = $1", [testData.email]);
    await db.end();
  });

  test('POST /api/usuarios/login - Autenticación exitosa', async () => {
    const response = await request(app)
      .post('/api/usuarios/login')
      .send({ email: testData.email, password: testData.password })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(testData.email);
  });

  test('POST /api/usuarios/login - Credenciales inválidas', async () => {
    const response = await request(app)
      .post('/api/usuarios/login')
      .send({ email: testData.email, password: 'wrongPassword' })
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});