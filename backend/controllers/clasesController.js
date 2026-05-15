const db = require('../src/db');
const ClasesService = require('../src/services/clasesService');

const service = new ClasesService(db);

const ClasesController = {

  async getDisponibles(req, res) {
    try {
      const clases = await service.getDisponibles();
      res.json({ ok: true, data: clases });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  async getPorDia(req, res) {
    try {
      const clases = await service.getPorDia(req.query.dia);
      res.json({ ok: true, data: clases });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
    },


    //crear clase 

    async crearClase(req, res) {
    try {
        const { actividad, dia, horario, duracion, cupo_maximo, id_profesor, id_sala } = req.body;

        if (!req.file) {
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
            imagen: req.file.filename
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

};

module.exports = ClasesController;