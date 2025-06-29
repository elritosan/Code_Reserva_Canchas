// backend/routes/Basicos/deporte_Routes.js
const express = require("express");
const {
  crearDeporte,
  obtenerDeportes,
  obtenerDeporte,
  actualizarDeporte,
  eliminarDeporte,
} = require("../../controllers/Basicos/Class_deporte_Controller");

const router = express.Router();

router.post("/", crearDeporte);
router.get("/", obtenerDeportes);
router.get("/:id_deporte", obtenerDeporte);
router.put("/:id_deporte", actualizarDeporte);
router.delete("/:id_deporte", eliminarDeporte);

module.exports = router;