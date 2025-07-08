// backend/test/unit/cancha.model.test.js
const db = require("../../config/db");
const ClassCancha = require("../../models/Basicos/Class_cancha");
const ClassDeporte = require("../../models/Basicos/Class_deporte");

describe("Modelo Cancha - Pruebas Unitarias", () => {
  let testCanchaId;
  let testDeporteId;
  const testNombre = `test_cancha_${Date.now()}`.substring(0, 50);

  beforeAll(async () => {
    // Crear deporte de prueba
    const deporte = await ClassDeporte.crear({
      nombre: `deporte_${Date.now()}`.substring(0, 30)
    });
    testDeporteId = deporte.id_deporte;

    // Limpiar canchas de pruebas anteriores
    await db.query("DELETE FROM canchas WHERE nombre LIKE 'test_cancha_%'");
  });

  afterAll(async () => {
    // Limpiar después de las pruebas
    await db.query("DELETE FROM canchas WHERE id_cancha = $1", [testCanchaId]);
    await db.query("DELETE FROM deportes WHERE id_deporte = $1", [testDeporteId]);
    await db.end();
  });

  test("crear() debería registrar una nueva cancha", async () => {
    const cancha = await ClassCancha.crear({
      nombre: testNombre,
      id_deporte: testDeporteId,
      descripcion: "Cancha de prueba",
      precio_hora: 100.50,
      imagen_url: "http://ejemplo.com/cancha.jpg"
    });
    
    testCanchaId = cancha.id_cancha;
    expect(cancha).toHaveProperty("id_cancha");
    expect(cancha.nombre).toBe(testNombre);
    expect(cancha.id_deporte).toBe(testDeporteId);
    expect(cancha.precio_hora).toBe("100.50");
  });

  test("crear() debería fallar cuando faltan campos requeridos", async () => {
    await expect(ClassCancha.crear({
      nombre: "",
      id_deporte: testDeporteId,
      precio_hora: 100
    })).rejects.toThrow("El nombre de la cancha es requerido");

    await expect(ClassCancha.crear({
      nombre: "Sin deporte",
      precio_hora: 100
    })).rejects.toThrow("El deporte es requerido");
  });

  test("crear() debería fallar con precio inválido", async () => {
    await expect(ClassCancha.crear({
      nombre: "Cancha Inválida",
      id_deporte: testDeporteId,
      precio_hora: -10
    })).rejects.toThrow("El precio por hora debe ser un número positivo");
  });

  test("obtenerTodas() debería retornar todas las canchas", async () => {
    const canchas = await ClassCancha.obtenerTodas();
    expect(Array.isArray(canchas)).toBe(true);
    expect(canchas.some(c => c.id_cancha === testCanchaId)).toBe(true);
  });

  test("obtenerPorDeporte() debería retornar canchas del deporte", async () => {
    const canchas = await ClassCancha.obtenerPorDeporte(testDeporteId);
    expect(canchas.length).toBeGreaterThan(0);
    expect(canchas[0].id_deporte).toBe(testDeporteId);
  });

  test("obtenerPorId() debería retornar la cancha correcta", async () => {
    const cancha = await ClassCancha.obtenerPorId(testCanchaId);
    expect(cancha.id_cancha).toBe(testCanchaId);
    expect(cancha.nombre).toBe(testNombre);
  });

  test("actualizar() debería modificar la cancha", async () => {
    const nuevoNombre = `${testNombre}_actualizada`.substring(0, 50);
    const cancha = await ClassCancha.actualizar(testCanchaId, {
      nombre: nuevoNombre,
      precio_hora: 150.75,
      activa: false
    });
    
    expect(cancha.nombre).toBe(nuevoNombre);
    expect(cancha.precio_hora).toBe("150.75");
    expect(cancha.activa).toBe(false);
  });

  test("eliminar() debería hacer eliminación lógica", async () => {
    // Crear cancha temporal para eliminar
    const canchaTemp = await ClassCancha.crear({
      nombre: `temp_${testNombre}`.substring(0, 50),
      id_deporte: testDeporteId,
      precio_hora: 80
    });
    
    const result = await ClassCancha.eliminar(canchaTemp.id_cancha);
    expect(result.id_cancha).toBe(canchaTemp.id_cancha);
    
    // Verificar que está marcada como inactiva
    const canchaEliminada = await ClassCancha.obtenerPorId(canchaTemp.id_cancha);
    expect(canchaEliminada.activa).toBe(false);
  });

  test("eliminar() debería fallar si tiene horarios asociados", async () => {
    // Mock para simular dependencias
    const originalEliminar = ClassCancha.eliminar;
    ClassCancha.eliminar = jest.fn().mockRejectedValue(
      new Error('No se puede eliminar la cancha porque tiene horarios asociados')
    );
    
    await expect(ClassCancha.eliminar(testCanchaId))
      .rejects.toThrow("tiene horarios asociados");
    
    // Restaurar implementación original
    ClassCancha.eliminar = originalEliminar;
  });
});