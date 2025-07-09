// backend/test/performance/reservaConcurrente.test.js
const db = require("../../config/db");
const ClassReserva = require("../../models/Basicos/Class_reserva");
const ClassUsuario = require("../../models/Basicos/Class_usuario");
const ClassHorarioDisponible = require("../../models/Basicos/Class_horario_disponible");
const ClassCancha = require("../../models/Basicos/Class_cancha");
const ClassDeporte = require("../../models/Basicos/Class_deporte");
const ClassRol = require("../../models/Basicos/Class_rol");
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// Configuración definitiva
const CONFIG = {
  USUARIOS_SIMULTANEOS: 2,
  TIEMPO_ESPERA: 1000,
  ITERACIONES: 2,
  DEPORTE: "Fútbol Performance",
  HORARIO_CONFIG: {
    dias_semana: [1, 2, 3, 4, 5], // Lunes a Viernes
    hora_base: "08:00",
    duracion_horas: 1,
    intervalo_minutos: 60 // 60 minutos entre reservas
  }
};

describe("Prueba de Rendimiento: Reservas Concurrentes", () => {
  let testCanchaIds = [];
  let usuariosTest = [];
  let testRolId;
  let testDeporteId;
  let resultadosGlobales = {
    exitosas: 0,
    fallidas: 0,
    tiemposRespuesta: []
  };

  beforeAll(async () => {
    // Crear rol
    const rol = await ClassRol.crear({
      nombre: `rol_test_${Date.now()}`.substring(0, 15),
      descripcion: "Rol test performance"
    });
    testRolId = rol.id_rol;

    // Crear deporte
    const deporte = await ClassDeporte.crear({ 
      nombre: CONFIG.DEPORTE 
    });
    testDeporteId = deporte.id_deporte;

    // Crear múltiples canchas (1 por cada 5 usuarios)
    const numCanchas = Math.ceil(CONFIG.USUARIOS_SIMULTANEOS / 5);
    for (let i = 0; i < numCanchas; i++) {
      const cancha = await ClassCancha.crear({
        nombre: `Cancha Perf ${i}`,
        id_deporte: testDeporteId,
        precio_hora: 200
      });
      testCanchaIds.push(cancha.id_cancha);
    }

    // Crear usuarios
    for (let i = 0; i < CONFIG.USUARIOS_SIMULTANEOS; i++) {
      const usuario = await ClassUsuario.crear({
        nombre: `UserPerf${i}`,
        email: `perf${i}_${Date.now()}@test.com`,
        password: "password123",
        id_rol: testRolId
      });
      usuariosTest.push(usuario);
    }
  }, 30000);

  afterAll(async () => {
    // Limpieza completa
    await db.query("DELETE FROM reservas WHERE id_usuario = ANY($1::int[])", 
      [usuariosTest.map(u => u.id_usuario)]);
    await db.query("DELETE FROM usuarios WHERE id_usuario = ANY($1::int[])", 
      [usuariosTest.map(u => u.id_usuario)]);
    await db.query("DELETE FROM roles WHERE id_rol = $1", [testRolId]);
    await db.query("DELETE FROM horarios_disponibles WHERE id_cancha = ANY($1::int[])", 
      [testCanchaIds]);
    await db.query("DELETE FROM canchas WHERE id_cancha = ANY($1::int[])", 
      [testCanchaIds]);
    await db.query("DELETE FROM deportes WHERE id_deporte = $1", [testDeporteId]);
    await db.end();
  }, 30000);

  test(`Simular ${CONFIG.USUARIOS_SIMULTANEOS} usuarios reservando`, async () => {
    const fechaReserva = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    
    for (let iter = 0; iter < CONFIG.ITERACIONES; iter++) {
      const diaSemana = CONFIG.HORARIO_CONFIG.dias_semana[iter % CONFIG.HORARIO_CONFIG.dias_semana.length];
      
      // Crear horarios en serie para evitar solapamiento
      const horarios = [];
      for (let i = 0; i < CONFIG.USUARIOS_SIMULTANEOS; i++) {
        const canchaId = testCanchaIds[i % testCanchaIds.length];
        
        const horaInicio = new Date(`1970-01-01T${CONFIG.HORARIO_CONFIG.hora_base}Z`);
        horaInicio.setMinutes(horaInicio.getMinutes() + 
          (i * CONFIG.HORARIO_CONFIG.intervalo_minutos));
        
        const horaFin = new Date(horaInicio);
        horaFin.setHours(horaInicio.getHours() + CONFIG.HORARIO_CONFIG.duracion_horas);
        
        const horaInicioStr = horaInicio.toTimeString().substring(0, 5);
        const horaFinStr = horaFin.toTimeString().substring(0, 5);

        try {
          const horario = await ClassHorarioDisponible.crear({
            id_cancha: canchaId,
            dia_semana: diaSemana,
            hora_inicio: horaInicioStr,
            hora_fin: horaFinStr
          });
          horarios.push(horario);
        } catch (error) {
          console.error(`Error creando horario para usuario ${i}:`, {
            canchaId,
            diaSemana,
            horaInicioStr,
            horaFinStr,
            error: error.message
          });
          throw error;
        }
      }

      // Ejecutar reservas en paralelo
      const reservasPromesas = usuariosTest.map((usuario, i) => {
        const inicio = Date.now();
        
        return ClassReserva.crear({
          id_usuario: usuario.id_usuario,
          id_horario: horarios[i].id_horario,
          fecha_reserva: fechaReserva
        })
        .then(() => {
          resultadosGlobales.exitosas++;
          resultadosGlobales.tiemposRespuesta.push(Date.now() - inicio);
        })
        .catch((err) => {
          resultadosGlobales.fallidas++;
          resultadosGlobales.tiemposRespuesta.push(Date.now() - inicio);
          console.error(`Error en reserva usuario ${usuario.id_usuario}:`, {
            id_horario: horarios[i].id_horario,
            error: err.message
          });
        });
      });

      await Promise.all(reservasPromesas);

      // Limpiar horarios
      await db.query("DELETE FROM horarios_disponibles WHERE id_horario = ANY($1::int[])", 
        [horarios.map(h => h.id_horario)]);
      
      await sleep(CONFIG.TIEMPO_ESPERA);
    }

    // Reporte final
    console.log("\n=== RESULTADOS ===");
    console.log(`Total reservas: ${resultadosGlobales.exitosas + resultadosGlobales.fallidas}`);
    console.log(`Éxitos: ${resultadosGlobales.exitosas}`);
    console.log(`Fallos: ${resultadosGlobales.fallidas}`);
    
    if (resultadosGlobales.tiemposRespuesta.length > 0) {
      const avgTime = resultadosGlobales.tiemposRespuesta.reduce((a, b) => a + b, 0) / 
        resultadosGlobales.tiemposRespuesta.length;
      console.log(`Tiempo promedio: ${avgTime.toFixed(2)}ms`);
    }
    
    expect(resultadosGlobales.exitosas).toBeGreaterThan(0);
  }, 120000);
});