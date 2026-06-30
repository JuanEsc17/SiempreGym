const db = require('../src/db');

class ReportesIngresosRepository {

  async getMetricas({ fechaDesde, fechaHasta, actividad }) {
    console.log('=== getMetricas ===', { fechaDesde, fechaHasta, actividad });
    
    let query = `
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN r.tipo_pago = 'total'   THEN c.precio_individual
            WHEN r.tipo_pago = 'seña'    THEN (c.precio_individual - r.saldo_pendiente)
            WHEN r.tipo_pago = 'credito' THEN c.precio_individual
            ELSE 0
          END
        ), 0) AS ingreso_total,
        COUNT(*)                                                              AS total_reservas,
        SUM(CASE WHEN r.tipo_reserva = 'mensual'    THEN 1 ELSE 0 END)      AS mensuales,
        SUM(CASE WHEN r.tipo_reserva = 'individual' THEN 1 ELSE 0 END)      AS individuales
      FROM reservas r
      JOIN clases c ON c.id_clase = r.id_clase
      WHERE r.fecha_clase BETWEEN ? AND ?
        AND r.estado IN ('reservada', 'asistio')
    `;
    const params = [fechaDesde, fechaHasta];

    if (actividad) {
      query += ` AND c.actividad = ?`;
      params.push(actividad);
      console.log('Filtro actividad aplicado:', actividad);
    }

    console.log('Params:', params);
    const [rows] = await db.promise().query(query, params);
    console.log('Resultado getMetricas:', rows[0]);
    return rows[0];
  }

  async getPorDia({ fechaDesde, fechaHasta, actividad }) {
    let query = `
      SELECT 
        r.fecha_clase AS dia,
        COUNT(*)      AS cantidad,
        SUM(
          CASE 
            WHEN r.tipo_pago = 'total'   THEN c.precio_individual
            WHEN r.tipo_pago = 'seña'    THEN (c.precio_individual - r.saldo_pendiente)
            WHEN r.tipo_pago = 'credito' THEN c.precio_individual
            ELSE 0
          END
        ) AS total
      FROM reservas r
      JOIN clases c ON c.id_clase = r.id_clase
      WHERE r.fecha_clase BETWEEN ? AND ?
        AND r.estado IN ('reservada', 'asistio')
    `;
    const params = [fechaDesde, fechaHasta];

    if (actividad) {
      query += ` AND c.actividad = ?`;
      params.push(actividad);
    }

    query += ` GROUP BY r.fecha_clase ORDER BY r.fecha_clase ASC`;

    const [rows] = await db.promise().query(query, params);
    return rows;
  }

  async getPorActividad({ fechaDesde, fechaHasta }) {
    const query = `
      SELECT 
        c.actividad,
        COUNT(r.id_reserva)                                                   AS cantidad,
        SUM(CASE WHEN r.tipo_reserva = 'mensual'    THEN 1 ELSE 0 END)       AS mensuales,
        SUM(CASE WHEN r.tipo_reserva = 'individual' THEN 1 ELSE 0 END)       AS individuales,
        SUM(
          CASE 
            WHEN r.tipo_pago = 'total'   THEN c.precio_individual
            WHEN r.tipo_pago = 'seña'    THEN (c.precio_individual - r.saldo_pendiente)
            WHEN r.tipo_pago = 'credito' THEN c.precio_individual
            ELSE 0
          END
        ) AS ingreso
      FROM reservas r
      JOIN clases c ON c.id_clase = r.id_clase
      WHERE r.fecha_clase BETWEEN ? AND ?
        AND r.estado IN ('reservada', 'asistio')
      GROUP BY c.actividad
      ORDER BY ingreso DESC
    `;

    const [rows] = await db.promise().query(query, [fechaDesde, fechaHasta]);
    console.log('Resultado getPorActividad:', rows);
    return rows;
  }

  async getActividades() {
    const query = `
      SELECT DISTINCT actividad 
      FROM clases 
      WHERE estado = 'activa'
      ORDER BY actividad ASC
    `;
    const [rows] = await db.promise().query(query);
    return rows.map(r => r.actividad);
  }
}

module.exports = new ReportesIngresosRepository();