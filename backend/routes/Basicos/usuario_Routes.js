// backend/routes/Basicos/usuario_Routes.js
const express = require("express");
const {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  actualizarPassword,
  eliminarUsuario,
} = require("../../controllers/Basicos/Class_usuario_Controller");

const router = express.Router();

router.post("/", crearUsuario);
router.get("/", obtenerUsuarios);
router.get("/:id_usuario", obtenerUsuario);
router.put("/:id_usuario", actualizarUsuario);
router.put("/:id_usuario/password", actualizarPassword);
router.delete("/:id_usuario", eliminarUsuario);

module.exports = router;