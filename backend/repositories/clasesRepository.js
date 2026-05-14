const pool = require('../src/db');//db

async function getDisponibles() {
    const [rows] = await pool.query(`
        SELECT * FROM clases
        WHERE fecha_hora_inicio > NOW()
        AND cupos_disponibles > 0
        ORDER BY fecha_hora_inicio ASC
    `);
    return rows;
}

async function getPorDia(nombreDia) {
    const [rows] = await pool.query(
    `SELECT * FROM clases WHERE dia = ? AND estado = 'activa' AND cupos_disponibles > 0`,
    [nombreDia]
    );
    return rows;
}

module.exports = { getDisponibles, getPorDia };