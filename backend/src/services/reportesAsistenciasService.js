const db = require('../db');

class ReportesAsistenciasService {
  
  /**
   * Obtiene reportes de asistencias para una clase específica o todas las clases
   * en un rango de fechas determinado
   * 
   * @param {Date} fechaInicio - Fecha de inicio del rango
   * @param {Date} fechaFin - Fecha de fin del rango
   * @param {number|null} id_clase - ID de la clase específica o null para todas
   * @returns {Object} Objeto con el reporte de asistencias
   */
  async obtenerReporteAsistencias(fechaInicio, fechaFin, id_clase = null) {
    try {
      // Formatear fechas
      const inicio = new Date(fechaInicio).toISOString().split('T')[0];
      const fin = new Date(fechaFin).toISOString().split('T')[0];

      // Construir query dinámicamente según si es clase específica o todas
      let query = `
        SELECT 
          c.id_clase,
          c.actividad,
          COUNT(r.id_reserva) as total_inscritos,
          SUM(CASE WHEN a.id_asistencia IS NOT NULL AND a.presente = 1 THEN 1 ELSE 0 END) as asistencias,
          SUM(CASE WHEN r.estado = 'reservada' AND a.id_asistencia IS NULL THEN 1 ELSE 0 END) as inasistencias,
          SUM(CASE WHEN r.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
        FROM reservas r
        JOIN clases c ON r.id_clase = c.id_clase
        LEFT JOIN asistencias a ON a.id_reserva = r.id_reserva
        WHERE r.fecha_clase BETWEEN ? AND ?
      `;

      const params = [inicio, fin];

      // Si se especifica una clase, filtrar por ella
      if (id_clase) {
        query += ` AND c.id_clase = ?`;
        params.push(id_clase);
      }

      query += ` GROUP BY c.id_clase, c.actividad ORDER BY c.actividad`;

      const [results] = await db.promise().query(query, params);

      // Si no hay resultados, retornar estructura vacía
      if (results.length === 0) {
        return {
          ok: true,
          tieneClientes: false,
          mensaje: 'No hubo clientes inscriptos en el rango de fechas seleccionado.',
          data: []
        };
      }

      // Procesar resultados para calcular porcentajes
      const reportes = results.map(clase => {
        const total = clase.total_inscritos;
        const asistencias = clase.asistencias || 0;
        
        // Calcular inasistencias reales (reservadas - canceladas no cuentan como inasistencias)
        const inasistenciasReales = clase.inasistencias || 0;
        
        // Calcular porcentaje de inasistencias
        const porcentajeInasistencias = total > 0 
          ? ((inasistenciasReales / total) * 100).toFixed(2)
          : 0;

        const porcentajeAsistencias = total > 0
          ? ((asistencias / total) * 100).toFixed(2)
          : 0;

        return {
          id_clase: clase.id_clase,
          actividad: clase.actividad,
          totalInscritos: total,
          asistencias: asistencias,
          inasistencias: inasistenciasReales,
          canceladas: clase.canceladas || 0,
          porcentajeAsistencias: parseFloat(porcentajeAsistencias),
          porcentajeInasistencias: parseFloat(porcentajeInasistencias)
        };
      });

      return {
        ok: true,
        tieneClientes: true,
        fechaInicio: inicio,
        fechaFin: fin,
        clasesReportadas: id_clase ? 1 : reportes.length,
        data: reportes
      };

    } catch (error) {
      console.error('Error en obtenerReporteAsistencias:', error);
      throw error;
    }
  }

  /**
   * Obtiene detalles específicos de asistencias para una clase
   * incluyendo lista de clientes que asistieron y no asistieron
   * 
   * @param {number} id_clase - ID de la clase
   * @param {Date} fechaInicio - Fecha de inicio del rango
   * @param {Date} fechaFin - Fecha de fin del rango
   * @returns {Object} Detalles de asistencias por cliente
   */
  async obtenerDetallesAsistencias(id_clase, fechaInicio, fechaFin) {
    try {
      const inicio = new Date(fechaInicio).toISOString().split('T')[0];
      const fin = new Date(fechaFin).toISOString().split('T')[0];

      const query = `
        SELECT 
          u.id_usuario,
          u.nombre,
          u.apellido,
          r.estado,
          r.fecha_clase,
          r.tipo_reserva,
          r.tipo_pago,
          a.id_asistencia IS NOT NULL as asistencia_registrada,
          a.metodo,
          a.fecha_registro
        FROM reservas r
        JOIN usuarios u ON r.id_usuario = u.id_usuario
        JOIN clases c ON r.id_clase = c.id_clase
        LEFT JOIN asistencias a ON a.id_reserva = r.id_reserva
        WHERE c.id_clase = ?
          AND r.fecha_clase BETWEEN ? AND ?
        ORDER BY r.fecha_clase DESC, u.nombre ASC
      `;

      const [results] = await db.promise().query(query, [id_clase, inicio, fin]);

      return {
        ok: true,
        data: results
      };

    } catch (error) {
      console.error('Error en obtenerDetallesAsistencias:', error);
      throw error;
    }
  }
}

module.exports = new ReportesAsistenciasService();
