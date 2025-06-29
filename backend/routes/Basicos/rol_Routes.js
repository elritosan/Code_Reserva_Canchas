// backend/routes/Basicos/rol_Routes.js
const express = require("express");
const {
  crearRol,
  obtenerRoles,
  obtenerRol,
  actualizarRol,
  eliminarRol,
} = require("../../controllers/Basicos/Class_rol_Controller");

const router = express.Router();

router.post("/", crearRol);
router.get("/", obtenerRoles);
router.get("/:id_rol", obtenerRol);
router.put("/:id_rol", actualizarRol);
router.delete("/:id_rol", eliminarRol);

module.exports = router;