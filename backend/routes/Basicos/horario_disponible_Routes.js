// backend/routes/Basicos/horario_disponible_Routes.js
const express = require("express");
const {
  crearHorario,
  obtenerHorariosPorCancha,
  obtenerHorario,
  actualizarDisponibilidad,
  eliminarHorario,
  obtenerTodosHorarios,
} = require("../../controllers/Basicos/Class_horario_disponible_Controller");

const router = express.Router();

router.post("/", crearHorario);
router.get("/", obtenerTodosHorarios);
router.get("/cancha/:id_cancha", obtenerHorariosPorCancha);
router.get("/:id_horario", obtenerHorario);
router.put("/:id_horario/disponibilidad", actualizarDisponibilidad);
router.delete("/:id_horario", eliminarHorario);

module.exports = router;