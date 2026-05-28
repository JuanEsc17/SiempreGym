const ClasesRepository = require('../../repositories/clasesRepository');

const diasMap = {
  'DOM': 'domingo', 'LUN': 'lunes', 'MAR': 'martes',
  'MIE': 'miercoles', 'JUE': 'jueves', 'VIE': 'viernes', 'SAB': 'sabado'
};

class ClasesService {
  constructor(db) {
    this.repo = new ClasesRepository(db);
  }

  async getDisponibles() {
    return await this.repo.getDisponibles();
  }

  async getPorDia(dia, incluirCompletas = false, fecha = null) {
  const diaLimpio = dia ? dia.toLowerCase().trim() : '';
  const mapa = {
    'lun': 'lunes', 'mar': 'martes', 'mie': 'miercoles',
    'jue': 'jueves', 'vie': 'viernes', 'sab': 'sabado', 'dom': 'domingo'
  };
  const diaBusqueda = mapa[diaLimpio.substring(0, 3)] || diaLimpio;

  if (incluirCompletas) return await this.repo.getPorDiaConLlenas(diaBusqueda, fecha);
  return await this.repo.getPorDia(diaBusqueda);
  }
  
  // Chequeos para crear clase

  async crearClase(datos) {
    if (!datos.actividad || !datos.dia || !datos.horario || !datos.duracion || 
        !datos.cupo_maximo || !datos.id_profesor || !datos.id_sala) {
      throw { status: 400, mensaje: 'No se ingresaron todos los datos necesarios' };
    }

    const actividadesValidas = ['yoga', 'pilates', 'funcional'];
    if (!actividadesValidas.includes(datos.actividad.toLowerCase())) {
        throw { status: 400, mensaje: 'La actividad debe ser Yoga, Pilates o Funcional' };
    }

    if (datos.cupo_maximo <= 0) throw { status: 400, mensaje: 'El cupo debe ser mayor a 0' };
    if (datos.duracion <= 0) throw { status: 400, mensaje: 'La duración debe ser mayor a 0' };

    //console.log('chequeando profesor...')//debug
    

    const profesorExiste = await this.repo.existeProfesor(datos.id_profesor);
    if (!profesorExiste) throw { status: 404, mensaje: 'El profesor no existe en el sistema' };
    
    //console.log('chequeando sala...')//debug
    
  
    const salaExiste = await this.repo.existeSala(datos.id_sala);
    if (!salaExiste) throw { status: 404, mensaje: 'La sala no existe en el sistema' };

    //console.log('obteniendo sala...')//debug
  

    // Cupo no puede superar la capacidad de la sala
    const sala = await this.repo.obtenerSalaPorId(datos.id_sala);
    if (datos.cupo_maximo > sala.capacidad) {
      throw { status: 400, mensaje: `El cupo no puede superar la capacidad de la sala (${sala.capacidad} personas)` };
    }
    //console.log('chequeando profesor ocupado...')//debug
    const profOcupado = await this.repo.profesorOcupado(datos.id_profesor, datos.dia, datos.horario, datos.duracion, 0);
    if (profOcupado) throw { status: 409, mensaje: 'El profesor ya tiene una clase asignada en ese horario' };

    const salaOcup = await this.repo.salaOcupada(datos.id_sala, datos.dia, datos.horario, datos.duracion, 0);
    if (salaOcup) throw { status: 409, mensaje: `La sala ya tiene una clase asignada el día ${datos.dia} ${datos.horario}` };

    const duplicada = await this.repo.claseExiste(datos.actividad, datos.dia, datos.horario, datos.id_profesor, datos.id_sala);
    if (duplicada) throw { status: 409, mensaje: 'Ya existe una clase con esos datos' };

    const id_nueva_clase = await this.repo.crearClase(datos);
    return { id_clase: id_nueva_clase, mensaje: 'Clase creada exitosamente' };

  }
  
  async obtenerProfesores() {
    return await this.repo.obtenerProfesores();
  }

  async obtenerSalas() {
    return await this.repo.obtenerSalas();
  }

  //chequeos para editas
  async editarClase(id_clase, datos) {
    // Datos incompletos
    if (!datos.actividad || !datos.dia || !datos.horario || !datos.duracion || 
        !datos.cupo_maximo || !datos.id_profesor || !datos.id_sala) {
        throw { status: 400, mensaje: 'No se ingresaron todos los datos necesarios' };
    }

    // Actividad válida
    const actividadesValidas = ['yoga', 'pilates', 'funcional'];
    if (!actividadesValidas.includes(datos.actividad.toLowerCase())) {
        throw { status: 400, mensaje: 'La actividad debe ser Yoga, Pilates o Funcional' };
    }

    // Cupo válido
    if (datos.cupo_maximo <= 0) throw { status: 400, mensaje: 'El cupo máximo debe ser mayor a 0' };

    // Duración válida
    if (datos.duracion <= 0) throw { status: 400, mensaje: 'La duración mínima debe ser mayor a 0' };

    // Clase existe
    const clase = await this.repo.obtenerClasePorId(id_clase);
    if (!clase) throw { status: 404, mensaje: 'La clase no existe' };

    // Inscriptos no superan nuevo cupo
    if (clase.cantidad_inscriptos > datos.cupo_maximo) {
        throw { status: 400, mensaje: 'La cantidad de inscriptos supera el nuevo cupo máximo' };
    }

    // Profesor existe
    const profesorExiste = await this.repo.existeProfesor(datos.id_profesor);
    if (!profesorExiste) throw { status: 404, mensaje: 'El profesor no existe en el sistema' };

    // Sala existe
    const salaExiste = await this.repo.existeSala(datos.id_sala);
    if (!salaExiste) throw { status: 404, mensaje: 'La sala no existe en el sistema' };

    // Cupo no supera capacidad sala
    const sala = await this.repo.obtenerSalaPorId(datos.id_sala);
    if (datos.cupo_maximo > sala.capacidad) {
        throw { status: 400, mensaje: `El cupo no puede superar la capacidad de la sala (${sala.capacidad} personas)` };
    }

    // Profesor ocupado (ignorar si es el mismo que ya tiene la clase)
    if (datos.id_profesor !== clase.id_profesor || datos.dia !== clase.dia || datos.horario !== clase.horario) {
        const profOcupado = await this.repo.profesorOcupado(datos.id_profesor, datos.dia, datos.horario, datos.duracion, id_clase);
        if (profOcupado) throw { status: 409, mensaje: 'El profesor ya tiene una clase asignada en ese horario' };
    }

    // Sala ocupada (ignorar si es la misma sala)
    if (datos.id_sala !== clase.id_sala || datos.dia !== clase.dia || datos.horario !== clase.horario) {
        const salaOcup = await this.repo.salaOcupada(datos.id_sala, datos.dia, datos.horario, datos.duracion, id_clase);
        if (salaOcup) throw { status: 409, mensaje: `La sala ya está ocupada en ese horario` };
    }

    await this.repo.editarClase(id_clase, datos);
    return { mensaje: 'Clase actualizada exitosamente' };
}

async obtenerClasePorId(id_clase) {
    const clase = await this.repo.obtenerClasePorId(id_clase);
    if (!clase) throw { status: 404, mensaje: 'La clase no existe' };
    return clase;
}
  async obtenerTodas() {
    return await this.repo.obtenerTodas();
  }
}

module.exports = ClasesService;