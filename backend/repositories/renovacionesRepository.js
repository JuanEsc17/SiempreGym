const db = require('../src/db');

const renovacionesRepository = {

  // ─── CREAR ────────────────────────────────────────────────────
  crearRenovacion: async (id_usuario, id_clase, mes, anio) => {
    const fecha_vencimiento = `${anio}-${String(mes).padStart(2, '0')}-10`;

    const [result] = await db.promise().execute(
      `INSERT INTO renovaciones 
         (id_usuario, id_clase, mes, anio, estado, fecha_vencimiento)
       VALUES (?, ?, ?, ?, 'pendiente', ?)`,
      [id_usuario, id_clase, mes, anio, fecha_vencimiento]
    );
    return result.insertId;
  },

  // ─── VERIFICAR SI YA EXISTE ───────────────────────────────────
  // Evita crear duplicados si el usuario ya tiene renovación para ese mes/clase
  existeRenovacion: async (id_usuario, id_clase, mes, anio) => {
    const [rows] = await db.promise().execute(
      `SELECT id_renovacion FROM renovaciones 
       WHERE id_usuario = ? AND id_clase = ? AND mes = ? AND anio = ?
       AND estado = 'pendiente'`,
      [id_usuario, id_clase, mes, anio]
    );
    return rows.length > 0;
  },

  // ─── OBTENER RENOVACIONES PENDIENTES DEL USUARIO ─────────────
  // Devuelve todo lo necesario para mostrar la pantalla de renovación
  obtenerRenovacionesPendientes: async (id_usuario) => {
    const [rows] = await db.promise().execute(
      `SELECT 
         r.id_renovacion,
         r.mes,
         r.anio,
         r.fecha_vencimiento,
         r.estado,
         c.id_clase,
         c.actividad,
         c.dia,
         c.horario,
         c.precio_individual,
         CONCAT(u.nombre, ' ', u.apellido) AS nombre_profesor
       FROM renovaciones r
       JOIN clases c ON r.id_clase = c.id_clase
       LEFT JOIN usuarios u ON c.id_profesor = u.id_usuario
       WHERE r.id_usuario = ? AND r.estado = 'pendiente'
       ORDER BY r.anio ASC, r.mes ASC`,
      [id_usuario]
    );
    return rows;
  },

  // ─── OBTENER UNA RENOVACIÓN POR ID ───────────────────────────
  obtenerRenovacionPorId: async (id_renovacion) => {
    const [rows] = await db.promise().execute(
      `SELECT r.*, c.dia, c.horario, c.precio_individual, c.actividad
       FROM renovaciones r
       JOIN clases c ON r.id_clase = c.id_clase
       WHERE r.id_renovacion = ?`,
      [id_renovacion]
    );
    return rows[0] || null;
  },

  // ─── CONFIRMAR RENOVACIÓN (post-pago) ────────────────────────
  confirmarRenovacion: async (id_renovacion) => {
    await db.promise().execute(
      `UPDATE renovaciones SET estado = 'confirmada' 
       WHERE id_renovacion = ?`,
      [id_renovacion]
    );
  },

  // ─── CRON: obtener vencidas ───────────────────────────────────
  obtenerRenovacionesVencidas: async () => {
    const [rows] = await db.promise().execute(
      `SELECT id_renovacion FROM renovaciones
       WHERE estado = 'pendiente' 
       AND fecha_vencimiento < CURDATE()`
    );
    return rows;
  },

  // ─── CRON: marcar como vencidas ──────────────────────────────
  marcarComoVencidas: async (ids) => {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(', ');
    await db.promise().execute(
      `UPDATE renovaciones SET estado = 'vencida'
       WHERE id_renovacion IN (${placeholders})`,
      ids
    );
  },

};

module.exports = renovacionesRepository;