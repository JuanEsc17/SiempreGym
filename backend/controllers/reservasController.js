const serviceMensual    = require('../src/services/reservaMensualService');
const serviceIndividual = require('../src/services/reservaIndividualService');
const reservasRepository = require('../repositories/reservasRepository');
// cambio marian
const UsuariosRepository = require('../repositories/usuariosRepository');
const db = require('../src/db');

const userRepo = new UsuariosRepository(db);
// fin cambio marian

class ReservasController {

  // ============================================================
  // FLUJO MENSUAL
  // ============================================================

  async verificarReservaMensual(req, res) {
    try {
      // FIX: ahora lee mes + anio del body (lo que manda el frontend)
      const { id_clase, id_usuario, mes, anio, esPresencial } = req.body;

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
        id_usuario, id_clase, parseInt(mes), parseInt(anio), esPresencial
      );

      if (resultado.status === 'SIN_CUPO_DISPONIBLE') {
        return res.status(200).json({
          ok: true,
          status: 'OFRECER_LISTA_ESPERA_MENSUAL',
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

      if (resultado.status === 'SIN_CUPO_DISPONIBLE') {
        return res.status(200).json({
          ok: true,
          status: 'OFRECER_LISTA_ESPERA',
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

  async confirmarListaEsperaIndividual(req, res) {
    try {
      const { id_usuario, id_clase } = req.body;
      if (!id_usuario || !id_clase) {
        return res.status(400).json({ ok: false, mensaje: 'id_usuario e id_clase son obligatorios.' });
      }
      const resultado = await serviceIndividual.ingresarListaEsperaIndividual(id_usuario, id_clase);
      return res.status(201).json({ ok: true, mensaje: resultado.mensaje });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
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
}

module.exports = ReservasController;