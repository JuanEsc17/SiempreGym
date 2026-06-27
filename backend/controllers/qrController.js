const db = require('../src/db');
const AsistenciasRepository = require('../repositories/asistenciasRepository');
const RegisterRepository = require('../repositories/registerRepository');

const qrRepo = new RegisterRepository(db);
const asistenciasRepo = new AsistenciasRepository(db);

const QRController = {
  // Historia 1: Obtener QR del usuario
  async obtenerQR(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de usuario requerido'
        });
      }

      const usuario = await qrRepo.findById(userId);

      if (!usuario) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Usuario no encontrado'
        });
      }

      if (!usuario.codigo_qr) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Hubo un fallo generando su QR'
        });
      }

      return res.json({
        ok: true,
        codigo_qr: usuario.codigo_qr,
        mensaje: 'Código QR obtenido exitosamente'
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: error.message
      });
    }
  },

  // Historia 2: Verificar y procesar QR
  async verificarQR(req, res) {
    try {
      const { qrData } = req.body;

      if (!qrData) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Código QR requerido'
        });
      }

      // Decodificar QR
      let datosQR;
      try {
        datosQR = JSON.parse(qrData);
      } catch (e) {
        return res.status(400).json({
          ok: false,
          mensaje: 'QR incorrecto'
        });
      }

      const { userId } = datosQR;

      if (!userId) {
        return res.status(400).json({
          ok: false,
          mensaje: 'QR incorrecto'
        });
      }

      // Verificar que el usuario existe
      const usuario = await qrRepo.findById(userId);
      if (!usuario) {
        return res.status(404).json({
          ok: false,
          mensaje: 'QR incorrecto'
        });
      }

      // Obtener reservas del usuario para hoy
      const reservasHoy = await asistenciasRepo.obtenerReservasHoyPorUsuario(userId);

      if (!reservasHoy || reservasHoy.length === 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No hay reservas disponibles para registrar asistencia en este momento.'
        });
      }

      // Procesar cada reserva válida
      const resultados = [];

    for (const reserva of reservasHoy) {
        const ahora = new Date();
        
        const inicioClase = new Date(
          `${reserva.fecha_clase.toISOString().split('T')[0]} ${reserva.horario}`
        );

        // Validar tiempo
        const duracionClase = reserva.duracion || 60;

        const finClase = new Date(inicioClase.getTime() + duracionClase * 60000);//puse aca xq pedia cosas de otro

        const habilitaDesde = new Date(inicioClase.getTime() - 30 * 60000);
        const venceEn = new Date(finClase.getTime() - 15 * 60000);


        

        // Fuera del rango (antes de 30 min o después de que terminó) → sin reservas
        if (ahora < habilitaDesde || ahora > finClase) {
        continue;
        }

        // Llegó tarde (más de 15 min desde que empezó, pero clase no terminó)
        if (ahora > venceEn) {
          resultados.push({
            idReserva: reserva.id_reserva,
            clase: reserva.actividad,
            valido: false,
            razon: 'Se ha superado el tiempo límite para registrar asistencia a la clase'
          });
          continue;
        }

        // Validar si ya fue marcada
        const asistenciaExistente = await asistenciasRepo.buscarAsistenciaPorReserva(reserva.id_reserva);
        if (asistenciaExistente) {
          resultados.push({
            idReserva: reserva.id_reserva,
            clase: reserva.actividad,
            valido: false,
            razon: 'Asistencia ya marcada'
          });
          continue;
        }

        // Validar pago de la clase
        if (reserva.saldo_pendiente && reserva.saldo_pendiente > 0) {
          resultados.push({
            idReserva: reserva.id_reserva,
            clase: reserva.actividad,
            valido: false,
            razon: 'La clase no se encuentra abonada'
          });
          continue;
        }

        // Todo válido - registrar asistencia
        await asistenciasRepo.registrarAsistencia({
          usuario_id: userId,
          id_reserva: reserva.id_reserva,
          metodo: 'qr'
        });
        await asistenciasRepo.marcarReservaAsistida(reserva.id_reserva);
        resultados.push({
          idReserva: reserva.id_reserva,
          clase: reserva.actividad,
          valido: true,
          razon: 'Asistencia registrada exitosamente'
        });
      }

      // Devolver resultado
      const valido = resultados.some(r => r.valido);
      const hayResultados = resultados.length > 0;

      return res.json({
        ok: true,
        valido,
        usuario: usuario.nombre,
        resultados,
        mensaje: valido 
        ? 'Asistencia registrada. Bienvenido!'
        : hayResultados 
            ? resultados[0].razon
            : 'El cliente está sin reservas para el día actual'
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: error.message
      });
    }
  }
};

module.exports = QRController;