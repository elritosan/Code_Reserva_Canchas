// backend/routes/Basicos/pago_Routes.js
const express = require("express");
const {
  crearPago,
  obtenerPagosPorReserva,
  obtenerPagosPorUsuario,
  obtenerPago,
  actualizarEstadoPago,
  obtenerTodosPagos,
} = require("../../controllers/Basicos/Class_pago_Controller");

const router = express.Router();

router.post("/", crearPago);
router.get("/", obtenerTodosPagos);
router.get("/reserva/:id_reserva", obtenerPagosPorReserva);
router.get("/usuario/:id_usuario", obtenerPagosPorUsuario);
router.get("/:id_pago", obtenerPago);
router.put("/:id_pago/estado", actualizarEstadoPago);

module.exports = router;