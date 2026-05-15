const express = require('express');
const router = express.Router();
const ReservasController = require('../../controllers/reservasController');

router.post('/', ReservasController.crearReserva);
router.get('/usuario/:id', ReservasController.getMisReservas);

module.exports = router;