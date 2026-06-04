const db = require('../src/db');
const UsuariosRepository = require('../repositories/usuariosRepository');
const { sendPermisoAprobado, sendPermisoRechazado } = require('../src/services/emailService');

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
      const usuario = await repo.buscarPorId(req.params.id);
      if (!usuario) {
        return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
      }

      await repo.aprobarPermiso(req.params.id);
      
      // Enviar email de notificación
      await sendPermisoAprobado(usuario.email, usuario.nombre);
      
      res.json({ ok: true, mensaje: "Permiso aprobado y email enviado" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  async rechazarPermiso(req, res) {
    try {
      const usuario = await repo.buscarPorId(req.params.id);
      if (!usuario) {
        return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
      }

      await repo.rechazarPermiso(req.params.id);
      
      // Enviar email de notificación
      await sendPermisoRechazado(usuario.email, usuario.nombre);
      
      res.json({ ok: true, mensaje: "Permiso rechazado y email enviado" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  async resubmitPermiso(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;

      // Validar que sea usuario menor y que haya sido rechazado
      const usuario = await repo.getMenoresRechazados(id);
      if (!usuario) {
        return res.status(404).json({ 
          ok: false, 
          mensaje: "Usuario no encontrado o no tiene un permiso rechazado" 
        });
      }

      // Validar que haya archivo
      if (!file) {
        return res.status(400).json({
          ok: false,
          error: "Debes subir una autorización"
        });
      }

      // Validar formato de archivo
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          ok: false,
          error: "Debes ingresar una imagen válida"
        });
      }

      // Validar tamaño de archivo
      if (file.size > 16 * 1024 * 1024) {
        return res.status(400).json({
          ok: false,
          error: "La foto debe ocupar hasta un máximo de 16MB"
        });
      }

      // Actualizar la autorización
      await repo.actualizarPermiso(id, file.filename);

      return res.status(200).json({
        ok: true,
        mensaje: "Autorización reenviada correctamente. Tu solicitud está pendiente de aprobación nuevamente"
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
        error: "Error interno del servidor"
      });
    }
  }
}
module.exports = UsuariosController;