const express = require('express');
const router  = express.Router();
const ReservasController = require('../../controllers/reservasController');

const ctrl = new ReservasController();

// ─── RESERVA MENSUAL ──────────────────────────────────────────────
// Verificar disponibilidad y obtener precio proporcional del mes
router.post('/verificar-mensual', (req, res) => ctrl.verificarReservaMensual(req, res));

// Confirmar las reservas del mes (post-pago en MP)
//    Body: { id_usuario, id_clase, fechas: [...], monto_total }
router.post('/crear-mensual', (req, res) => ctrl.crearReservaMensual(req, res));

// marian presencial
router.post('/crear-mensual',(req,res)=>ctrl.crearReservaMensual(req,res));
// fin marian

//  Ingresar a lista de espera mensual
//    Body: { id_usuario, id_clase }
router.post('/lista-espera-mensual', (req, res) => ctrl.confirmarListaEsperaMensual(req, res));


// ─── RESERVA INDIVIDUAL ───────────────────────────────────────────
//  Verificar disponibilidad para una fecha exacta
//    Body: { id_usuario, id_clase, fecha_clase }
//    Responde con: id_instancia, monto, precio_sena, puede_usar_sena, creditos_usuario
router.post('/verificar-individual', (req, res) => ctrl.verificarIndividual(req, res));

// Confirmar la reserva individual (post-pago en MP o directo con crédito)
//    Body: { id_usuario, id_clase, id_instancia, fecha_clase, tipo_pago, precio_total }
router.post('/crear', (req, res) => ctrl.confirmarReservaIndividual(req, res));

// Ingresar a lista de espera individual
//    Body: { id_usuario, id_clase }
router.post('/lista-espera', (req, res) => ctrl.confirmarListaEsperaIndividual(req, res));
router.post('/registrar-pago-efectivo', (req, res) => ctrl.registrarPagoEfectivo(req, res));
// ─── HISTORIAL ───────────────────────────────────────────────────
router.get('/usuario/:id', (req, res) => ctrl.getMisReservas(req, res));

router.post('/completar-pago', (req, res) => ctrl.completarPago(req, res));// completar pago de una seña existente (individual)

// ─── CANCELACIÓN ──────────────────────────────────────────────────
router.delete('/:id_reserva', (req, res) => ctrl.cancelarReserva(req, res));

module.exports = router;