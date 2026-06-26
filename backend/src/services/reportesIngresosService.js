const reportesIngresosRepository = require('../../repositories/reportesIngresosRepository');

class ReportesIngresosService {

  async obtenerReporte({ fechaDesde, fechaHasta, actividad }) {
    const filtros = { fechaDesde, fechaHasta, actividad: actividad || null };

    const [metricas, por_dia, por_actividad] = await Promise.all([
      reportesIngresosRepository.getMetricas(filtros),
      reportesIngresosRepository.getPorDia(filtros),
      reportesIngresosRepository.getPorActividad({ fechaDesde, fechaHasta }), // siempre sin filtro para el donut
    ]);

    return { metricas, por_dia, por_actividad };
  }

  async obtenerActividades() {
    return reportesIngresosRepository.getActividades();
  }
}

module.exports = new ReportesIngresosService();