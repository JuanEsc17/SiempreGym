const db = require('../src/db');
const ClasesService = require('../src/services/clasesService');

const service = new ClasesService(db);

const ClasesController = {
// Obtener clases disponibles para el frontend
  async getDisponibles(req, res) {
    try {
      const clases = await service.getDisponibles();
      res.json({ ok: true, data: clases });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  },
// Obtener clases por día (para el calendario del frontend)
  async getPorDia(req, res) {
  try {
    const dia = req.query.dia;
    const incluirCompletas = req.query.incluirCompletas === 'true';
    const fecha = req.query.fecha || null; // 'YYYY-MM-DD' que manda el front
    const clases = await service.getPorDia(dia, incluirCompletas, fecha);
    res.json({ ok: true, data: clases });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
},


    //crear clase 

    async crearClase(req, res) {
    try {
        const { actividad, dia, horario, duracion, cupo_maximo, id_profesor, id_sala, imagen } = req.body;
        
        // La imagen ahora viene como nombre (string) desde el frontend, no como archivo subido
        if (!imagen) {
            return res.status(400).json({ ok: false, mensaje: 'Debe proporcionar una imagen' });
        }

        const datos = {
            actividad,
            dia,
            horario,
            duracion: parseInt(duracion),
            cupo_maximo: parseInt(cupo_maximo),
            id_profesor: parseInt(id_profesor),
            id_sala: parseInt(id_sala),
            imagen: imagen
        };

        const resultado = await service.crearClase(datos);
        res.json({ ok: true, data: resultado });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ ok: false, mensaje: error.mensaje || error.message });
    }
},

async obtenerProfesores(req, res) {
    try {
        const profesores = await service.obtenerProfesores();
        res.json({ ok: true, data: profesores });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
},

async obtenerSalas(req, res) {
    try {
        const salas = await service.obtenerSalas();
        res.json({ ok: true, data: salas });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
},
//para editar
//buscar la clase por id
async obtenerClasePorId(req, res) {
    try {
        const clase = await service.obtenerClasePorId(req.params.id);
        res.json({ ok: true, data: clase });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ ok: false, mensaje: error.mensaje || error.message });
    }
},

//el real editar clases
async editarClase(req, res) {
    try {
        const { actividad, dia, horario, duracion, cupo_maximo, id_profesor, id_sala, imagen } = req.body;

        const datos = {
            actividad,
            dia,
            horario,
            duracion: parseInt(duracion),
            cupo_maximo: parseInt(cupo_maximo),
            id_profesor: parseInt(id_profesor),
            id_sala: parseInt(id_sala),
            imagen: imagen || null
        };

        const resultado = await service.editarClase(req.params.id, datos);
        res.json({ ok: true, data: resultado });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ ok: false, mensaje: error.mensaje || error.message });
    }
},
//para mostrar todas las clases en el admin panel
async obtenerTodas(req, res) {
    try {
        const clases = await service.obtenerTodas();
        res.json({ ok: true, data: clases });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
},
};

module.exports = ClasesController;