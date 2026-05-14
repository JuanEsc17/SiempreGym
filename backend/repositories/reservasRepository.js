// reservas.repository.js
const pool = require('../src/db');//db

async function buscarClasePorId(id_clase) {
    const [rows] = await pool.query(
    'SELECT * FROM clases WHERE id_clase = ?', [id_clase]
    );
    return rows[0] || null;
}

async function buscarClientePorId(id_usuario) {
    const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario]
    );
    return rows[0] || null;
}

async function buscarReservasDeCliente(id_usuario) {
    const [rows] = await pool.query(
        `SELECT r.*, c.fecha_hora_inicio, c.duracion
        FROM reservas r
        JOIN clases c ON r.id_clase = c.id_clase
        WHERE r.id_usuario = ? AND r.estado = 'CONFIRMADA'`,
        [id_usuario]
    );
    return rows;
}

async function insertarReserva(connection, id_usuario, id_clase, estado, tipo_pago, monto, saldo) {
    const [result] = await connection.query(
        `INSERT INTO reservas (id_usuario, id_clase, estado, tipo_pago, monto_pagado, saldo_pendiente)
        VALUES (?, ?, ?, ?, ?, ?)`,
    [id_usuario, id_clase, estado, tipo_pago, monto, saldo]
    );
    return result.insertId;
}

async function actualizarCupos(connection, id_clase) {
    await connection.query(
    'UPDATE clases SET cupos_disponibles = cupos_disponibles - 1 WHERE id_clase = ?',
    [id_clase]
    );
}

async function descontarCredito(connection, id_usuario) {
    await connection.query(
        'UPDATE usuarios SET creditos = creditos - 1 WHERE id_usuario = ?',
        [id_usuario]
    );
}

async function getReservasPorUsuario(id_usuario) {
    const [rows] = await pool.query(
        `SELECT r.*, c.actividad, c.dia, c.horario, c.duracion
        FROM reservas r
        JOIN clases c ON r.id_clase = c.id_clase
        WHERE r.id_usuario = ?
        ORDER BY r.fecha_reserva DESC`,
        [ id_usuario]
    );
    return rows;
}

module.exports = {
    buscarClasePorId,
    buscarClientePorId,
    buscarReservasDeCliente,
    insertarReserva,
    actualizarCupos,
    descontarCredito,
    getReservasPorUsuario
};