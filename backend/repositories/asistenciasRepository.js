class AsistenciasRepository {
  constructor(db) {
    this.db = db;
  }

  async obtenerReservasHoyPorUsuario(idUsuario) {
    
    const [rows] = await this.db.promise().execute(
      `
      SELECT
        r.id_reserva,
        r.id_usuario,
        r.tipo_reserva,
        r.tipo_pago,
        r.saldo_pendiente,
        c.actividad,
        c.horario,
        c.duracion,
        r.fecha_clase
      FROM reservas r
      JOIN clases c
        ON c.id_clase = r.id_clase
      WHERE r.id_usuario = ?
        AND r.fecha_clase = CURDATE()
        AND r.estado = 'reservada'
      ORDER BY c.horario
      `,
      [idUsuario]
    );

    return rows;
  }

  async buscarAsistenciaPorReserva(idReserva) {
    const [rows] = await this.db.promise().execute(
      `
      SELECT *
      FROM asistencias
      WHERE id_reserva = ?
      `,
      [idReserva]
    );

    return rows[0] || null;
  }

  async obtenerReservaPorId(idReserva) {
    const [rows] = await this.db.promise().execute(
      `
      SELECT
      r.*,
      c.horario
      FROM reservas r
      JOIN clases c
      ON c.id_clase = r.id_clase
      WHERE r.id_reserva = ?
      `,
      [idReserva]
    );

    return rows[0] || null;
  }

  async registrarAsistencia({
    usuario_id,
    id_reserva
  }) {

    await this.db.promise().execute(
      `
      INSERT INTO asistencias (
        usuario_id,
        id_reserva,
        presente,
        metodo
      )
      VALUES (?, ?, true, 'manual')
      `,
      [
        usuario_id,
        id_reserva
      ]
    );
  }

  async marcarReservaAsistida(idReserva) {
    await this.db.promise().execute(
      `
      UPDATE reservas
      SET estado = 'asistio'
      WHERE id_reserva = ?
      `,
      [idReserva]
    );
  }
}

module.exports = AsistenciasRepository;