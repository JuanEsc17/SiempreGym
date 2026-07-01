const serviceMensual    = require('../src/services/reservaMensualService');
const serviceIndividual = require('../src/services/reservaIndividualService');
const reservasRepository = require('../repositories/reservasRepository');
const listaEsperaMensualService = require('../src/services/listaEsperaMensualService');
// cambio marian
const UsuariosRepository = require('../repositories/usuariosRepository');
const db = require('../src/db');
const reservaIndividualService = require('../src/services/reservaIndividualService');
const cancelacionMensualidadService = require('../src/services/cancelacionMensualidadService');
const { sendDevolucionSena } = require('../src/services/emailService');

const userRepo = new UsuariosRepository(db);
// fin cambio marian

class ReservasController {

  // ============================================================
  // FLUJO MENSUAL
  // ============================================================

  async verificarReservaMensual(req, res) {
    try {
      // FIX: ahora lee mes + anio del body (lo que manda el frontend)
      const { id_clase, id_usuario, mes, anio, esPresencial, fecha_inicio } = req.body;


      if (!id_clase || !id_usuario || !mes || !anio) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Campos obligatorios: id_clase, id_usuario, mes, anio.'
        });
      }

      // cambio marian: para q menores con permisos no autorizados no puedan reservar 
      const usuario = await userRepo.buscarPorId(id_usuario);

      if (!usuario) {
        return res.status(404).json({
          ok: false,
          mensaje: `Usuario no encontrado (ID enviado: ${id_usuario})`
        });
      }

      if (usuario.estado_permiso === 'pendiente') {
          return res.status(403).json({
          ok: false,
          mensaje: "Debes esperar la aprobación del permiso para reservar"
        });
      }

      if (usuario.estado_permiso === 'rechazado') {
          return res.status(403).json({
          ok: false,
          mensaje: "Tu permiso fue rechazado"
        });
      }
      // fin cambio marian

      // FIX: llamada correcta al service — pasa mes y anio (no clasesRepo)
      const resultado = await serviceMensual.verificarYPresupuestarMensual(
      id_usuario, id_clase, parseInt(mes), parseInt(anio), esPresencial, fecha_inicio
      );

      if (resultado.status === 'YA_EN_LISTA_ESPERA') {
        return res.status(200).json({
          ok: true,
          status: 'YA_EN_LISTA_ESPERA',
          mensaje: resultado.mensaje
        });
      }

      if (resultado.status === 'SIN_CUPO_DISPONIBLE') {
        return res.status(200).json({
          ok: true,
          status: 'OFRECER_LISTA_ESPERA_MENSUAL',
          fechas_sin_cupo: resultado.fechas_sin_cupo || [],
          mensaje: resultado.mensaje
        });
      }

      return res.status(200).json({
        ok: true,
        status: 'LISTO_PARA_PAGAR',
        monto: resultado.monto,
        fechas: resultado.fechas,                          // el frontend guarda esto para el POST de crear
        clasesRestantes: resultado.clasesRestantesCount,
        mensaje: `${resultado.clasesRestantesCount} clase${resultado.clasesRestantesCount !== 1 ? 's' : ''} disponibles. Total: $${resultado.monto.toFixed(2)}`
      });

    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  // Registrar todas las reservas del mes (se llama después del pago en MP)
  async crearReservaMensual(req, res) {
    try {
      const { id_usuario, id_clase, fechas, monto_total } = req.body;

      if (!id_usuario || !id_clase || !fechas || !Array.isArray(fechas) || fechas.length === 0 || monto_total == null) { // cambié !monto_total por monto_total == null porq sino no tomaba el 0
        return res.status(400).json({
          ok: false,
          mensaje: 'Campos obligatorios: id_usuario, id_clase, fechas (array), monto_total.'
        });
      }

      // FIX: nombre correcto del método (antes llamaba a 'crearReserva' que no existía)
      const resultado = await serviceMensual.crearReservaMensual(
        id_usuario, id_clase, fechas, parseFloat(monto_total)
      );

      return res.status(200).json({
        ok: true,
        mensaje: `¡Reserva mensual confirmada! Se registraron ${resultado.reservasCreadas} clases exitosamente.`
      });

    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  // cambio marian: método para reserva mensual presencial
  async crearReservaMensualPresencial(req,res){
    try{
      const {
        id_usuario,
        id_clase,
        fechas,
        monto_total
      }=req.body;

      const resultado=await serviceMensual.crearReservaMensualPresencial(id_usuario,id_clase,fechas,parseFloat(monto_total));

      return res.status(200).json({
        ok:true,
        mensaje:`Reserva mensual presencial creada`
      }); 

    } catch(error){

        return res.status(500).json({
          ok:false,
          mensaje:error.message
        });
      }
  } // fin cambio marian

  async confirmarListaEsperaMensual(req, res) {
    try {
      const { id_clase, id_usuario } = req.body;
      if (!id_clase || !id_usuario) {
        return res.status(400).json({ ok: false, mensaje: 'id_clase e id_usuario son obligatorios.' });
      }
      const resultado = await serviceMensual.ingresarListaEsperaMensual(id_usuario, id_clase);
      return res.status(201).json({ ok: true, status: 'EXITO_LISTA_ESPERA', mensaje: resultado.mensaje });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  // ============================================================
  // FLUJO INDIVIDUAL
  // ============================================================

  async verificarIndividual(req, res) {
    try {
      // FIX: ya no exige tipo_pago — el usuario todavía no eligió cómo pagar.
      // Devuelve precio_base, precio_sena y puede_usar_sena para que el front maneje las opciones.
      const { id_usuario, id_clase, fecha_clase } = req.body;

      if (!id_usuario || !id_clase || !fecha_clase) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Campos obligatorios: id_usuario, id_clase, fecha_clase.'
        });
      }

      // cambio marian: para que menores con permisos no autorizados no puedan reservar
      const usuario = await userRepo.buscarPorId(id_usuario);

      if (!usuario) {
        return res.status(404).json({
          ok: false,
          mensaje: `Usuario no encontrado (ID enviado: ${id_usuario})`
        });
      }

      if (usuario.estado_permiso === 'pendiente') {
          return res.status(403).json({
          ok: false,
          mensaje: "Debes esperar la aprobación del permiso para reservar"
        });
      }

      if (usuario.estado_permiso === 'rechazado') {
          return res.status(403).json({
          ok: false,
          mensaje: "Tu permiso fue rechazado"
        });
      }
      // fin cambio marian

      const resultado = await serviceIndividual.verificarYPresupuestarIndividual(
        id_usuario, id_clase, fecha_clase
      );

      if (resultado.status === 'CLASE_LLENA') {
        return res.status(200).json({
      ok: true,
      status: 'CLASE_LLENA',
      mensaje: resultado.mensaje
      });
    }

      return res.status(200).json({
        ok: true,
        status: 'LISTO_PARA_RESERVAR',
        id_instancia:      resultado.id_instancia,
        monto:             resultado.precio_base,
        precio_sena:       resultado.precio_sena,
        puede_usar_sena:   resultado.puede_usar_sena,
        creditos_usuario:  resultado.creditos_usuario,
        mensaje:           resultado.mensaje
      });

    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  // Crear reserva individual (post-pago en MP )
  async confirmarReservaIndividual(req, res) {
    try {
      const { id_usuario, id_clase, id_instancia, fecha_clase, tipo_pago, precio_total } = req.body;

      if (!id_usuario || !id_clase || !id_instancia || !fecha_clase || !tipo_pago) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Campos obligatorios: id_usuario, id_clase, id_instancia, fecha_clase, tipo_pago.'
        });
      }

      const resultado = await serviceIndividual.crearReservaIndividual(
        id_usuario, id_clase, id_instancia, fecha_clase, tipo_pago, parseFloat(precio_total || 0)
      );

      let mensajeFinal = '¡Reserva confirmada exitosamente!';
      if (resultado.saldoPendiente > 0) {
        mensajeFinal = '¡Seña abonada! Recordá pagar el saldo restante presencialmente el día de la clase.';
      } else if (tipo_pago === 'CREDITO') {
        mensajeFinal = resultado.mensaje;
      }

      return res.status(200).json({ ok: true, mensaje: mensajeFinal, ...resultado });

    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  async completarPago(req, res) {

    try {

      const { id_reserva } = req.body;

      if (!id_reserva) {
        return res.status(400).json({
          ok: false,
          mensaje: 'id_reserva es obligatorio'
        });
      }

      const resultado = await serviceIndividual.completarPagoReserva(id_reserva);

      return res.status(200).json({
        ok: true,
        mensaje: 'Pago completado correctamente',
        ...resultado
      });

    } catch (error) {

      return res.status(500).json({
        ok: false,
        mensaje: error.message
      });

    }
  }

  async registrarPagoEfectivo(req, res) {
    try {
      const { id_reserva } = req.body;

      if (!id_reserva) {
        return res.status(400).json({
          ok: false,
          mensaje: 'id_reserva es obligatorio'
        });
      }

      const resultado = await serviceIndividual.registrarPagoEfectivoReserva(id_reserva);

      return res.status(200).json({
        ok: true,
        mensaje: 'Pago en efectivo registrado correctamente',
        ...resultado
      });
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  // individual presencial
  async crearReservaIndividualPresencial (req, res) {
  try {
    const {
      id_usuario,
      id_clase,
      id_instancia,
      fecha_clase,
      monto_total
    } = req.body;

    const resultado = await reservaIndividualService.crearReservaIndividualPresencial(
      id_usuario,
      id_clase,
      id_instancia,
      fecha_clase,
      monto_total
    );

    res.status(201).json({
      ok: true,
      mensaje: "Reserva creada correctamente",
      ...resultado
    });

  } catch (error) {
    console.error(error);

    res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
}

  // ============================================================
  // HISTORIAL
  // ============================================================
  async getMisReservas(req, res) {
    try {
      const reservas = await reservasRepository.getReservasPorUsuario(req.params.id);
      res.json({ ok: true, data: reservas });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  // ============================================================
  // CANCELACIÓN DE RESERVAS
  // ============================================================
  async cancelarReserva(req, res) {
    try {
      const { id_reserva } = req.params;
      const id_usuario = req.body?.id_usuario;

      if (!id_reserva || !id_usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: 'id_reserva e id_usuario son obligatorios.'
        });
      }

      // 1. Obtener detalles de la reserva
      const reserva = await reservasRepository.obtenerReservaPorId(id_reserva);
      
      if (!reserva) {
        return res.status(404).json({
          ok: false,
          mensaje: 'No hay clases reservadas'
        });
      }

      // Validar que el usuario sea el dueño de la reserva
      if (reserva.id_usuario !== id_usuario) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para cancelar esta reserva.'
        });
      }

      // Validar que no esté ya cancelada o completada
      if (reserva.estado !== 'reservada' && reserva.estado !== 'pendiente') {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se puede cancelar esta reserva (ya fue completada o cancelada).'
        });
      }

      // 3. Validar plazo según tipo de reserva
      const ahora = new Date();
      const fechaClase = new Date(reserva.fecha_clase);
      const horasRestantes = (fechaClase - ahora) / (1000 * 60 * 60);
      
      let acreditarCredito = false;
      let montoDevolucion = 0;
      let tipoDevolucion = '';
      let reservasACancelar = [];

      // CASO 1: RESERVA MENSUAL — Cancelar TODAS las clases del mes
      if (reserva.tipo_reserva === 'mensual') {
        reservasACancelar = await reservasRepository.obtenerReservasDelMes(
          id_usuario, 
          reserva.id_clase, 
          id_reserva
        );

        // Mensual: debe ser > 48 horas (validamos la primera)
        if (horasRestantes > 48) {
          acreditarCredito = true;
        }
      } 
      // CASO 2: RESERVA INDIVIDUAL
      else if (reserva.tipo_reserva === 'individual') {
        reservasACancelar = [id_reserva]; // Solo esta

        // Individual: debe ser > 24 horas
        if (horasRestantes > 24) {
          acreditarCredito = true;
        }

        // Manejar devoluciones según tipo de pago
        if (reserva.tipo_pago === 'seña' && horasRestantes > 24) {
          montoDevolucion = parseFloat(reserva.saldo_pendiente) || parseFloat(reserva.precio_individual) / 2 || 0;
          console.log('[CANCELAR] Seña - monto devolución:', montoDevolucion, 'saldo_pendiente:', reserva.saldo_pendiente, 'precio_individual:', reserva.precio_individual);
          tipoDevolucion = 'seña';
        }
      }

      // marian
      // Siempre cancelar solamente ESTA reserva
      await reservasRepository.cancelarReserva(id_reserva);

      // Si era mensual, verificar si ahora puede entrar alguien
      if (reserva.tipo_reserva === 'mensual') {
      await listaEsperaMensualService.procesarVacanteMensual(
      reserva.id_clase,
      reserva.fecha_clase
      );
      }
      //fin marian
      // 6. Procesar créditos y devoluciones
      let creditosAcreditados = 0;

      if (reserva.tipo_reserva === 'mensual' && acreditarCredito) {
        // Acreditar 1 crédito por CADA clase cancelada del mes
          creditosAcreditados = 1;
          await reservasRepository.agregarCredito(id_usuario, 1);
      } else if (reserva.tipo_reserva === 'individual') {
        if (reserva.tipo_pago === 'credito' && acreditarCredito) {
          creditosAcreditados = 1;
          await reservasRepository.agregarCredito(id_usuario, 1);
        } else if (reserva.tipo_pago === 'total' && acreditarCredito) {
          creditosAcreditados = 1;
          await reservasRepository.agregarCredito(id_usuario, 1);
        } else if (reserva.tipo_pago === 'seña' && horasRestantes > 24) {
          console.log('[CANCELAR] Registrando devolución de $' + montoDevolucion);
          await reservasRepository.registrarDevolucion(id_usuario, montoDevolucion, 'seña');
          try {
            const usuario = await userRepo.buscarPorId(id_usuario);
            console.log('[CANCELAR] Usuario para email:', usuario?.email);
            if (usuario && usuario.email) {
              const fechaStr = reserva.fecha_clase instanceof Date
                ? reserva.fecha_clase.toISOString().split('T')[0]
                : String(reserva.fecha_clase).split('T')[0];
              const emailSent = await sendDevolucionSena(
                usuario.email,
                `${usuario.nombre} ${usuario.apellido}`,
                reserva.actividad,
                fechaStr,
                montoDevolucion
              );
              console.log('[CANCELAR] Email enviado:', emailSent);
            } else {
              console.log('[CANCELAR] Usuario sin email, no se envía');
            }
          } catch (emailErr) {
            console.error('[CANCELAR] Error enviando email de devolución:', emailErr);
          }
        }
      }

      // 7. Responder
      let mensaje = '';
      if (reserva.tipo_reserva === 'mensual') {
        if (acreditarCredito) {
          mensaje = `Reserva mensual cancelada exitosamente. Se acreditaron ${creditosAcreditados} créditos en tu cuenta (una por cada clase del mes).`;
        } else {
          mensaje = `Reserva mensual cancelada exitosamente. No se acreditaron créditos por cancelación fuera de tiempo.`;
        }
      } else {
        if (tipoDevolucion) {
          mensaje = `Reserva cancelada exitosamente - Se devolverá ${tipoDevolucion}`;
        } else if (creditosAcreditados > 0) {
          mensaje = 'Reserva cancelada exitosamente - Se acreditó un crédito en tu cuenta';
        } else {
          mensaje = 'Reserva cancelada exitosamente';
        }
      }

      return res.status(200).json({
        ok: true,
        mensaje: mensaje,
        acreditoODevolucion: acreditarCredito || montoDevolucion > 0,
        creditosAcreditados: creditosAcreditados,
        reservasCanceladas: 1
      });

    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      return res.status(500).json({
        ok: false,
        mensaje: error.message
      });
    }
  }
  // ============================================================
  // CANCELACIÓN DE MENSUALIDAD
  // ============================================================
  async cancelarMensualidad(req, res) {
    try {
      const { id_usuario, id_clase } = req.body;

      if (!id_usuario || !id_clase) {
        return res.status(400).json({
          ok: false,
          mensaje: 'id_usuario e id_clase son obligatorios.'
        });
      }

      const resultado = await cancelacionMensualidadService.cancelarMensualidad(
        id_usuario, id_clase
      );

      return res.status(200).json({
        ok: true,
        mensaje: `Mensualidad cancelada exitosamente. Se acreditaron ${resultado.creditosAcreditados} créditos en tu cuenta.`,
        reservasCanceladas: resultado.reservasCanceladas,
        creditosAcreditados: resultado.creditosAcreditados
      });

    } catch (error) {
      return res.status(400).json({
        ok: false,
        mensaje: error.message
      });
    }
  }
}

module.exports = ReservasController;