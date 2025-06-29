// backend/routes/apiRoutes.js
const express = require("express");
const router = express.Router();

// Rutas básicas
router.use("/roles", require("./Basicos/rol_Routes"));
router.use("/usuarios", require("./Basicos/usuario_Routes"));
router.use("/deportes", require("./Basicos/deporte_Routes"));

module.exports = router;