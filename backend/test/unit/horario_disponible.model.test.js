// backend/test/unit/horario_disponible.model.test.js
const db = require("../../config/db");
const ClassHorarioDisponible = require("../../models/Basicos/Class_horario_disponible");
const ClassCancha = require("../../models/Basicos/Class_cancha");
const ClassDeporte = require("../../models/Basicos/Class_deporte");

describe("Modelo HorarioDisponible - Pruebas Unitarias", () => {
  let testHorarioId;
  let testCanchaId;
  const testDiaSemana = 1; // Lunes
  const testHoraInicio = "10:00";
  const testHoraFin = "11:00";

  beforeAll(async () => {
    // Crear deporte y cancha de prueba
    const deporte = await ClassDeporte.crear({ nombre: `deporte_${Date.now()}`.substring(0, 30) });
    const cancha = await ClassCancha.crear({
      nombre: `cancha_${Date.now()}`.substring(0, 50),
      id_deporte: deporte.id_deporte,
      precio_hora: 100
    });
    testCanchaId = cancha.id_cancha;

    // Limpiar horarios de pruebas anteriores
    await db.query("DELETE FROM horarios_disponibles WHERE id_cancha = $1", [testCanchaId]);
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await db.query("DELETE FROM horarios_disponibles WHERE id_horario = $1", [testHorarioId]);
    await db.query("DELETE FROM canchas WHERE id_cancha = $1", [testCanchaId]);
    await db.query("DELETE FROM deportes WHERE id_deporte IN (SELECT id_deporte FROM canchas WHERE id_cancha = $1)", [testCanchaId]);
    await db.end();
  });

  test("crear() debería registrar un nuevo horario", async () => {
    const horario = await ClassHorarioDisponible.crear({
      id_cancha: testCanchaId,
      dia_semana: testDiaSemana,
      hora_inicio: testHoraInicio,
      hora_fin: testHoraFin
    });
    
    testHorarioId = horario.id_horario;
    expect(horario).toMatchObject({
      id_cancha: testCanchaId,
      dia_semana: testDiaSemana,
      hora_inicio: expect.stringMatching(/10:00:00/),
      hora_fin: expect.stringMatching(/11:00:00/),
      disponible: true
    });
  });

  test("crear() debería fallar con datos incompletos", async () => {
    await expect(ClassHorarioDisponible.crear({
      id_cancha: testCanchaId,
      dia_semana: testDiaSemana
    })).rejects.toThrow("Hora inicio y fin son requeridas");
  });

  test("crear() debería fallar con día inválido", async () => {
    await expect(ClassHorarioDisponible.crear({
      id_cancha: testCanchaId,
      dia_semana: 8, // Día inválido
      hora_inicio: "12:00",
      hora_fin: "13:00"
    })).rejects.toThrow("Día de semana debe ser entre 1 (Lunes) y 7 (Domingo)");
  });

  test("crear() debería fallar con solapamiento de horarios", async () => {
    await expect(ClassHorarioDisponible.crear({
      id_cancha: testCanchaId,
      dia_semana: testDiaSemana,
      hora_inicio: "10:30", // Se solapa con el horario creado anteriormente
      hora_fin: "11:30"
    })).rejects.toThrow("El horario se solapa con otro existente");
  });

  test("obtenerTodos() debería retornar todos los horarios", async () => {
    const horarios = await ClassHorarioDisponible.obtenerTodos();
    expect(horarios.some(h => h.id_horario === testHorarioId)).toBe(true);
  });

  test("obtenerPorCancha() debería retornar horarios de una cancha", async () => {
    const horarios = await ClassHorarioDisponible.obtenerPorCancha(testCanchaId);
    expect(horarios.length).toBeGreaterThan(0);
    expect(horarios[0].id_cancha).toBe(testCanchaId);
  });

  test("actualizar() debería modificar un horario", async () => {
    const updated = await ClassHorarioDisponible.actualizar(testHorarioId, {
      dia_semana: 2, // Martes
      hora_inicio: "14:00",
      disponible: false
    });
    
    expect(updated.dia_semana).toBe(2);
    expect(updated.hora_inicio).toMatch(/14:00:00/);
    expect(updated.disponible).toBe(false);
  });

  test("actualizarDisponibilidad() debería cambiar el estado", async () => {
    const updated = await ClassHorarioDisponible.actualizarDisponibilidad(testHorarioId, false);
    expect(updated.disponible).toBe(false);
    
    // Verificar efecto en la base de datos
    const result = await db.query("SELECT disponible FROM horarios_disponibles WHERE id_horario = $1", [testHorarioId]);
    expect(result.rows[0].disponible).toBe(false);
  });

  test("eliminar() debería borrar horarios sin reservas", async () => {
    const horarioTemp = await ClassHorarioDisponible.crear({
      id_cancha: testCanchaId,
      dia_semana: 3, // Miércoles
      hora_inicio: "15:00",
      hora_fin: "16:00"
    });
    
    const result = await ClassHorarioDisponible.eliminar(horarioTemp.id_horario);
    expect(result.id_horario).toBe(horarioTemp.id_horario);
    
    // Verificar eliminación
    const exists = await db.query("SELECT 1 FROM horarios_disponibles WHERE id_horario = $1", [horarioTemp.id_horario]);
    expect(exists.rows.length).toBe(0);
  });

  test("eliminar() debería fallar con reservas asociadas", async () => {
    // Mock para simular reservas asociadas
    const originalEliminar = ClassHorarioDisponible.eliminar;
    ClassHorarioDisponible.eliminar = jest.fn().mockRejectedValue(
      new Error('No se puede eliminar el horario porque tiene reservas asociadas')
    );
    
    await expect(ClassHorarioDisponible.eliminar(testHorarioId))
      .rejects.toThrow("tiene reservas asociadas");
    
    // Restaurar implementación original
    ClassHorarioDisponible.eliminar = originalEliminar;
  });
});