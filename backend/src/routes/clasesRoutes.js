const express = require('express');
const router = express.Router();
const multer = require('multer');
const ClasesController = require('../../controllers/clasesController');

const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 16 * 1024 * 1024 }
});

router.get('/disponibles', ClasesController.getDisponibles);
router.get('/por-dia', ClasesController.getPorDia);
router.get('/profesores', ClasesController.obtenerProfesores);
router.get('/salas', ClasesController.obtenerSalas);
router.post('/crear', upload.single('imagen'), ClasesController.crearClase);

module.exports = router;