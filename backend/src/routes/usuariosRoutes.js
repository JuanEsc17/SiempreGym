const express = require('express');
const router = express.Router();
const UsuariosController = require('../../controllers/usuariosController');

router.get('/:id', UsuariosController.getById);

module.exports = router;