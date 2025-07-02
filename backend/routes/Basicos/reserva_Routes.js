// backend/routes/Basicos/reserva_Routes.js
const express = require("express");
const {
  crearReserva,
  obtenerReservasPorUsuario,
  obtenerReserva,
  actualizarEstadoReserva,
  eliminarReserva,
  obtenerTodasReservas,
  actualizarReserva,
} = require("../../controllers/Basicos/Class_reserva_Controller");

const router = express.Router();

router.post("/", crearReserva);
router.get("/", obtenerTodasReservas);
router.get("/usuario/:id_usuario", obtenerReservasPorUsuario);
router.get("/:id_reserva", obtenerReserva);
router.put("/:id_reserva", actualizarReserva);
router.put("/:id_reserva/estado", actualizarEstadoReserva);
router.delete("/:id_reserva", eliminarReserva);

module.exports = router;