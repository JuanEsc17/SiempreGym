const db = require('../db');
const reservasRepository = require('../../repositories/reservasRepository');
const ClasesRepository = require('../../repositories/clasesRepository');
const { sendPagoConfirmado } = require('./emailService');// mail de pago
const reservaIndividualService = {

  // ─── PASO A: Verificar disponibilidad ────────────────────────
  // FIX: ya no pide tipo_pago — el usuario todavía no eligió cómo pagar.
  // Devuelve precios y si puede usar seña (para que el front habilite/deshabilite opciones).
  verificarYPresupuestarIndividual: async (id_usuario, id_clase, fecha_clase_str) => {
    const clasesRepo = new ClasesRepository(db);

    const clase = await clasesRepo.obtenerClasePorId(id_clase);
    if (!clase) throw new Error('La clase seleccionada no existe.');
    if (clase.estado === 'cancelada') throw new Error('Esta clase se encuentra cancelada.');

    const [userRows] = await db.promise().execute(
      'SELECT creditos FROM usuarios WHERE id_usuario = ?', [id_usuario]
    );
    if (userRows.length === 0) throw new Error('El usuario especificado no existe.');
    const creditosDisponibles = userRows[0].creditos || 0;
  
    // Escenario 10: clase ya iniciada o pasada
    const ahora = new Date();
    const [horas, minutos] = clase.horario.split(':');
    const fechaClaseObj = new Date(`${fecha_clase_str}T${horas}:${minutos}:00`);
    if (ahora >= fechaClaseObj) {
      throw new Error('No es posible reservar una clase ya iniciada o pasada.');
    }

    // Escenario 7: superposición horaria (PRIMERO - mensaje más específico)
    const superposiciones = await reservasRepository.verificarSuperposicionHoraria(
    id_usuario, clase.horario, fecha_clase_str
    );
    if (superposiciones.length > 0) {
    const detalle = superposiciones
      .map(s => `• ${s.fecha_clase.toISOString().split('T')[0]} - ${s.actividad}`)
      .join('\n');
    throw new Error(`Ya contás con una actividad reservada en ese horario:\n${detalle}`);
  }

    // Obtener o crear la instancia para esa fecha exacta
    const fechaExactaStr = `${fecha_clase_str} ${clase.horario}`;
    let instancia = await reservasRepository.obtenerInstanciaPorFecha(id_clase, fechaExactaStr);
    if (!instancia) {
      const nuevoId = await reservasRepository.crearInstanciaClase(id_clase, fechaExactaStr);
      instancia = { id_instancia: nuevoId };
    }

    // Escenario 4: sin cupo → ofrecer lista de espera
    const inscriptosActuales = await reservasRepository.contarReservasDeInstancia(instancia.id_instancia);
    if (inscriptosActuales >= clase.cupo_maximo) {
        return {
    status: 'CLASE_LLENA',
    mensaje: 'No hay cupos disponibles para esta fecha.'
    };
  }

    // Escenario 9: seña no disponible si es el mismo día de la clase
    const fechaHoyStr = ahora.toISOString().slice(0, 10);
    const puedeUsarSena = fechaHoyStr !== fecha_clase_str;

    const precioBase = parseFloat(clase.precio_individual);

    return {
      status: 'DISPONIBILIDAD_OK',
      id_instancia: instancia.id_instancia,
      precio_base: precioBase,
      precio_sena: precioBase / 2,
      puede_usar_sena: puedeUsarSena,
      creditos_usuario: creditosDisponibles,
      mensaje: 'Disponibilidad confirmada.'
    };
  },

  // ─── PASO B: Crear la reserva (post-pago o crédito directo) ──
  crearReservaIndividual: async (id_usuario, id_clase, id_instancia, fecha_clase_str, tipo_pago, monto_pagado) => {
    const clasesRepo = new ClasesRepository(db);
    const clase = await clasesRepo.obtenerClasePorId(id_clase);
    if (!clase) throw new Error('La clase seleccionada no existe.');

    // Re-verificamos cupo al momento de confirmar (otro usuario pudo haberlo tomado)
    const inscriptosActuales = await reservasRepository.contarReservasDeInstancia(id_instancia);
    if (inscriptosActuales >= clase.cupo_maximo) {
      throw new Error('El cupo se llenó mientras procesabas el pago. No se pudo confirmar la reserva.');
    }

    // Escenario 3: pago con crédito — descuento directo, sin pasarela
    if (tipo_pago === 'CREDITO') {
      const [userRows] = await db.promise().execute(
        'SELECT creditos FROM usuarios WHERE id_usuario = ?', [id_usuario]
      );
      if (!userRows[0] || userRows[0].creditos < 1) {
        throw new Error('No contás con créditos disponibles.');
      }
      await db.promise().execute(
        'UPDATE usuarios SET creditos = creditos - 1 WHERE id_usuario = ? AND creditos > 0',
        [id_usuario]
      );
      // FIX: tipo_pago = 'credito' (columna acepta 'membresia' | 'credito')
      const id_reserva = await reservasRepository.insertarReserva(
        id_usuario, id_clase, id_instancia, 'reservada', 'individual', 'credito', fecha_clase_str
      );
      return { success: true, id_reserva, mensaje: 'Reserva confirmada con tus créditos.' };
    }

    // Escenarios 1 y 2: pago total o seña vía Mercado Pago
    // FIX: tipo_pago en reservas = NULL para pagos con tarjeta (no es 'membresia' ni 'credito')
    await reservasRepository.insertarPago(id_usuario, monto_pagado, 'pagado', 'tarjeta', 'individual');
    const [usuarioRows] = await db.promise().execute(
      `
      SELECT nombre, apellido, email
      FROM usuarios
      WHERE id_usuario = ?
      `,
      [id_usuario]
    );

    const usuario = usuarioRows[0];

    await sendPagoConfirmado(
      usuario.email,
      `${usuario.nombre} ${usuario.apellido}`,
      clase.actividad,
      fecha_clase_str,
      monto_pagado,
      tipo_pago && tipo_pago.toLowerCase() === 'sena' ? 'Pago de seña' : 'Reserva individual'
    );

    const esSeña = tipo_pago && tipo_pago.toLowerCase() === 'sena';
    
    // Si es seña, el saldo pendiente es lo que falta pagar (el otro 50%)
    // Si es pago total, no hay saldo pendiente
    const saldoPendiente = esSeña ? monto_pagado : 0;

    const tipoPagoReserva = esSeña
        ? 'seña'
        : 'total';

    const id_reserva =
      await reservasRepository.insertarReserva(
        id_usuario,
        id_clase,
        id_instancia,
        'reservada',
        'individual',
        tipoPagoReserva,
        fecha_clase_str,
        saldoPendiente
      );

    return { success: true, id_reserva, saldoPendiente };
  },
  completarPagoReserva: async (id_reserva) => {

    const [rows] = await db.promise().execute(
    `SELECT grupo_mensual_id
     FROM reservas
     WHERE id_reserva = ?`,
    [id_reserva]
  );

  const grupoId = rows[0]?.grupo_mensual_id;

  if (grupoId) {
    await db.promise().execute(
      `UPDATE reservas
       SET estado = 'reservada',
           tipo_pago = 'total',
           saldo_pendiente = 0
       WHERE grupo_mensual_id = ?`,
      [grupoId]
    );
  } else {
    await db.promise().execute(
      `UPDATE reservas
       SET estado = 'reservada',
           tipo_pago = 'total',
           saldo_pendiente = 0
       WHERE id_reserva = ?`,
      [id_reserva]
    );
  }

    return { success: true };
  },

  registrarPagoEfectivoReserva: async (id_reserva) => {
    const [rows] = await db.promise().execute(
      `
      SELECT r.id_usuario, r.tipo_pago, r.saldo_pendiente, r.fecha_clase,
             c.actividad, u.nombre, u.apellido, u.email
      FROM reservas r
      JOIN clases c ON r.id_clase = c.id_clase
      JOIN usuarios u ON r.id_usuario = u.id_usuario
      WHERE r.id_reserva = ?
      `,
      [id_reserva]
    );

    const reserva = rows[0];
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    if (reserva.tipo_pago !== 'seña' || !reserva.saldo_pendiente || reserva.saldo_pendiente <= 0) {
      throw new Error('No hay un pago pendiente en efectivo para esta reserva');
    }

    const monto = parseFloat(reserva.saldo_pendiente);

    await reservasRepository.insertarPago(
      reserva.id_usuario,
      monto,
      'pagado',
      'efectivo',
      'individual'
    );

    await db.promise().execute(
      `
      UPDATE reservas
      SET tipo_pago = 'total',
          saldo_pendiente = 0
      WHERE id_reserva = ?
      `,
      [id_reserva]
    );

    await sendPagoConfirmado(
      reserva.email,
      `${reserva.nombre} ${reserva.apellido}`,
      reserva.actividad,
      reserva.fecha_clase,
      monto,
      'Pago en efectivo'
    );

    return {
      success: true,
      cliente: `${reserva.nombre} ${reserva.apellido}`,
      fecha: reserva.fecha_clase,
      monto
    };
  },
};

module.exports = reservaIndividualService;