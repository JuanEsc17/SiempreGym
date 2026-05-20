const express = require('express');
const router = express.Router();
const UsuariosController = require('../../controllers/usuariosController');

router.get('/buscar', UsuariosController.buscarPorUsernameOMail);
router.get('/:id', UsuariosController.getById);

module.exports = router;