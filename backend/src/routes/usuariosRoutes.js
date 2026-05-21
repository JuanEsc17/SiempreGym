const express = require('express');
const router = express.Router();
const UsuariosController = require('../../controllers/usuariosController');

router.get('/buscar', UsuariosController.buscarPorUsernameOMail);

// para permisos 
router.get('/admin/permisos-pendientes', UsuariosController.getMenoresPendientes);
router.put('/admin/permisos/:id/aprobar', UsuariosController.aprobarPermiso);
router.put('/admin/permisos/:id/rechazar', UsuariosController.rechazarPermiso);
//
router.get('/:id', UsuariosController.getById);

module.exports = router;