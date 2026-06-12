const db = require('../src/db');

const reservasRepository = {

  // ─── SUPERPOSICIÓN ────────────────────────────────────────────
  // Acepta una fecha string O un array de fechas (sirve para individual y mensual)
  verificarSuperposicionHoraria: async (id_usuario, horario, fechas) => {
    if (!fechas || (Array.isArray(fechas) && fechas.length === 0)) return [];

    const listaFechas = Array.isArray(fechas) ? fechas : [fechas];
    const placeholders = listaFechas.map(() => '?').join(', ');

    const query = `
      SELECT r.id_reserva, r.fecha_clase, c.horario
      FROM reservas r
      JOIN clases c ON r.id_clase = c.id_clase
      WHERE r.id_usuario = ?
        AND r.estado = 'reservada'
        AND c.horario = ?
        AND r.fecha_clase IN (${placeholders})
    `;
    const [rows] = await db.promise().query(query, [id_usuario, horario, ...listaFechas]);
    return rows;
  },

  // ─── INSTANCIAS ───────────────────────────────────────────────
  obtenerInstanciaPorFecha: async (id_clase, fechaExactaStr) => {
    const [rows] = await db.promise().execute(
      'SELECT * FROM instancias_clases WHERE id_clase = ? AND fecha_exacta = ?',
      [id_clase, fechaExactaStr]
    );
    return rows[0] || null;
  },

  crearInstanciaClase: async (id_clase, fechaExactaStr) => {
    const [result] = await db.promise().execute(
      'INSERT INTO instancias_clases (id_clase, fecha_exacta) VALUES (?, ?)',
      [id_clase, fechaExactaStr]
    );
    return result.insertId;
  },

  contarReservasDeInstancia: async (id_instancia) => {
    const [rows] = await db.promise().execute(
      "SELECT COUNT(*) as total FROM reservas WHERE id_instancia = ? AND estado IN ('reservada', 'por_renovar')",
      [id_instancia]
    );
    return rows[0].total;
  },

  // ─── LISTA DE ESPERA ─────────────────────────────────────────
  verificarYaEnListaEspera: async (id_usuario, id_clase, tipo_reserva) => {
    const [rows] = await db.promise().execute(
      "SELECT id_lista FROM lista_espera WHERE id_usuario = ? AND id_clase = ? AND tipo_reserva = ? AND estado = 'esperando'",
      [id_usuario, id_clase, tipo_reserva]
    );
    return rows.length > 0;
  },

  obtenerUltimaPosicionListaEspera: async (id_clase, tipo_reserva) => {
    const [rows] = await db.promise().execute(
      "SELECT COUNT(*) as total FROM lista_espera WHERE id_clase = ? AND tipo_reserva = ? AND estado = 'esperando'",
      [id_clase, tipo_reserva]
    );
    return rows[0].total;
  },

  insertarEnListaEspera: async (id_usuario, id_clase, posicion, tipo_reserva) => {
    const [result] = await db.promise().execute(
      "INSERT INTO lista_espera (id_usuario, id_clase, posicion, estado, tipo_reserva) VALUES (?, ?, ?, 'esperando', ?)",
      [id_usuario, id_clase, posicion, tipo_reserva]
    );
    return result.insertId;
  },

  // ─── RESERVAS ─────────────────────────────────────────────────
  insertarReserva: async (id_usuario, id_clase, id_instancia, estado, tipo_reserva, tipo_pago, fecha_clase, saldo_pendiente = 0) => {
    const [result] = await db.promise().execute(
      `INSERT INTO reservas
         (id_usuario, id_clase, id_instancia, estado, tipo_reserva, tipo_pago, saldo_pendiente, fecha_clase)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, id_clase, id_instancia, estado, tipo_reserva, tipo_pago, saldo_pendiente, fecha_clase]
    );
    return result.insertId;
  },

  // ─── PAGOS ────────────────────────────────────────────────────
  insertarPago: async (id_usuario, monto, estado, metodo, tipo) => {
    const [result] = await db.promise().execute(
      'INSERT INTO pagos (id_usuario, monto, estado, metodo, tipo) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, monto, estado, metodo, tipo]
    );
    return result.insertId;
  },

  // ─── HISTORIAL ────────────────────────────────────────────────
  getReservasPorUsuario: async (id_usuario) => {
  const [rows] = await db.promise().execute(
  `SELECT r.id_reserva, r.id_usuario, r.id_clase, r.id_instancia, r.tipo_reserva, 
          r.estado, r.tipo_pago, r.saldo_pendiente, r.fecha_reserva, r.fecha_clase,
          c.actividad, c.dia, c.horario, c.duracion, c.imagen, c.precio_individual,
          CONCAT(u.nombre, ' ', u.apellido) AS nombre_profesor,
          s.nombre AS nombre_sala
  FROM reservas r
  JOIN clases c ON r.id_clase = c.id_clase
  LEFT JOIN usuarios u ON c.id_profesor = u.id_usuario
  LEFT JOIN salas s ON c.id_sala = s.id_sala
  WHERE r.id_usuario = ?
  ORDER BY r.fecha_clase DESC`,
  [id_usuario]
);
  return rows;
  },
};

module.exports = reservasRepository;