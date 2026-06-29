const express = require('express');
const router = express.Router();
const InstanciasController = require('../../controllers/instanciasController');

router.get('/semana', InstanciasController.obtenerSemana);
router.post('/cancelar', InstanciasController.cancelarInstancia);

module.exports = router;
