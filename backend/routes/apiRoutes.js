// backend/routes/apiRoutes.js
const express = require("express");
const router = express.Router();

// Rutas básicas
router.use("/roles", require("./Basicos/rol_Routes"));

module.exports = router;