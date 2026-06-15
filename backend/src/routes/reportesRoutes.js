const express = require('express');
const router = express.Router();
const reportesAsistenciasController = require('../../controllers/reportesAsistenciasController');

// Obtener reporte de asistencias por rango de fechas
// Query params: fechaInicio (YYYY-MM-DD), fechaFin (YYYY-MM-DD), id_clase (opcional)
router.get('/asistencias', (req, res) => reportesAsistenciasController.obtenerReporte(req, res));

// Obtener detalles específicos de asistencias para una clase
// Query params: id_clase, fechaInicio (YYYY-MM-DD), fechaFin (YYYY-MM-DD)
router.get('/asistencias/detalles', (req, res) => reportesAsistenciasController.obtenerDetalles(req, res));

module.exports = router;
