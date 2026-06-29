// controllers/renovacionesController.js

const renovacionesService = require('../src/services/renovacionesService');
const renovacionesRepository = require('../repositories/renovacionesRepository');
const reservasRepository = require('../repositories/reservasRepository');
const db = require('../src/db');

class RenovacionesController {

  // ─── GET /api/renovaciones/:id_usuario ────────────────────────
  // Devuelve renovaciones pendientes con detalle para mostrar en pantalla
  async getRenovaciones(req, res) {
    try {
      const { id_usuario } = req.params;

      if (!id_usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: 'id_usuario es obligatorio.'
        });
      }

      const resultado = await renovacionesService.obtenerRenovaciones(
        parseInt(id_usuario)
      );

      return res.status(200).json({
        ok: true,
        ...resultado
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: error.message
      });
    }
  }
  // ─── GET /api/renovaciones/tiene-pendiente/:id_usuario/:id_clase/:mes/:anio
async tienePendiente(req, res) {
  try {
    const { id_usuario, id_clase, mes, anio } = req.params;

    const tiene = await renovacionesRepository.tienRenovacionPendiente(
      parseInt(id_usuario),
      parseInt(id_clase),
      parseInt(mes),
      parseInt(anio)
    );

    return res.status(200).json({ ok: true, tiene });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
}

  // ─── POST /api/renovaciones/verificar ─────────────────────────
  // Calcula fechas y precio antes de redirigir a MP
  async verificarRenovacion(req, res) {
    try {
      const { id_renovacion } = req.body;

      if (!id_renovacion) {
        return res.status(400).json({
          ok: false,
          mensaje: 'id_renovacion es obligatorio.'
        });
      }

      const resultado = await renovacionesService.verificarRenovacion(
        parseInt(id_renovacion)
      );

      return res.status(200).json({
        ok: true,
        id_renovacion:   resultado.id_renovacion,
        monto:           resultado.monto,
        fechas:          resultado.fechas,
        actividad:       resultado.renovacion.actividad,
        dia:             resultado.renovacion.dia,
        horario:         resultado.renovacion.horario,
        mes:             resultado.renovacion.mes,
        anio:            resultado.renovacion.anio,
        id_clase:        resultado.renovacion.id_clase
      });

    } catch (error) {
      return res.status(400).json({
        ok: false,
        mensaje: error.message
      });
    }
  }

  // ─── POST /api/renovaciones/confirmar ─────────────────────────
  // Se llama desde PaymentStatus.jsx cuando el pago fue aprobado
  async confirmarRenovacion(req, res) {
    try {
      const { id_renovacion, id_usuario, id_clase, mes, anio, monto_total } = req.body;

      if (!id_renovacion || !id_usuario || !id_clase || !mes || !anio || monto_total == null) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Campos obligatorios: id_renovacion, id_usuario, id_clase, mes, anio, monto_total.'
        });
      }

      const resultado = await renovacionesService.confirmarRenovacion(
        parseInt(id_renovacion),
        parseInt(id_usuario),
        parseInt(id_clase),
        parseInt(mes),
        parseInt(anio)
      );
       // Registrar pago
      await db.promise().execute(
        'INSERT INTO pagos (id_usuario, monto, estado, metodo, tipo) VALUES (?, ?, ?, ?, ?)',
        [id_usuario, monto_total, 'pagado', 'tarjeta', 'mensual']
      );

      return res.status(200).json({
        ok: true,
        mensaje: '¡Renovación confirmada! Tus clases del mes fueron reservadas exitosamente.'
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: error.message
      });
    }
  }

  // ─── GET /api/renovaciones/banner/:id_usuario ─────────────────
  // Devuelve si mostrar el banner y con qué mensaje
  async getBanner(req, res) {
    try {
      const { id_usuario } = req.params;

      if (!id_usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: 'id_usuario es obligatorio.'
        });
      }

      const resultado = await renovacionesService.obtenerBanner(
        parseInt(id_usuario)
      );

      return res.status(200).json({
        ok: true,
        ...resultado
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: error.message
      });
    }
  }
}

module.exports = RenovacionesController;