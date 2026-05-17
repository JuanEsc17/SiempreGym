const ReservasRepository = require('../../repositories/reservasRepository');

// Mapea el ENUM de la base de datos al número de día de JavaScript (0 = Domingo, 1 = Lunes, etc.)
const MAPA_DIAS = {
  'lunes': 1,
  'martes': 2,
  'miercoles': 3,
  'jueves': 4,
  'viernes': 5,
  'sabado': 6
};

// Convierte el día ENUM y horario (HH:MM:SS) de la BD a un objeto Date real de esta semana
function calcularFechaClase(diaEnum, horarioStr) {
  const fecha = new Date();
  const diaDestino = MAPA_DIAS[diaEnum.toLowerCase()];
  
  if (diaDestino !== undefined) {
    const diaActual = fecha.getDay();
    const distancia = diaDestino - diaActual;
    fecha.setDate(fecha.getDate() + distancia);
  }

  const [horas, minutos, segundos] = horarioStr.split(':').map(Number);
  fecha.setHours(horas, minutos, segundos || 0, 0);
  return fecha;
}

function claseYaIniciada(clase) {
  const inicioClase = calcularFechaClase(clase.dia, clase.horario);
  const ahora = new Date();
  return ahora >= inicioClase;
}

function haySuperposicion(reservasExistentes, claseNueva) {
  const inicioNueva = calcularFechaClase(claseNueva.dia, claseNueva.horario);
  const finNueva = new Date(inicioNueva.getTime() + claseNueva.duracion * 60000);

  return reservasExistentes.some(reserva => {
    // Si no coinciden en el día de la semana, no hay superposición posible
    if (reserva.dia.toLowerCase() !== claseNueva.dia.toLowerCase()) return false;

    const inicioExistente = calcularFechaClase(reserva.dia, reserva.horario);
    const finExistente = new Date(inicioExistente.getTime() + reserva.duracion * 60000);
    
    return inicioNueva < finExistente && finNueva > inicioExistente;
  });
}

function esMismoDia(diaEnum) {
  const fechaClase = calcularFechaClase(diaEnum, "00:00:00");
  const ahora = new Date();
  return fechaClase.getFullYear() === ahora.getFullYear() &&
         fechaClase.getMonth() === ahora.getMonth() &&
         fechaClase.getDate() === ahora.getDate();
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

class ReservasService {
  constructor(db) {
    this.repo = new ReservasRepository(db);
  }

  async crearReserva(id_usuario, id_clase, tipo_pago, precio_total) {
    const clase = await this.repo.buscarClasePorId(id_clase);
    const cliente = await this.repo.buscarClientePorId(id_usuario);

    if (!clase) throw { status: 404, mensaje: 'Clase no encontrada' };
    if (!cliente) throw { status: 404, mensaje: 'Cliente no encontrado' };

    if (claseYaIniciada(clase)) throw { status: 400, mensaje: 'No es posible reservar una clase ya iniciada' };
    
    // Cálculo definitivo de cupos basado en el dump de tus compañeros
    const cuposDisponibles = clase.cupo_maximo - (clase.cantidad_inscriptos || 0);
    if (cuposDisponibles <= 0) throw { status: 400, mensaje: 'No hay cupos disponibles' };

    const reservasCliente = await this.repo.buscarReservasDeCliente(id_usuario);
    if (haySuperposicion(reservasCliente, clase)) throw { status: 400, mensaje: 'Ya tenés una actividad reservada para ese horario' };

    // Caso 1: Pago por Crédito
    if (tipo_pago === 'CREDITO') {
      if (cliente.creditos <= 0) throw { status: 400, mensaje: 'No tenés créditos disponibles' };
      return await this.confirmarReserva(cliente, clase, 'reservada', 'credito', 0, 0);
    }

    // Caso 2: Plan Mensual
    if (cliente.tipo_plan === 'mensual') {
      const { puede, aviso } = clientePuedeReservarConPlan(cliente);
      if (!puede) throw { status: 400, mensaje: 'Debés regularizar el pago de tu plan para reservar' };
      return await this.confirmarReserva(cliente, clase, 'reservada', 'membresia', 0, 0, aviso);
    }

    // Caso 3: Pago Individual o Seña (Mercado Pago)
    if (cliente.tipo_plan === 'individual' || cliente.tipo_plan === 'ninguno') {
      if (!tipo_pago || !['TOTAL', 'SEÑA'].includes(tipo_pago)) {
        throw { status: 400, mensaje: 'Debés elegir una forma de pago: TOTAL o SEÑA' };
      }
      if (tipo_pago === 'SEÑA' && esMismoDia(clase.dia)) {
        throw { status: 400, mensaje: 'No es posible reservar con seña el mismo día de la clase' };
      }

      // El precio base definitivo viene desde el Front o un fallback estándar
      const basePrecio = parseFloat(precio_total || 2000);
      const monto = tipo_pago === 'TOTAL' ? basePrecio : basePrecio / 2;
      const saldo = tipo_pago === 'TOTAL' ? 0 : basePrecio / 2;

      // Enviamos tipo_pago como null a la tabla reservas (ya que solo acepta 'membresia' o 'credito')
      // pero pasamos la modalidad ('TOTAL' o 'SEÑA') para impactar la tabla pagos.
      return await this.confirmarReserva(cliente, clase, 'reservada', null, monto, saldo, false, tipo_pago);
    }
  }

  async confirmarReserva(cliente, clase, estado, tipo_pago_reserva, monto_pagado, saldo_pendiente, aviso = false, modalidadMP = null) {
    // 1. Insertamos la reserva limpia usando estrictamente las columnas del grupo
    const reserva_id = await this.repo.insertarReserva(
      cliente.id_usuario, 
      clase.id_clase,
      estado, // Guardará 'reservada'
      tipo_pago_reserva // 'membresia', 'credito' o null
    );

    // 2. Incrementamos la cantidad de inscriptos en la clase
    await this.repo.actualizarCupos(clase.id_clase);

    if (tipo_pago_reserva === 'credito') {
      await this.repo.descontarCredito(cliente.id_usuario);
    }

    // 3. Registramos los movimientos financieros en la tabla PAGOS del grupo
    if (modalidadMP === 'TOTAL') {
      // Registramos el pago completo aprobado por Mercado Pago
      await this.repo.insertarPago(cliente.id_usuario, monto_pagado, 'pagado', 'tarjeta', 'clase');
    } 
    else if (modalidadMP === 'SEÑA') {
      // El 50% cobrado por Mercado Pago entra como 'pagado'
      await this.repo.insertarPago(cliente.id_usuario, monto_pagado, 'pagado', 'tarjeta', 'clase');
      // El otro 50% restante queda registrado como 'pendiente' (efectivo para pagar en el gym)
      await this.repo.insertarPago(cliente.id_usuario, saldo_pendiente, 'pendiente', 'efectivo', 'clase');
    }

    return {
      reserva_id,
      clase: clase.actividad,
      horario: clase.horario,
      estado,
      monto_pagado,
      saldo_pendiente: saldo_pendiente > 0 ? `Debés $${saldo_pendiente} el día de la clase` : null,
      aviso
    };
  }

  async getMisReservas(id_usuario) {
    return await this.repo.getReservasPorUsuario(id_usuario);
  }
}

module.exports = ReservasService;