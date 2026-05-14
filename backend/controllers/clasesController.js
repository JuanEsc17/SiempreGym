const ClasesService = require('../src/services/clasesService');

const ClasesController = {

async getDisponibles(req, res) {
    try {
        const clases = await ClasesService.getDisponibles();
        res.json({ ok: true, data: clases });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
},

async getPorDia(req, res) {
    try {
        const clases = await ClasesService.getPorDia(req.query.dia);
        res.json({ ok: true, data: clases });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
    }

};

module.exports = ClasesController;