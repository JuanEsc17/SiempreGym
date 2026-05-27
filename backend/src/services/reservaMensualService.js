const db = require('../db');
const ClasesRepository = require('../../repositories/clasesRepository');
const reservasRepository = require('../../repositories/reservasRepository');

// ─── Helper: fechas del mes para un día de semana dado ───────────
// Recibe el nombre del día ('lunes', 'martes'...), el mes (1-12) y el año.
// Devuelve un array de strings 'YYYY-MM-DD' con solo las fechas futuras del mes.
function calcularFechasDelMes(diaEnum, mes, anio) {
  const DIAS_MAP = { lunes:1, martes:2, miercoles:3, jueves:4, viernes:5, sabado:6 };
  const diaN = DIAS_MAP[diaEnum.toLowerCase()];
  if (diaN === undefined) throw new Error(`Día de clase inválido: ${diaEnum}`);

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const fechas = [];

  const d = new Date(anio, mes - 1, 1);
  // Avanzar hasta la primera ocurrencia del día buscado
  while (d.getDay() !== diaN) d.setDate(d.getDate() + 1);

  while (d.getMonth() === mes - 1) {
    if (d >= hoy) fechas.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 7);
  }
  return fechas;
}

const reservaMensualService = {

  // ─── PASO A: Verificar disponibilidad y calcular precio ──────
  // FIX: recibe mes + anio (no fechasArray) y los calcula internamente.
  // El controller solo pasa id_usuario, id_clase, mes, anio desde el body del request.
  verificarYPresupuestarMensual: async (id_usuario, id_clase, mes, anio) => {
    const clasesRepo = new ClasesRepository(db);

    const clase = await clasesRepo.obtenerClasePorId(id_clase);
    if (!clase) throw new Error('La clase seleccionada no existe.');
    if (clase.estado === 'cancelada') throw new Error('Esta clase se encuentra cancelada.');

    const [userRows] = await db.promise().execute(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [id_usuario]
    );
    if (userRows.length === 0) throw new Error('El usuario especificado no existe.');

    // Calcular las fechas restantes del mes para esta clase
    const fechasArray = calcularFechasDelMes(clase.dia, mes, anio);
    if (fechasArray.length === 0) {
      throw new Error('No quedan clases disponibles para este mes.');
    }

    // Escenario 5: superposición en cualquiera de las fechas
    const superposiciones = await reservasRepository.verificarSuperposicionHoraria(
      id_usuario, clase.horario, fechasArray
    );
    if (superposiciones.length > 0) {
      throw new Error('Ya contás con una reserva en ese horario para alguna de las fechas del mes.');
    }

    // Verificar cupo en CADA semana — si alguna está llena, ofrecer lista de espera
    for (const fecha_clase_str of fechasArray) {
      const fechaExactaStr = `${fecha_clase_str} ${clase.horario}`;
      let instancia = await reservasRepository.obtenerInstanciaPorFecha(id_clase, fechaExactaStr);
      if (!instancia) {
        const nuevoId = await reservasRepository.crearInstanciaClase(id_clase, fechaExactaStr);
        instancia = { id_instancia: nuevoId };
      }
      const inscriptos = await reservasRepository.contarReservasDeInstancia(instancia.id_instancia);
      if (inscriptos >= clase.cupo_maximo) {
        return {
          status: 'SIN_CUPO_DISPONIBLE',
          mensaje: 'No hay cupos para todo el mes. ¿Querés anotarte en la lista de espera mensual?'
        };
      }
    }

    // Precio proporcional: precio por clase × clases restantes del mes
    const monto = parseFloat(clase.precio_individual) * fechasArray.length;

    return {
      status: 'LISTO_PARA_RESERVAR_MES',
      monto,
      fechas: fechasArray,
      clasesRestantesCount: fechasArray.length
    };
  },

  // ─── PASO B: Crear todas las reservas del mes (post-pago) ────
  // FIX: nombre correcto del método (el controller llamaba a 'crearReserva' que no existía)
  crearReservaMensual: async (id_usuario, id_clase, fechasArray, monto_total) => {
    const clasesRepo = new ClasesRepository(db);
    const clase = await clasesRepo.obtenerClasePorId(id_clase);
    if (!clase) throw new Error('La clase seleccionada no existe.');

    const connection = await db.promise().getConnection();
    try {
      await connection.beginTransaction();

      // Un único pago para todo el mes
      await connection.execute(
        'INSERT INTO pagos (id_usuario, monto, estado, metodo, tipo) VALUES (?, ?, ?, ?, ?)',
        [id_usuario, monto_total, 'pagado', 'tarjeta', 'mensual']
      );

      // Una reserva por cada fecha del mes
      for (const fecha_clase_str of fechasArray) {
        const fechaExactaStr = `${fecha_clase_str} ${clase.horario}`;

        let instancia = await reservasRepository.obtenerInstanciaPorFecha(id_clase, fechaExactaStr);
        if (!instancia) {
          const [insResult] = await connection.execute(
            'INSERT INTO instancias_clases (id_clase, fecha_exacta) VALUES (?, ?)',
            [id_clase, fechaExactaStr]
          );
          instancia = { id_instancia: insResult.insertId };
        }

        // FIX: tipo_pago = NULL para pagos con tarjeta (enum solo acepta 'membresia'|'credito')
        await connection.execute(
          `INSERT INTO reservas
             (id_usuario, id_clase, id_instancia, estado, tipo_reserva, tipo_pago, fecha_clase)
           VALUES (?, ?, ?, 'reservada', 'mensual', NULL, ?)`,
          [id_usuario, id_clase, instancia.id_instancia, fecha_clase_str]
        );
      }

      await connection.commit();
      return { success: true, reservasCreadas: fechasArray.length };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // ─── Reservar mensual presencial (cambio marian) ──────────────
  crearReservaMensualPresencial: async (id_usuario, id_clase, fechasArray, monto_total) => {

    const clasesRepo = new ClasesRepository(db);

    const clase = await clasesRepo.obtenerClasePorId(id_clase);

    if(!clase){
      throw new Error('Clase inexistente');
    }

    await db.promise().execute(
      `INSERT INTO pagos
      (id_usuario,monto,estado,metodo,tipo)
      VALUES(?,?,?,?,?)`,
      [
        id_usuario,
        monto_total,
        'pagado',
        'efectivo', // todas las presenciales quedan conefectivo VER
        'mensual'
      ]
    );

    for(const fecha_clase_str of fechasArray){

    const fechaExactaStr= `${fecha_clase_str} ${clase.horario}`;

    let instancia= await reservasRepository.obtenerInstanciaPorFecha(id_clase, fechaExactaStr);

    if(!instancia){

      const [insResult]=
      await db.promise().execute(
      `INSERT INTO instancias_clases
      (id_clase,fecha_exacta)
      VALUES (?,?)`,
      [
        id_clase,
        fechaExactaStr
      ]
      );

      instancia={
       id_instancia:
       insResult.insertId
      };
    }

    await reservasRepository.insertarReserva(
      id_usuario,
      id_clase,
      instancia.id_instancia,
      "reservada",
      "mensual",
      null,
      fecha_clase_str,
      0
    );
  }

  return{
   success:true,
   reservasCreadas:
   fechasArray.length
  };

}, // fin cambio marian

  // ─── PASO C: Ingresar a lista de espera mensual ──────────────
  ingresarListaEsperaMensual: async (id_usuario, id_clase) => {
    const yaEsta = await reservasRepository.verificarYaEnListaEspera(id_usuario, id_clase, 'mensual');
    if (yaEsta) throw new Error('Ya estás en la lista de espera mensual para esta clase.');

    const total = await reservasRepository.obtenerUltimaPosicionListaEspera(id_clase, 'mensual');
    await reservasRepository.insertarEnListaEspera(id_usuario, id_clase, total + 1, 'mensual');

    return {
      success: true,
      mensaje: 'Fuiste registrado en la lista de espera mensual. Te notificaremos si se libera disponibilidad completa.'
    };
  }
};

module.exports = reservaMensualService;