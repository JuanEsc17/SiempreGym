const express = require('express');
const router = express.Router();
const ClasesController = require('../../controllers/clasesController');

router.get('/disponibles', ClasesController.getDisponibles);
router.get('/por-dia', ClasesController.getPorDia);

module.exports = router;