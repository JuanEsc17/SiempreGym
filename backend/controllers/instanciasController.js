const db = require('../src/db');
const reservasRepository = require('../repositories/reservasRepository');
const { sendClaseCancelada } = require('../src/services/emailService');

const DIAS_MAP = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const InstanciasController = {
  async obtenerSemana(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);

      const [clases] = await db.promise().execute(
        `SELECT c.*,
                CONCAT(u.nombre, ' ', u.apellido) AS nombre_profesor,
                s.nombre AS nombre_sala
         FROM clases c
         LEFT JOIN usuarios u ON c.id_profesor = u.id_usuario
         LEFT JOIN salas s ON c.id_sala = s.id_sala
         WHERE c.estado = 'activa'
         ORDER BY FIELD(c.dia, 'lunes','martes','miercoles','jueves','viernes','sabado','domingo'), c.horario`
      );

      const instancias = [];

      for (const clase of clases) {
        const diaIndex = DIAS_MAP.indexOf(clase.dia);
        if (diaIndex === -1) continue;

        const currentDayIndex = today.getDay();
        let daysUntil = diaIndex - currentDayIndex;
        if (daysUntil < 0) daysUntil += 7;

        const classDate = new Date(today);
        classDate.setDate(today.getDate() + daysUntil);

        const [h, m] = clase.horario.split(':');
        const classDateTime = new Date(classDate);
        classDateTime.setHours(parseInt(h), parseInt(m), 0, 0);
        if (classDateTime <= new Date()) continue;

        if (classDate >= endDate) continue;

        const fechaStr = formatDate(classDate);

        const [existing] = await db.promise().execute(
          `SELECT ic.*,
                  (SELECT COUNT(*) FROM reservas r WHERE r.id_instancia = ic.id_instancia AND r.estado IN ('reservada', 'por_renovar')) AS inscriptos
           FROM instancias_clases ic
           WHERE ic.id_clase = ? AND DATE(ic.fecha_exacta) = ?`,
          [clase.id_clase, fechaStr]
        );

        if (existing.length > 0) {
          instancias.push({
            id_instancia: existing[0].id_instancia,
            id_clase: clase.id_clase,
            actividad: clase.actividad,
            dia: clase.dia,
            horario: clase.horario,
            duracion: clase.duracion,
            fecha: fechaStr,
            fecha_exacta: existing[0].fecha_exacta,
            cancelada: existing[0].cancelada === 1 || existing[0].cancelada === true,
            cupo_maximo: clase.cupo_maximo,
            profesor: clase.nombre_profesor,
            sala: clase.nombre_sala,
            imagen: clase.imagen,
            inscriptos: existing[0].inscriptos
          });
        } else {
          instancias.push({
            id_instancia: null,
            id_clase: clase.id_clase,
            actividad: clase.actividad,
            dia: clase.dia,
            horario: clase.horario,
            duracion: clase.duracion,
            fecha: fechaStr,
            fecha_exacta: null,
            cancelada: false,
            cupo_maximo: clase.cupo_maximo,
            profesor: clase.nombre_profesor,
            sala: clase.nombre_sala,
            imagen: clase.imagen,
            inscriptos: 0
          });
        }
      }

      instancias.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horario.localeCompare(b.horario));

      res.json({ ok: true, data: instancias });
    } catch (error) {
      console.error('Error obtenerSemana:', error);
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  async cancelarInstancia(req, res) {
    try {
      const { id_clase, fecha } = req.body;

      if (!id_clase || !fecha) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos: id_clase y fecha son requeridos' });
      }

      const [clases] = await db.promise().execute(
        'SELECT * FROM clases WHERE id_clase = ?',
        [id_clase]
      );
      if (!clases || clases.length === 0) {
        return res.status(404).json({ ok: false, mensaje: 'La clase no existe' });
      }
      const clase = clases[0];

      const [anio, mes, dia] = fecha.split('-').map(Number);
      const [hora, minuto] = clase.horario.split(':').map(Number);
      const fechaClaseDate = new Date(anio, mes - 1, dia, hora, minuto);
      if (fechaClaseDate <= new Date()) {
        return res.status(400).json({ ok: false, mensaje: 'No se puede cancelar una clase que ya ha ocurrido' });
      }

      const fechaExactaStr = `${fecha} ${clase.horario}`;

      let instancia = await reservasRepository.obtenerInstanciaPorFecha(id_clase, fechaExactaStr);
      if (!instancia) {
        const nuevoId = await reservasRepository.crearInstanciaClase(id_clase, fechaExactaStr);
        instancia = { id_instancia: nuevoId, cancelada: 0 };
      }

      if (instancia.cancelada === 1 || instancia.cancelada === true) {
        return res.status(400).json({ ok: false, mensaje: 'La clase ya se encuentra cancelada' });
      }

      await db.promise().execute(
        'UPDATE instancias_clases SET cancelada = 1 WHERE id_instancia = ?',
        [instancia.id_instancia]
      );

      const [reservas] = await db.promise().execute(
        `SELECT r.*, u.email, u.nombre, u.apellido, u.id_usuario
         FROM reservas r
         JOIN usuarios u ON r.id_usuario = u.id_usuario
         WHERE r.id_instancia = ? AND r.estado = 'reservada'`,
        [instancia.id_instancia]
      );

      await db.promise().execute(
        'UPDATE reservas SET estado = ? WHERE id_instancia = ? AND estado = ?',
        ['cancelada', instancia.id_instancia, 'reservada']
      );

      if (reservas.length > 0) {
        for (const reserva of reservas) {
          await reservasRepository.agregarCredito(reserva.id_usuario, 1);

          const fechaFormateada = new Date(instancia.fecha_exacta || fechaExactaStr).toLocaleString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });

          try {
            await sendClaseCancelada(
              reserva.email,
              `${reserva.nombre} ${reserva.apellido}`,
              clase.actividad,
              fechaFormateada
            );
          } catch (emailError) {
            console.error('Error enviando email de cancelación:', emailError);
          }
        }

        return res.json({
          ok: true,
          mensaje: 'Clase cancelada exitosamente',
          clientes_notificados: reservas.length
        });
      }

      res.json({
        ok: true,
        mensaje: 'Clase cancelada con éxito'
      });
    } catch (error) {
      console.error('Error cancelarInstancia:', error);
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }
};

module.exports = InstanciasController;
