const reservasRepository = require('../../repositories/reservasRepository');
const renovacionesRepository = require('../../repositories/renovacionesRepository');

const cancelacionMensualidadService = {

  cancelarMensualidad: async (id_usuario, id_clase) => {

    // 1. Obtener todas las reservas pendientes de la mensualidad
    const reservasPendientes = await reservasRepository.obtenerReservasMensualesPendientes(
      id_usuario, id_clase
    );

    if (reservasPendientes.length === 0) {
      throw new Error('No hay reservas mensuales activas para esta clase.');
    }

    const idsReservas = reservasPendientes.map(r => r.id_reserva);

    // 2. Cancelar todas las reservas
    await reservasRepository.cancelarReservasPorIds(idsReservas);

    // 3. Generar 1 crédito por cada clase cancelada
    for (let i = 0; i < reservasPendientes.length; i++) {
      await reservasRepository.agregarCredito(id_usuario, 1);
    }

    // 4. Cancelar la renovación asociada (si existe)
    const renovacion = await renovacionesRepository.obtenerRenovacionActiva(id_usuario, id_clase);
    if (renovacion) {
      await renovacionesRepository.cancelarRenovacion(renovacion.id_renovacion);
    }

    return {
      success: true,
      reservasCanceladas: reservasPendientes.length,
      creditosAcreditados: reservasPendientes.length
    };
  }
};

module.exports = cancelacionMensualidadService;
