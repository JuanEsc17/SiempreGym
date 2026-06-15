const cron = require('node-cron');
const renovacionesRepository = require('../../repositories/renovacionesRepository');
const emailService = require('../services/emailService');
const db = require('../db');

// ─── Cron: día 8 de cada mes a las 08:00 ─────────────────────
// Envía notificación a clientes abonados cuyo pago vence en 2 días
cron.schedule('0 8 8 * *', async () => {
  console.log('[CRON] Ejecutando notificación de pagos próximos a vencer...');

  try {
    // Obtener renovaciones pendientes que vencen el 10 del mes actual
    const renovacionesProximas = await renovacionesRepository.obtenerRenovacionesProximasAVencer();

    if (renovacionesProximas.length === 0) {
      console.log('[CRON] No hay renovaciones próximas a vencer.');
      return;
    }

    console.log(`[CRON] Renovaciones próximas a vencer encontradas: ${renovacionesProximas.length}`);

    // Enviar email a cada usuario
    for (const renovacion of renovacionesProximas) {
      try {
        await emailService.sendNotificacionPagoProximoAVencer(
          renovacion.email,
          renovacion.nombre,
          renovacion.actividad
        );
        console.log(`[CRON] Notificación enviada a: ${renovacion.email}`);
      } catch (emailError) {
        console.error(`[CRON] Error al enviar email a ${renovacion.email}:`, emailError.message);
      }
    }

    console.log(`[CRON] Proceso completado. Notificaciones enviadas: ${renovacionesProximas.length}`);

  } catch (error) {
    console.error('[CRON] Error al ejecutar notificación de pagos:', error.message);
  }
});

// ─── Cron: día 11 de cada mes a las 00:01 ─────────────────────
// 1. Obtiene renovaciones pendientes vencidas
// 2. Elimina físicamente las reservas por_renovar vinculadas
// 3. Marca las renovaciones como vencidas

cron.schedule('1 0 11 * *', async () => {
  console.log('[CRON] Ejecutando vencimiento de renovaciones...');

  try {
    // 1. Obtener IDs de renovaciones vencidas
    const renovacionesVencidas = await renovacionesRepository.obtenerRenovacionesVencidas();

    if (renovacionesVencidas.length === 0) {
      console.log('[CRON] No hay renovaciones vencidas.');
      return;
    }

    const ids = renovacionesVencidas.map(r => r.id_renovacion);
    console.log(`[CRON] Renovaciones vencidas encontradas: ${ids.length}`);

    // 2. Eliminar físicamente las reservas por_renovar vinculadas
    const placeholders = ids.map(() => '?').join(', ');
    const [deleteResult] = await db.promise().execute(
      `DELETE FROM reservas 
       WHERE id_renovacion IN (${placeholders}) 
       AND estado = 'por_renovar'`,
      ids
    );
    console.log(`[CRON] Reservas por_renovar eliminadas: ${deleteResult.affectedRows}`);

    // 3. Marcar renovaciones como vencidas
    await renovacionesRepository.marcarComoVencidas(ids);
    console.log(`[CRON] Renovaciones marcadas como vencidas: ${ids.length}`);

  } catch (error) {
    console.error('[CRON] Error al vencer renovaciones:', error.message);
  }
});

console.log('[CRON] Renovaciones cron registrado ✅');