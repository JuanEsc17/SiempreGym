const pool = require('../src/db');

async function buscarPorId(id_usuario) {
    const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario]
    );
    return rows[0] || null;
}

module.exports = { buscarPorId };