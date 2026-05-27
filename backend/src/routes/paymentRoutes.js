const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/paymentController'); 
// ⚠️ NOTA: Si tu archivo de rutas está dentro de "src/routes" y el controlador está 
// en "backend/controllers", lleva dos pares de puntos (../../) para subir dos carpetas.



// Definición de las rutas
router.post('/create-preference', paymentController.createPreference);
router.get('/payment-status', paymentController.paymentStatus);
module.exports = router;