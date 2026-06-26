const express = require("express");
const router = express.Router();
const personalController = require("../../controllers/personalController");
const { registerEmpleado } = require("../../controllers/registerEmpleadoController");

// GET  /api/personal
router.get("/", personalController.getPersonal);

// POST /api/personal
router.post("/", registerEmpleado);

// PATCH /api/personal/:id/rol
router.patch("/:id/rol", personalController.cambiarRol);

module.exports = router;