// backend/routes/Basicos/cancha_Routes.js
const express = require("express");
const {
  crearCancha,
  obtenerCanchas,
  obtenerCanchasPorDeporte,
  obtenerCancha,
  actualizarCancha,
  eliminarCancha,
} = require("../../controllers/Basicos/Class_cancha_Controller");

const router = express.Router();

router.post("/", crearCancha);
router.get("/", obtenerCanchas);
router.get("/deporte/:id_deporte", obtenerCanchasPorDeporte);
router.get("/:id_cancha", obtenerCancha);
router.put("/:id_cancha", actualizarCancha);
router.delete("/:id_cancha", eliminarCancha);

module.exports = router;