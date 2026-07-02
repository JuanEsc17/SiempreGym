const ListaEsperaRepository = require("../../repositories/listaEsperaRepository")
const reservasRepository = require("../../repositories/reservasRepository");
const ClasesRepository = require("../../repositories/clasesRepository");
const { sendListaEsperaAsignada } = require('./emailService');
const db = require("../../src/db");

const repo = new ListaEsperaRepository(db);

const clasesRepo = new ClasesRepository(db);

// helper simple
const generarGrupoId = (idUsuario, idClase, mes, anio) =>
  `LE-MENSUAL-${idUsuario}-${idClase}-${mes}-${anio}`;

const calcularMesAnioDesdeFechas = (fecha) => {
  const f = new Date(fecha);
  return {
    mes: f.getMonth() + 1,
    anio: f.getFullYear()
  };
};

const listaEsperaMensualService = {

 procesarVacanteMensual: async (id_clase, fechaReferencia) => {

  // 1. Obtener primero de la lista
  const candidato = await repo.obtenerPrimero(id_clase, 'mensual');

  if (!candidato) {
    return { status: 'SIN_ESPERA' };
  }

  const clase = await clasesRepo.obtenerClasePorId(id_clase);

  if (!clase) {
    throw new Error("Clase no encontrada");
  }

  const { mes, anio } = calcularMesAnioDesdeFechas(fechaReferencia);

  const grupoId = generarGrupoId(
    candidato.id_usuario,
    id_clase,
    mes,
    anio
  );

  const fechasArray = await generarFechasMensualesSimples(
    clase,
    mes,
    anio
  );

  if (fechasArray.length === 0) {
    return { status: "SIN_FECHAS" };
  }

  // ===========================================================
  // NUEVO: verificar que haya cupo en TODAS las semanas
  // ===========================================================

  for (const fecha of fechasArray) {

    const fechaExacta = `${fecha} ${clase.horario}`;

    let instancia =
      await reservasRepository.obtenerInstanciaPorFecha(
        id_clase,
        fechaExacta
      );

    if (!instancia) {
      const id =
        await reservasRepository.crearInstanciaClase(
          id_clase,
          fechaExacta
        );

      instancia = {
        id_instancia: id
      };
    }

    const ocupados =
      await reservasRepository.contarReservasDeInstancia(
        instancia.id_instancia
      );

    if (ocupados >= clase.cupo_maximo) {

      console.log(
        "Todavía no hay lugar en todas las clases del mes."
      );

      return {
        status: "AUN_SIN_CUPO"
      };
    }
  }

  // ===========================================================
  // Si llegó acá, ahora sí hay lugar en todas
  // ===========================================================

  const precioTotal =
    clase.precio_individual * fechasArray.length;

  let indice = 0;

  for (const fecha of fechasArray) {

    const esPrincipal = indice === 0;

    const fechaExacta = `${fecha} ${clase.horario}`;

    let instancia =
      await reservasRepository.obtenerInstanciaPorFecha(
        id_clase,
        fechaExacta
      );

    if (!instancia) {

      const id =
        await reservasRepository.crearInstanciaClase(
          id_clase,
          fechaExacta
        );

      instancia = {
        id_instancia: id
      };
    }

    await reservasRepository.insertarReserva(
      candidato.id_usuario,
      id_clase,
      instancia.id_instancia,
      'pendiente',
      'mensual',
      'seña',
      fecha,
      esPrincipal ? precioTotal : 0,
      grupoId
    );

    indice++;
  }

  await repo.eliminar(candidato.id_lista);

  try {
  const [userRows] = await db.promise().execute(
    'SELECT nombre, apellido, email FROM usuarios WHERE id_usuario = ?',
    [candidato.id_usuario]
  );
  const usuario = userRows[0];
  if (usuario) {
    await sendListaEsperaAsignada(
      usuario.email,
      `${usuario.nombre} ${usuario.apellido}`,
      clase.actividad,
      clase.horario.slice(0, 5) + ' hs',
      fechasArray  // ['2026-07-13', '2026-07-20', ...]
    );
  }
} catch (emailErr) {
  // No frenamos el flujo si falla el email
  console.error('[LISTA ESPERA] Error enviando email:', emailErr.message);
}

return {
  status: "OK",
  usuario: candidato.id_usuario,
  grupo_mensual_id: grupoId
};

}
};

// helper simple de fechas (reutiliza lógica existente sin romper nada)
async function generarFechasMensualesSimples(clase, mes, anio) {
  const DIAS = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6
  };

  const diaSemana = DIAS[clase.dia];
  if (diaSemana === undefined) return [];

  const fechas = [];
  const d = new Date(anio, mes - 1, 1);

  while (d.getDay() !== diaSemana) d.setDate(d.getDate() + 1);

  while (d.getMonth() === mes - 1) {
    fechas.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 7);
  }

  return fechas;
}

module.exports = listaEsperaMensualService;