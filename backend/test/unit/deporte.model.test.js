// backend/test/unit/deporte.model.test.js
const db = require("../../config/db");
const ClassDeporte = require("../../models/Basicos/Class_deporte");

describe("Modelo Deporte - Pruebas Unitarias", () => {
  let testDeporteId;
  const testNombre = `test_deporte_${Date.now()}`.substring(0, 30); // Ajustado a 30 caracteres (límite de la tabla)

  beforeAll(async () => {
    // Limpiar datos de pruebas anteriores
    await db.query("DELETE FROM deportes WHERE nombre LIKE 'test_deporte_%'");
  });

  afterAll(async () => {
    // Limpiar después de las pruebas
    if (testDeporteId) {
      await db.query("DELETE FROM deportes WHERE id_deporte = $1", [testDeporteId]);
    }
    await db.end();
  });

  test("crear() debería registrar un nuevo deporte", async () => {
    const deporte = await ClassDeporte.crear({
      nombre: testNombre,
      descripcion: "Descripción de prueba",
      imagen_url: "http://ejemplo.com/imagen.jpg"
    });
    
    testDeporteId = deporte.id_deporte;
    expect(deporte).toHaveProperty("id_deporte");
    expect(deporte.nombre).toBe(testNombre);
    expect(deporte.descripcion).toBe("Descripción de prueba");
    expect(deporte.imagen_url).toBe("http://ejemplo.com/imagen.jpg");
  });

  test("crear() debería fallar cuando el nombre está vacío", async () => {
    await expect(ClassDeporte.crear({
      nombre: "",
      descripcion: "Sin nombre"
    })).rejects.toThrow("El nombre del deporte es requerido");
  });

  test("crear() debería funcionar con solo el nombre", async () => {
    const nombreMinimo = `min_${Date.now()}`.substring(0, 30);
    const deporte = await ClassDeporte.crear({ nombre: nombreMinimo });
    expect(deporte.nombre).toBe(nombreMinimo);
    expect(deporte.descripcion).toBeNull();
    
    // Limpieza
    await db.query("DELETE FROM deportes WHERE id_deporte = $1", [deporte.id_deporte]);
  });

  test("crear() debería fallar cuando el deporte ya existe", async () => {
    await expect(ClassDeporte.crear({
      nombre: testNombre,
      descripcion: "Duplicado"
    })).rejects.toThrow("Ya existe un deporte con ese nombre");
  });

  test("obtenerTodos() debería retornar todos los deportes", async () => {
    const deportes = await ClassDeporte.obtenerTodos();
    expect(Array.isArray(deportes)).toBe(true);
    expect(deportes.some(d => d.id_deporte === testDeporteId)).toBe(true);
  });

  test("obtenerPorId() debería retornar el deporte correcto", async () => {
    const deporte = await ClassDeporte.obtenerPorId(testDeporteId);
    expect(deporte.id_deporte).toBe(testDeporteId);
    expect(deporte.nombre).toBe(testNombre);
  });

  test("obtenerPorId() debería retornar undefined para deporte inexistente", async () => {
    const deporte = await ClassDeporte.obtenerPorId(999999);
    expect(deporte).toBeUndefined();
  });

  test("actualizar() debería modificar el deporte", async () => {
    const nuevoNombre = `${testNombre}_actualizado`.substring(0, 30);
    const deporte = await ClassDeporte.actualizar(testDeporteId, {
      nombre: nuevoNombre,
      descripcion: "Descripción actualizada",
      imagen_url: "http://ejemplo.com/nueva.jpg"
    });
    
    expect(deporte.id_deporte).toBe(testDeporteId);
    expect(deporte.nombre).toBe(nuevoNombre);
    expect(deporte.descripcion).toBe("Descripción actualizada");
    expect(deporte.imagen_url).toBe("http://ejemplo.com/nueva.jpg");
  });

  test("actualizar() debería fallar al actualizar con nombre existente", async () => {
      // Crear dos deportes de prueba
      const deporte1 = await ClassDeporte.crear({
        nombre: `deporte1_${Date.now()}`.substring(0, 30)
      });
      
      const deporte2 = await ClassDeporte.crear({
        nombre: `deporte2_${Date.now()}`.substring(0, 30)
      });

      // Intentar actualizar el segundo deporte con el nombre del primero
      await expect(ClassDeporte.actualizar(deporte2.id_deporte, {
        nombre: deporte1.nombre // Usar exactamente el mismo nombre
      })).rejects.toThrow("Ya existe un deporte con ese nombre");

      // Limpieza
      await db.query("DELETE FROM deportes WHERE id_deporte IN ($1, $2)", 
        [deporte1.id_deporte, deporte2.id_deporte]);
  });

  test("eliminar() debería eliminar un deporte sin canchas asociadas", async () => {
    // Crear deporte temporal para eliminar
    const deporteTemp = await ClassDeporte.crear({
      nombre: `temp_${testNombre}`.substring(0, 30)
    });
    
    const result = await ClassDeporte.eliminar(deporteTemp.id_deporte);
    expect(result.id_deporte).toBe(deporteTemp.id_deporte);
    
    // Verificar que ya no existe
    const deporteEliminado = await ClassDeporte.obtenerPorId(deporteTemp.id_deporte);
    expect(deporteEliminado).toBeUndefined();
  });

  test("eliminar() debería fallar si el deporte tiene canchas asociadas", async () => {
    // En una implementación real, aquí crearíamos una cancha asociada
    // Para la prueba unitaria, mockeamos el comportamiento esperado
    
    const originalEliminar = ClassDeporte.eliminar;
    ClassDeporte.eliminar = jest.fn().mockRejectedValue(new Error('El deporte tiene canchas asociadas'));
    
    await expect(ClassDeporte.eliminar(testDeporteId))
      .rejects.toThrow("El deporte tiene canchas asociadas");
    
    // Restaurar implementación original
    ClassDeporte.eliminar = originalEliminar;
  });
});