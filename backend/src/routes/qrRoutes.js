const express = require('express');
const router = express.Router();
const QRController = require('../../controllers/qrController');

router.get('/usuario/:userId', QRController.obtenerQR);
router.post('/verificar', QRController.verificarQR);

module.exports = router;