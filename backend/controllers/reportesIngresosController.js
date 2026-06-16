const reportesIngresosService = require('../src/services/reportesIngresosService');

class ReportesIngresosController {

  async obtenerReporte(req, res) {
    try {
      const { fechaDesde, fechaHasta, actividad } = req.query;

      if (!fechaDesde || !fechaHasta) {
        return res.status(400).json({ error: 'fechaDesde y fechaHasta son requeridos' });
      }

      const reporte = await reportesIngresosService.obtenerReporte({
        fechaDesde,
        fechaHasta,
        actividad: actividad || null,
      });

      res.json(reporte);
    } catch (error) {
      console.error('Error en reporte de ingresos:', error);
      res.status(500).json({ error: 'Error al obtener reporte de ingresos' });
    }
  }

  async obtenerActividades(req, res) {
    try {
      const actividades = await reportesIngresosService.obtenerActividades();
      res.json({ ok: true, data: actividades });
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      res.status(500).json({ error: 'Error al obtener actividades' });
    }
  }
}

module.exports = new ReportesIngresosController();