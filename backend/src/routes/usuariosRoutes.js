const express = require('express');
const router = express.Router();
const multer = require('multer');
const UsuariosController = require('../../controllers/usuariosController');

const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 16 * 1024 * 1024 }
});

router.get('/buscar', UsuariosController.buscarPorUsernameOMail);

// para permisos 
router.get('/admin/permisos-pendientes', UsuariosController.getMenoresPendientes);
router.put('/admin/permisos/:id/aprobar', UsuariosController.aprobarPermiso);
router.put('/admin/permisos/:id/rechazar', UsuariosController.rechazarPermiso);
router.put('/permisos/:id/resubmit', upload.single('permiso'), UsuariosController.resubmitPermiso);

router.get('/:id', UsuariosController.getById);

// Rutas de recuperación de contraseña
router.post('/forgot-password', UsuariosController.solicitarCambioContraseña);
router.post('/verify-code', UsuariosController.verificarCodigo);
router.post('/reset-password', UsuariosController.cambiarContraseña);

module.exports = router;