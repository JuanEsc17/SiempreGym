const express = require('express');
const router = express.Router();
const InstanciasController = require('../../controllers/instanciasController');

router.get('/bimestre', InstanciasController.obtenerBimestre);
router.post('/cancelar', InstanciasController.cancelarInstancia);

module.exports = router;
