class ReservasRepository {
  constructor(db) {
    this.db = db;
  }

  async buscarClasePorId(id_clase) {
    const [rows] = await this.db.promise().execute(
      'SELECT * FROM clases WHERE id_clase = ?', [id_clase]
    );
    return rows[0] || null;
  }

  async buscarClientePorId(id_usuario) {
    const [rows] = await this.db.promise().execute(
      'SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario]
    );
    return rows[0] || null;
  }

  async buscarReservasDeCliente(id_usuario) {
    const [rows] = await this.db.promise().execute(
      `SELECT r.*, c.fecha_hora_inicio, c.duracion
       FROM reservas r
       JOIN clases c ON r.id_clase = c.id_clase
       WHERE r.id_usuario = ? AND r.estado = 'CONFIRMADA'`,
      [id_usuario]
    );
    return rows;
  }

  async insertarReserva(id_usuario, id_clase, estado, tipo_pago, monto, saldo) {
    const [result] = await this.db.promise().execute(
      `INSERT INTO reservas (id_usuario, id_clase, estado, tipo_pago, monto_pagado, saldo_pendiente)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_usuario, id_clase, estado, tipo_pago, monto, saldo]
    );
    return result.insertId;
  }

  async actualizarCupos(id_clase) {
    await this.db.promise().execute(
      'UPDATE clases SET cupos_disponibles = cupos_disponibles - 1 WHERE id_clase = ?',
      [id_clase]
    );
  }

  async descontarCredito(id_usuario) {
    await this.db.promise().execute(
      'UPDATE usuarios SET creditos = creditos - 1 WHERE id_usuario = ?',
      [id_usuario]
    );
  }

  async getReservasPorUsuario(id_usuario) {
    const [rows] = await this.db.promise().execute(
      `SELECT r.*, c.actividad, c.dia, c.horario, c.duracion
       FROM reservas r
       JOIN clases c ON r.id_clase = c.id_clase
       WHERE r.id_usuario = ?
       ORDER BY r.fecha_reserva DESC`,
      [id_usuario]
    );
    return rows;
  }
}

module.exports = ReservasRepository;