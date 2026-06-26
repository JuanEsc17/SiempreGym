const express = require('express');
const router = express.Router();
const reportesAsistenciasController = require('../../controllers/reportesAsistenciasController');
const reportesIngresosController = require('../../controllers/reportesIngresosController');
// Obtener reporte de asistencias por rango de fechas
// Query params: fechaInicio (YYYY-MM-DD), fechaFin (YYYY-MM-DD), id_clase (opcional)
router.get('/asistencias', (req, res) => reportesAsistenciasController.obtenerReporte(req, res));

// Obtener detalles específicos de asistencias para una clase
// Query params: id_clase, fechaInicio (YYYY-MM-DD), fechaFin (YYYY-MM-DD)
router.get('/asistencias/detalles', (req, res) => reportesAsistenciasController.obtenerDetalles(req, res));

// Reporte de ingresos
router.get('/ingresos', (req, res) => reportesIngresosController.obtenerReporte(req, res));
router.get('/ingresos/actividades', (req, res) => reportesIngresosController.obtenerActividades(req, res));

module.exports = router;
