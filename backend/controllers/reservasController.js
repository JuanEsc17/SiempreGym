const db = require('../src/db');
const ReservasService = require('../src/services/reservasService');

const service = new ReservasService(db);

const ReservasController = {

  async crearReserva(req, res) {
    try {
      // 1. Sumamos 'precio_total' que viene desde el Frontend al volver de Mercado Pago
      const { id_usuario, id_clase, tipo_pago, precio_total } = req.body;
      
      // 2. Se lo pasamos al servicio (le agregamos el cuarto parámetro)
      const resultado = await service.crearReserva(id_usuario, id_clase, tipo_pago, precio_total);
      
      // 3. Modificamos los mensajes de respuesta según las Historias de Usuario
      let mensajeFinal = 'Reserva confirmada exitosamente';
      
      if (tipo_pago === 'SEÑA') {
        const saldo = parseFloat(precio_total) / 2;
        mensajeFinal = `¡Seña abonada con éxito! Queda un saldo pendiente de $${saldo} a pagar en el gimnasio.`;
      } else if (resultado.aviso) {
        mensajeFinal = 'Reserva confirmada. Recordá que tenés hasta el día 10 para regularizar tu plan.';
      }

      res.json({
        ok: true,
        mensaje: mensajeFinal,
        ...resultado
      });
    } catch (error) {
      res.status(error.status || 500).json({ ok: false, mensaje: error.mensaje || error.message });
    }
  },

  async getMisReservas(req, res) {
    try {
      const reservas = await service.getMisReservas(req.params.id);
      res.json({ ok: true, data: reservas });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

};

module.exports = ReservasController;