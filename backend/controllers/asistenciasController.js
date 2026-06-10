const db = require('../src/db');
const AsistenciasRepository = require('../repositories/asistenciasRepository');

const repo = new AsistenciasRepository(db);

const AsistenciasController = {

  async obtenerReservasHoy(req, res) {

    try {

      const { idUsuario } = req.params;

      const reservas =
        await repo.obtenerReservasHoyPorUsuario(idUsuario);

      return res.json({
        ok: true,
        data: reservas
      });

    } catch (error) {

      return res.status(500).json({
        ok: false,
        mensaje: error.message
      });

    }
  },

  async registrarManual(req, res) {

    try {

      const {
        usuario_id,
        id_reserva
      } = req.body;

      if (!usuario_id) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe seleccionar un usuario'
        });
      }

      if (!id_reserva) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe seleccionar una clase'
        });
      }

      const reserva =
        await repo.obtenerReservaPorId(id_reserva);

      if (!reserva) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Reserva no encontrada'
        });
      }

      const asistenciaExistente =
        await repo.buscarAsistenciaPorReserva(id_reserva);

      if (asistenciaExistente) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La asistencia ya fue registrada'
        });
      }

      if (
        reserva.tipo_pago === 'seña' &&
        Number(reserva.saldo_pendiente) > 0
      ) {
        return res.status(400).json({
          ok: false,
          codigo: 'SENIA_PENDIENTE',
          mensaje: 'Debe completarse el pago de la seña'
        });
      }

      if (
        reserva.tipo_reserva === 'mensual' &&
        Number(reserva.saldo_pendiente) > 0
      ) {
        return res.status(400).json({
          ok: false,
          codigo: 'MENSUAL_IMPAGA',
          mensaje: 'La mensualidad posee saldo pendiente'
        });
      }

      await repo.registrarAsistencia({
        usuario_id,
        id_reserva
      });

      await repo.marcarReservaAsistida(id_reserva);

      return res.json({
        ok: true,
        mensaje: 'Asistencia registrada correctamente'
      });

    } catch (error) {

      return res.status(500).json({
        ok: false,
        mensaje: error.message
      });

    }
  }

};

module.exports = AsistenciasController;