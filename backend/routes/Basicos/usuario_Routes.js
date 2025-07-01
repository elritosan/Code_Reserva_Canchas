// backend/routes/Basicos/usuario_Routes.js
const express = require("express");
const {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuario,
  obtenerUsuarioPorEmail,
  actualizarUsuario,
  actualizarPassword,
  eliminarUsuario,
  login,
} = require("../../controllers/Basicos/Class_usuario_Controller");

const router = express.Router();

router.post("/", crearUsuario);
router.get("/", obtenerUsuarios);
router.get("/:id_usuario", obtenerUsuario);
router.get("/email/:email", obtenerUsuarioPorEmail);
router.put("/:id_usuario", actualizarUsuario);
router.put("/:id_usuario/password", actualizarPassword);
router.delete("/:id_usuario", eliminarUsuario);

// Ruta de login
router.post("/login", login);

module.exports = router;