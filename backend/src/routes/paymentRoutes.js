const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/paymentController'); 
// ⚠️ NOTA: Si tu archivo de rutas está dentro de "src/routes" y el controlador está 
// en "backend/controllers", lleva dos pares de puntos (../../) para subir dos carpetas.

// Verificamos en consola si se está importando bien antes de que falle Express
console.log("¿Existe createPreference?:", typeof paymentController.createPreference);
console.log("¿Existe validarPago?:", typeof paymentController.validarPago);

// Definición de las rutas
router.post('/create-preference', paymentController.createPreference);
router.get('/payment-status', paymentController.paymentStatus);
module.exports = router;