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
    // Machea con el estado 'reservada' y trae el día y horario original del dump
    const [rows] = await this.db.promise().execute(
      `SELECT r.*, c.dia, c.horario, c.duracion
       FROM reservas r
       JOIN clases c ON r.id_clase = c.id_clase
       WHERE r.id_usuario = ? AND r.estado = 'reservada'`,
      [id_usuario]
    );
    return rows;
  }

  async insertarReserva(id_usuario, id_clase, estado, tipo_pago) {
    // Inserta usando estrictamente las columnas del dump de tu grupo
    const [result] = await this.db.promise().execute(
      `INSERT INTO reservas (id_usuario, id_clase, estado, tipo_pago)
       VALUES (?, ?, ?, ?)`,
      [id_usuario, id_clase, estado, tipo_pago]
    );
    return result.insertId;
  }

  async insertarPago(id_usuario, monto, estado, metodo, tipo) {
    // Registra el flujo de dinero en la tabla pagos del grupo
    const [result] = await this.db.promise().execute(
      `INSERT INTO pagos (id_usuario, monto, estado, metodo, tipo)
       VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, monto, estado, metodo, tipo]
    );
    return result.insertId;
  }

  async actualizarCupos(id_clase) {
    // Suma 1 a los inscriptos tal como está modelado en tu BD
    await this.db.promise().execute(
      'UPDATE clases SET cantidad_inscriptos = cantidad_inscriptos + 1 WHERE id_clase = ?',
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