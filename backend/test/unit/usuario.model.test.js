const db = require("../../config/db");
const ClassUsuario = require("../../models/Basicos/Class_usuario");
const bcrypt = require('bcryptjs');

describe("Modelo Usuario - Pruebas Unitarias", () => {
  const testUser = {
    nombre: "Test Model User",
    email: `model.test${Date.now()}@example.com`,
    password: 'modelTest123',
    telefono: "0997654321"
  };

  beforeAll(async () => {
    await db.query("DELETE FROM usuarios WHERE email LIKE $1", ['model.test%@example.com']);
  });

  afterAll(async () => {
    await db.end();
  });

  test("crear() - Debe registrar un nuevo usuario", async () => {
    const usuario = await ClassUsuario.crear(testUser);
    expect(usuario.email).toBe(testUser.email.toLowerCase());
    expect(usuario.verificado).toBe(false);
    
    // Limpieza
    await db.query("DELETE FROM usuarios WHERE id_usuario = $1", [usuario.id_usuario]);
  });

  test("login() - Debe autenticar correctamente", async () => {
    // Setup específico para esta prueba
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const { rows } = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, telefono) 
       VALUES ($1, $2, $3, $4) RETURNING id_usuario`,
      [testUser.nombre, testUser.email, hashedPassword, testUser.telefono]
    );

    const usuario = await ClassUsuario.login(testUser.email, testUser.password);
    expect(usuario.email).toBe(testUser.email.toLowerCase());

    // Limpieza
    await db.query("DELETE FROM usuarios WHERE id_usuario = $1", [rows[0].id_usuario]);
  });
});