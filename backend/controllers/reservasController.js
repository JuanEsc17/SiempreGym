const ReservasService = require('../src/services/reservasService');

const ReservasController = {

    async crearReserva(req, res) {
        try {
        const { id_usuario, id_clase, tipo_pago } = req.body;
        const resultado = await ReservasService.crearReserva(id_usuario, id_clase, tipo_pago);
        res.json({
            ok: true,
            mensaje: resultado.aviso
            ? 'Reserva confirmada. Recordá que tenés hasta el día 10 para regularizar tu plan.'
            : 'Reserva confirmada exitosamente',
        ...resultado
        });
    } catch (error) {
        res.status(error.status || 500).json({ ok: false, mensaje: error.mensaje || error.message });
    }
},

async getMisReservas(req, res) {
    try {
        const reservas = await ReservasService.getMisReservas(req.params.id);
        res.json({ ok: true, data: reservas });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
    }

};

module.exports = ReservasController;