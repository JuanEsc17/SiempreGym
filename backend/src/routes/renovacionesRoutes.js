// backend/src/routes/renovaciones.js

const express = require('express');
const router = express.Router();
const RenovacionesController = require('../../controllers/renovacionesController');

const ctrl = new RenovacionesController();

// ─── Banner (va antes de /:id_usuario para no confundirse con el param) ───
router.get('/banner/:id_usuario', ctrl.getBanner.bind(ctrl));

// ─── Renovaciones del usuario ─────────────────────────────────────────────
router.get('/:id_usuario', ctrl.getRenovaciones.bind(ctrl));
router.get('/tiene-pendiente/:id_usuario/:id_clase/:mes/:anio', ctrl.tienePendiente.bind(ctrl));
// ─── Verificar antes de pagar ─────────────────────────────────────────────
router.post('/verificar', ctrl.verificarRenovacion.bind(ctrl));

// ─── Confirmar post-pago ──────────────────────────────────────────────────
router.post('/confirmar', ctrl.confirmarRenovacion.bind(ctrl));


module.exports = router;