// backend/test/unit/rol.model.test.js
const db = require("../../config/db");
const ClassRol = require("../../models/Basicos/Class_rol");

describe("Modelo Rol - Pruebas Unitarias", () => {
  let testRolId;
  const testNombre = `test_rol_${Date.now()}`.substring(0, 20); // Aseguramos que no exceda 20 caracteres

  beforeAll(async () => {
    // Limpiar la tabla antes de comenzar
    await db.query("DELETE FROM roles WHERE nombre LIKE 'test_rol_%'");
  });

  afterAll(async () => {
    // Limpiar después de las pruebas
    if (testRolId) {
      await db.query("DELETE FROM roles WHERE id_rol = $1", [testRolId]);
    }
    await db.end();
  });

  test("crear() debería registrar un nuevo rol", async () => {
    const rol = await ClassRol.crear({
      nombre: testNombre,
      descripcion: "Rol de prueba"
    });
    
    testRolId = rol.id_rol;
    expect(rol).toHaveProperty("id_rol");
    expect(rol.nombre).toBe(testNombre);
    expect(rol.descripcion).toBe("Rol de prueba");
  });

  test("crear() debería fallar cuando el nombre está vacío", async () => {
    await expect(ClassRol.crear({
      nombre: "",
      descripcion: "Rol sin nombre"
    })).rejects.toThrow("El nombre del rol es requerido");
  });

  test("crear() debería fallar cuando el rol ya existe", async () => {
    await expect(ClassRol.crear({
      nombre: testNombre,
      descripcion: "Rol duplicado"
    })).rejects.toThrow("Ya existe un rol con ese nombre");
  });

  test("obtenerTodos() debería retornar todos los roles", async () => {
    const roles = await ClassRol.obtenerTodos();
    expect(Array.isArray(roles)).toBe(true);
    expect(roles.some(r => r.id_rol === testRolId)).toBe(true);
  });

  test("obtenerPorId() debería retornar el rol correcto", async () => {
    const rol = await ClassRol.obtenerPorId(testRolId);
    expect(rol.id_rol).toBe(testRolId);
    expect(rol.nombre).toBe(testNombre);
  });

  test("obtenerPorId() debería retornar undefined para rol inexistente", async () => {
    const rol = await ClassRol.obtenerPorId(999999);
    expect(rol).toBeUndefined();
  });

  test("actualizar() debería modificar el rol", async () => {
    const nuevoNombre = `${testNombre}_act`.substring(0, 20); // Aseguramos que no exceda 20 caracteres
    const rol = await ClassRol.actualizar(testRolId, {
      nombre: nuevoNombre,
      descripcion: "Descripción actualizada"
    });
    
    expect(rol.id_rol).toBe(testRolId);
    expect(rol.nombre).toBe(nuevoNombre);
    expect(rol.descripcion).toBe("Descripción actualizada");
  });

  test("actualizar() debería fallar al actualizar con nombre existente", async () => {
      // Crear otro rol para probar duplicado (con nombre diferente)
      const otroNombre = `otro_${Date.now()}`.substring(0, 20);
      const otroRol = await ClassRol.crear({
        nombre: otroNombre,
        descripcion: "Otro rol"
      });
      
      // Intentar actualizar el segundo rol con el nombre del primero
      await expect(ClassRol.actualizar(otroRol.id_rol, {
        nombre: testNombre // Usamos el nombre del primer rol
      })).rejects.toThrow("Ya existe un rol con ese nombre");
      
      // Limpiar el rol temporal
      await db.query("DELETE FROM roles WHERE id_rol = $1", [otroRol.id_rol]);
  });

  test("eliminar() debería eliminar un rol sin usuarios asociados", async () => {
    // Crear un rol temporal para eliminar
    const rolTemp = await ClassRol.crear({
      nombre: `temp_${testNombre}`.substring(0, 20),
      descripcion: "Rol temporal"
    });
    
    const result = await ClassRol.eliminar(rolTemp.id_rol);
    expect(result.id_rol).toBe(rolTemp.id_rol);
    
    // Verificar que ya no existe
    const rolEliminado = await ClassRol.obtenerPorId(rolTemp.id_rol);
    expect(rolEliminado).toBeUndefined();
  });

  test("eliminar() debería fallar si el rol tiene usuarios asociados", async () => {
    // Primero necesitamos crear un rol con nombre único
    const rolNombre = `conuser_${Date.now()}`.substring(0, 20);
    const rolConUsuario = await ClassRol.crear({
      nombre: rolNombre,
      descripcion: "Rol con usuario"
    });
    
    // Insertar un usuario asociado a este rol directamente en la DB
    const emailUnico = `test${Date.now()}@example.com`;
    await db.query(
      "INSERT INTO usuarios (nombre, email, password_hash, id_rol) VALUES ($1, $2, $3, $4)",
      ["Usuario Test", emailUnico, "hash", rolConUsuario.id_rol]
    );
    
    // Ahora intentamos eliminar el rol
    await expect(ClassRol.eliminar(rolConUsuario.id_rol))
      .rejects.toThrow("No se puede eliminar el rol porque está asignado a usuarios");
    
    // Limpieza
    await db.query("DELETE FROM usuarios WHERE email = $1", [emailUnico]);
    await db.query("DELETE FROM roles WHERE id_rol = $1", [rolConUsuario.id_rol]);
  });
});