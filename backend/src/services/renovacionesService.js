// backend/src/services/renovacionesService.js

const db = require('../db');
const ClasesRepository = require('../../repositories/clasesRepository');
const reservasRepository = require('../../repositories/reservasRepository');
const renovacionesRepository = require('../../repositories/renovacionesRepository');

// ─── Helper: calcular fechas del mes completo ─────────────────
// Solo fechas FUTURAS (posteriores a hoy)
function calcularFechasDelMesSiguiente(diaEnum, mes, anio) {
  const DIAS_MAP = { lunes:1, martes:2, miercoles:3, jueves:4, viernes:5, sabado:6 };
  const diaN = DIAS_MAP[diaEnum.toLowerCase()];
  if (diaN === undefined) throw new Error(`Día de clase inválido: ${diaEnum}`);

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const fechas = [];
  const d = new Date(anio, mes - 1, 1);

  while (d.getDay() !== diaN) d.setDate(d.getDate() + 1);

  while (d.getMonth() === mes - 1) {
    if (d >= hoy) fechas.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 7);
  }
  return fechas;
}

// ─── Helper: calcular mes siguiente ───────────────────────────
function calcularMesSiguiente(mes, anio) {
  if (mes === 12) return { mes: 1, anio: anio + 1 };
  return { mes: mes + 1, anio };
}

// ─── Helper: verificar ventana habilitada ─────────────────────
function estaEnVentanaRenovacion() {
  const hoy = new Date();
  const dia = hoy.getDate();
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const ultimaSemanaInicio = diasEnMes - 6; // últimos 7 días del mes

  const esUltimaSemana = dia >= ultimaSemanaInicio;//a chequear que dice la profe
  const esPrimerosDiez = dia >= 1 && dia <= 10;

  return esUltimaSemana || esPrimerosDiez;
}

const renovacionesService = {

  // ─── Generar renovación al confirmar reserva mensual ─────────
  // Se llama al final de crearReservaMensual
  generarRenovacion: async (id_usuario, id_clase, mesActual, anioActual) => {
    const { mes: mesSiguiente, anio: anioSiguiente } = calcularMesSiguiente(
      mesActual, anioActual
    );

    // Verificar que no exista ya una renovación para ese mes/clase
    const yaExiste = await renovacionesRepository.existeRenovacion(
      id_usuario, id_clase, mesSiguiente, anioSiguiente
    );
    if (yaExiste) return null;

    const clasesRepo = new ClasesRepository(db);
    const clase = await clasesRepo.obtenerClasePorId(id_clase);
    if (!clase) throw new Error('Clase no encontrada al generar renovación.');

    // Calcular todas las fechas del mes siguiente
    const fechas = calcularFechasDelMesSiguiente(
      clase.dia, mesSiguiente, anioSiguiente
    );
    if (fechas.length === 0) throw new Error('No hay fechas para el mes siguiente.');

    // Crear cabecera en tabla renovaciones
    const id_renovacion = await renovacionesRepository.crearRenovacion(
      id_usuario, id_clase, mesSiguiente, anioSiguiente
    );

    // Crear reservas en estado 'por_renovar' para cada fecha
    for (const fecha_clase_str of fechas) {
      const fechaExactaStr = `${fecha_clase_str} ${clase.horario}`;

      // Obtener o crear instancia
      let instancia = await reservasRepository.obtenerInstanciaPorFecha(
        id_clase, fechaExactaStr
      );
      if (!instancia) {
        const nuevoId = await reservasRepository.crearInstanciaClase(
          id_clase, fechaExactaStr
        );
        instancia = { id_instancia: nuevoId };
      }

      // Insertar reserva por_renovar vinculada a la renovación
      await db.promise().execute(
        `INSERT INTO reservas 
           (id_usuario, id_clase, id_instancia, estado, tipo_reserva, fecha_clase, id_renovacion)
         VALUES (?, ?, ?, 'por_renovar', 'mensual', ?, ?)`,
        [id_usuario, id_clase, instancia.id_instancia, fecha_clase_str, id_renovacion]
      );
    }

    return { id_renovacion, fechas };
  },

  // ─── Obtener renovaciones pendientes del usuario ──────────────
  obtenerRenovaciones: async (id_usuario) => {
    const renovaciones = await renovacionesRepository.obtenerRenovacionesPendientes(
      id_usuario
    );

    const ventanaActiva = estaEnVentanaRenovacion();
    const hoy = new Date().toISOString().split('T')[0];

  // Helper para normalizar fecha_vencimiento a 'YYYY-MM-DD'
  const toFechaStr = (fecha) => {
    if (fecha instanceof Date) return fecha.toISOString().split('T')[0];
    return fecha;
  };

  // Filtrar solo renovaciones NO vencidas
  const renovacionesValidas = renovaciones.filter(r => toFechaStr(r.fecha_vencimiento) >= hoy);

  // Marcar como vencidas las que pasaron su fecha
  const renovacionesVencidas = renovaciones.filter(r => toFechaStr(r.fecha_vencimiento) < hoy);
  for (const ren of renovacionesVencidas) {
    await db.promise().execute(
      'UPDATE renovaciones SET estado = ? WHERE id_renovacion = ?',
      ['vencida', ren.id_renovacion]
    );
  }

    // Para cada renovación calculamos las fechas y el precio
    const resultado = renovacionesValidas.map(r => {
      const fechas = calcularFechasDelMesSiguiente(r.dia, r.mes, r.anio);
      const monto = parseFloat(r.precio_individual) * fechas.length;
      const nombreMes = new Date(r.anio, r.mes - 1, 1)
        .toLocaleString('es-AR', { month: 'long' });

      return {
        id_renovacion:    r.id_renovacion,
        id_clase:         r.id_clase,
        actividad:        r.actividad,
        dia:              r.dia,
        horario:          r.horario,
        nombre_profesor:  r.nombre_profesor,
        mes:              r.mes,
        anio:             r.anio,
        nombre_mes:       nombreMes,
        fecha_vencimiento: r.fecha_vencimiento,
        cantidad_clases:  fechas.length,
        fechas,
        monto,
        puede_renovar_ahora: ventanaActiva
      };
    });

    return { renovaciones: resultado, ventana_activa: ventanaActiva };
  },

  // ─── Verificar una renovación antes de pagar ─────────────────
  verificarRenovacion: async (id_renovacion) => {
    const renovacion = await renovacionesRepository.obtenerRenovacionPorId(
      id_renovacion
    );
    if (!renovacion) throw new Error('Renovación no encontrada.');
    if (renovacion.estado !== 'pendiente') {
      throw new Error('Esta renovación ya fue confirmada o venció.');
    }
    
    // Verificar que no esté vencida (día 11 del mes de vencimiento)
    const hoy = new Date().toISOString().split('T')[0];
    if (renovacion.fecha_vencimiento < hoy) {
      throw new Error('Esta renovación venció. No se puede renovar.');
    }
    
    if (!estaEnVentanaRenovacion()) {
      throw new Error('Estás fuera de la ventana de renovación.');
    }

    const fechas = calcularFechasDelMesSiguiente(
      renovacion.dia, renovacion.mes, renovacion.anio
    );
    const monto = parseFloat(renovacion.precio_individual) * fechas.length;

    return { id_renovacion, monto, fechas, renovacion };
  },

  // ─── Confirmar renovación post-pago ──────────────────────────
  confirmarRenovacion: async (id_renovacion, id_usuario, id_clase, mes, anio) => {

    // 1. Confirmar las reservas por_renovar → reservada
    const [resultUpdate] = await db.promise().execute(
      `UPDATE reservas SET estado = 'reservada', tipo_pago = 'total'
       WHERE id_renovacion = ? AND estado = 'por_renovar'`,
      [id_renovacion]
    );

    

    if (resultUpdate.affectedRows === 0) {
      console.warn(`[RENOVACION] ⚠️ NO se encontraron reservas con id_renovacion=${id_renovacion} y estado='por_renovar'`);
      
      // Debug: buscar qué reservas existen para esta renovación
      const [debugRows] = await db.promise().execute(
        `SELECT id_reserva, estado, id_renovacion FROM reservas WHERE id_renovacion = ?`,
        [id_renovacion]
      );
      
    }

    // 2. Marcar renovación como confirmada
    await renovacionesRepository.confirmarRenovacion(id_renovacion);

    // 3. Generar renovación para el mes siguiente automáticamente
    const { mes: mesSiguiente, anio: anioSiguiente } = calcularMesSiguiente(
      mes, anio
    );
    await renovacionesService.generarRenovacion(
      id_usuario, id_clase, mes, anio
    );

    return { success: true };
  },

  // ─── Banner ───────────────────────────────────────────────────
  obtenerBanner: async (id_usuario) => {
    const hoy = new Date();
    const dia = hoy.getDate();

    // Banner solo aparece días 1-10
    if (dia < 1 || dia > 10) {
      return { mostrar: false };
    }

    const renovaciones = await renovacionesRepository.obtenerRenovacionesPendientes(
      id_usuario
    );
    if (renovaciones.length === 0) {
      return { mostrar: false };
    }

    // Tomar la fecha de vencimiento de la primera renovación
    const fechaVenc = renovaciones[0].fecha_vencimiento;
    const nombreMes = new Date(fechaVenc)
      .toLocaleString('es-AR', { month: 'long' });
    const dia10 = new Date(fechaVenc).getDate();

    return {
      mostrar: true,
      cantidad_pendientes: renovaciones.length,
      fecha_limite: fechaVenc,
      mensaje: `Tenés tiempo hasta el ${dia10} de ${nombreMes} para renovar tus reservas mensuales y asegurar tu lugar.`
    };
  }
};

module.exports = renovacionesService;