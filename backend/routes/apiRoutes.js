// backend/routes/apiRoutes.js
const express = require("express");
const router = express.Router();

// Rutas básicas
router.use("/roles", require("./Basicos/rol_Routes"));
router.use("/usuarios", require("./Basicos/usuario_Routes"));
router.use("/deportes", require("./Basicos/deporte_Routes"));
router.use("/canchas", require("./Basicos/cancha_Routes"));
router.use("/horarios", require("./Basicos/horario_disponible_Routes"));
router.use("/reservas", require("./Basicos/reserva_Routes"));

module.exports = router;