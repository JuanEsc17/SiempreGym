const reportesAsistenciasService = require('../src/services/reportesAsistenciasService');

class ReportesAsistenciasController {
  
  /**
   * Obtiene el reporte de asistencias por rango de fechas
   * Query params: fechaInicio, fechaFin, id_clase (opcional)
   */
  async obtenerReporte(req, res) {
    try {
      const { fechaInicio, fechaFin, id_clase } = req.query;

      // Validar parámetros obligatorios
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Los parámetros fechaInicio y fechaFin son obligatorios'
        });
      }

      // Validar formato de fechas
      const regex = /^\d{4}-\d{2}-\d{2}$/; // Formato YYYY-MM-DD
      if (!regex.test(fechaInicio) || !regex.test(fechaFin)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Las fechas deben estar en formato YYYY-MM-DD'
        });
      }

      // Validar que fechaInicio sea menor o igual a fechaFin
      if (new Date(fechaInicio) > new Date(fechaFin)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La fecha de inicio debe ser menor o igual a la fecha de fin'
        });
      }

      // Llamar al servicio
      const reporte = await reportesAsistenciasService.obtenerReporteAsistencias(
        fechaInicio,
        fechaFin,
        id_clase ? parseInt(id_clase) : null
      );

      return res.status(200).json(reporte);

    } catch (error) {
      console.error('Error en obtenerReporte:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener el reporte de asistencias'
      });
    }
  }

  /**
   * Obtiene los detalles específicos de asistencias para una clase
   * Query params: id_clase, fechaInicio, fechaFin
   */
  async obtenerDetalles(req, res) {
    try {
      const { id_clase, fechaInicio, fechaFin } = req.query;

      // Validar parámetros obligatorios
      if (!id_clase || !fechaInicio || !fechaFin) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Los parámetros id_clase, fechaInicio y fechaFin son obligatorios'
        });
      }

      // Validar formato de fechas
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(fechaInicio) || !regex.test(fechaFin)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Las fechas deben estar en formato YYYY-MM-DD'
        });
      }

      // Llamar al servicio
      const detalles = await reportesAsistenciasService.obtenerDetallesAsistencias(
        parseInt(id_clase),
        fechaInicio,
        fechaFin
      );

      return res.status(200).json(detalles);

    } catch (error) {
      console.error('Error en obtenerDetalles:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener los detalles de asistencias'
      });
    }
  }
}

module.exports = new ReportesAsistenciasController();
