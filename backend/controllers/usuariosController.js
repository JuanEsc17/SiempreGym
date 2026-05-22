const db = require('../src/db');
const UsuariosRepository = require('../repositories/usuariosRepository');

const repo = new UsuariosRepository(db);

const UsuariosController = {

  async getById(req, res) {
    try {
      const usuario = await repo.buscarPorId(req.params.id);
      if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      res.json({ ok: true, data: usuario });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  async buscarPorUsernameOMail(req,res){
    try{
      const {query}=req.query;

      if(!query){
      return res.status(400).json({
        ok:false,
        mensaje:"Ingrese username o email"
      });
    }

      const usuarios= await repo.buscarPorUsernameOMail(query);

      res.json({ok:true,data:usuarios});
    }
    catch(error){

    res.status(500).json({ok:false,mensaje:error.message});
    }
  },

  async getMenoresPendientes(req, res) {
  try {
    const data = await repo.getMenoresPendientes();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
},

async aprobarPermiso(req, res) {
  try {
    await repo.aprobarPermiso(req.params.id);
    res.json({ ok: true, mensaje: "Permiso aprobado" });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
},

async rechazarPermiso(req, res) {
  try {
    await repo.rechazarPermiso(req.params.id);
    res.json({ ok: true, mensaje: "Permiso rechazado" });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
}
}
module.exports = UsuariosController;