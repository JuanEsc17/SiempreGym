const express = require('express');
const router = express.Router();

const AsistenciasController =
  require('../../controllers/asistenciasController');

router.get(
  '/reservas-hoy/:idUsuario',
  AsistenciasController.obtenerReservasHoy
);

router.post(
  '/manual',
  AsistenciasController.registrarManual
);

module.exports = router;