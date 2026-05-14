const pool = require('../db');//db
const ReservasRepo = require('../../repositories/reservasRepository');

function claseYaIniciada(clase) {
    return new Date(clase.fecha_hora_inicio) <= new Date();
}

function haySuperposicion(reservasExistentes, claseNueva) {
    const inicioNueva = new Date(claseNueva.fecha_hora_inicio);
    const finNueva = new Date(inicioNueva.getTime() + claseNueva.duracion * 60000);
    return reservasExistentes.some(reserva => {
    const inicioExistente = new Date(reserva.fecha_hora_inicio);
    const finExistente = new Date(inicioExistente.getTime() + reserva.duracion * 60000);
    return inicioNueva < finExistente && finNueva > inicioExistente;
    });
}

function esMismoDia(fecha1, fecha2) {
    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);
    return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function clientePuedeReservarConPlan(cliente) {
    if (!cliente.fecha_vencimiento_plan) return { puede: false, aviso: false };
    const hoy = new Date();
    const vencimiento = new Date(cliente.fecha_vencimiento_plan);
    if (vencimiento >= hoy) return { puede: true, aviso: false };
    const dia = hoy.getDate();
    if (dia <= 10) return { puede: true, aviso: true };
    return { puede: false, aviso: false };
}

async function crearReserva(id_usuario, id_clase, tipo_pago) {
    const clase = await ReservasRepo.buscarClasePorId(id_clase);
    const cliente = await ReservasRepo.buscarClientePorId(id_usuario);

    if (!clase) throw { status: 404, mensaje: 'Clase no encontrada' };
    if (!cliente) throw { status: 404, mensaje: 'Cliente no encontrado' };

    if (claseYaIniciada(clase)) throw { status: 400, mensaje: 'No es posible reservar una clase ya iniciada' };
    if (clase.cupos_disponibles <= 0) throw { status: 400, mensaje: 'No hay cupos disponibles' };

    const reservasCliente = await ReservasRepo.buscarReservasDeCliente(id_usuario);
    if (haySuperposicion(reservasCliente, clase)) throw { status: 400, mensaje: 'Ya tenés una actividad reservada para ese horario' };

    if    (tipo_pago === 'CREDITO') {
        if (cliente.creditos <= 0) throw { status: 400, mensaje: 'No tenés créditos disponibles' };
    return await confirmarReserva(cliente, clase, 'CONFIRMADA', 'CREDITO', 0, 0);
    }

    if (cliente.tipo_plan === 'mensual') {
        const { puede, aviso } = clientePuedeReservarConPlan(cliente);
        if (!puede) throw { status: 400, mensaje: 'Debés regularizar el pago de tu plan para reservar' };
        return await confirmarReserva(cliente, clase, 'CONFIRMADA', 'PLAN', 0, 0, aviso);
    }

    if (cliente.tipo_plan === 'individual' || cliente.tipo_plan === 'ninguno') {
        if (!tipo_pago || !['TOTAL', 'SEÑA'].includes(tipo_pago)) {
        throw { status: 400, mensaje: 'Debés elegir una forma de pago: TOTAL o SEÑA' };
    }
    if (tipo_pago === 'SEÑA' && esMismoDia(clase.fecha_hora_inicio, new Date())) {
        throw { status: 400, mensaje: 'No es posible reservar con seña el mismo día de la clase' };
    }
    const monto = tipo_pago === 'TOTAL' ? clase.precio : clase.precio / 2;
    const saldo = tipo_pago === 'TOTAL' ? 0 : clase.precio / 2;
    return await confirmarReserva(cliente, clase, 'PENDIENTE_PAGO', tipo_pago, monto, saldo);
    }
}

async function confirmarReserva(cliente, clase, estado, tipo_pago, monto_pagado, saldo_pendiente, aviso = false) {
    const connection = await pool.getConnection();
    try {
    await connection.beginTransaction();
    //ser realiza la reserva
    const reserva_id = await ReservasRepo.insertarReserva(
        connection, cliente.id_usuario, clase.id_clase,
        estado, tipo_pago, monto_pagado, saldo_pendiente
    );
    //actualiza los cupos disponibles de la clase
    await ReservasRepo.actualizarCupos(connection, clase.id_clase);
    //si se paga con crédito, se descuenta un crédito del cliente
    if (tipo_pago === 'CREDITO') {
        await ReservasRepo.descontarCredito(connection, cliente.id_usuario);
    }

    await connection.commit();

    return {
        reserva_id,
        clase: clase.actividad,
        horario: clase.fecha_hora_inicio,
        estado,
        monto_pagado,
        saldo_pendiente: saldo_pendiente > 0 ? `Debés $${saldo_pendiente} el día de la clase` : null,
        aviso
    };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
    connection.release();
    }
}

async function getMisReservas(id_usuario) {
  return await ReservasRepo.getReservasPorUsuario(id_usuario);
}

module.exports = { crearReserva, getMisReservas };