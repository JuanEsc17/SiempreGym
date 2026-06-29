const express = require('express');
const router  = express.Router();
const ReservasController = require('../../controllers/reservasController');

const ctrl = new ReservasController();

// ─── CANCELAR MENSUALIDAD ─────────────────────────────────────
// Cancela todas las reservas pendientes de una mensualidad,
// acredita créditos y cancela la renovación asociada.
// Body: { id_usuario, id_clase }
router.post('/mensualidad', (req, res) => ctrl.cancelarMensualidad(req, res));

module.exports = router;
