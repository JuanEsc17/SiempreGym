const UsuariosRepo = require('../repositories/usuariosRepository');

const UsuariosController = {

async getById(req, res) {
    try {
        const usuario = await UsuariosRepo.buscarPorId(req.params.id);
        if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
        res.json({ ok: true, data: usuario });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
    }

};

module.exports = UsuariosController;