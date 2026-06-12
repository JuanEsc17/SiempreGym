import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000/api';

export default function PaymentStatus() {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ejecutado = useRef(false);

  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('Procesando pago...');
  const [exito, setExito] = useState(null);

  const status = searchParams.get('status');
  const status_detail = searchParams.get('status_detail');

  useEffect(() => {

    if (ejecutado.current) return;
    ejecutado.current = true;

    async function confirmarReserva() {

      try {

        // ─────────────────────────────
        // 1. CANCELADO / NO APROBADO
        // ─────────────────────────────
        if (!status || status === 'null' || status === 'cancelled') {

          setExito(false);
          setMensaje('Operación cancelada');
          setLoading(false);
          return;
        }

        // ─────────────────────────────
        // 2. RECHAZADO POR FONDOS
        // ─────────────────────────────
        if (
          status === 'rejected' &&
          status_detail === 'cc_rejected_insufficient_amount'
        ) {

          setExito(false);
          setMensaje('La cuenta no tiene fondos suficientes, reintente');
          setLoading(false);
          return;
        }

        // ─────────────────────────────
        // 3. PAGO PENDIENTE
        // ─────────────────────────────
        if (status === 'pending') {

          setExito(false);
          setMensaje('El pago quedó pendiente de aprobación');
          setLoading(false);
          return;
        }

        // ─────────────────────────────
        // 4. PAGO EXITOSO
        // ─────────────────────────────
        if (status === 'approved') {

          const pendingData = localStorage.getItem('pendingReserva');

          if (!pendingData) {
            setExito(false);
            setMensaje('No se encontró la operación pendiente');
            setLoading(false);
            return;
          }

          const pending = JSON.parse(pendingData);

          let url = '';
          let body = {};

          // ─────────────────────────────
          // 🟢 CASO 1: SUSCRIPCIÓN MENSUAL
          // ─────────────────────────────
          if (pending.tipo === 'mensual') {
            // Si tiene id_renovacion es una renovación, sino es reserva nueva
            url = pending.id_renovacion 
            ? `${BASE_URL}/renovaciones/confirmar`
            : `${BASE_URL}/reservas/crear-mensual`;

            body = pending.id_renovacion
            ? {
              id_renovacion: pending.id_renovacion,
              id_usuario:    pending.id_usuario,
              id_clase:      pending.id_clase,
              mes:           pending.mes,
              anio:          pending.anio,
              monto_total:   pending.precio_total
              } 
            : {
              id_usuario:  pending.id_usuario,
              id_clase:    pending.id_clase,
              fechas:      pending.fechas,
              monto_total: pending.precio_total
            };
        }

          // ─────────────────────────────
          // 🔵 CASO 2: INDIVIDUAL
          // ─────────────────────────────
          else {
            // COMPLETAR SALDO DE UNA SEÑA EXISTENTE
            if (pending.id_reserva) {

              url = `${BASE_URL}/reservas/completar-pago`;

              body = {
                id_reserva: pending.id_reserva
              };

            }
            else {
             // CREAR RESERVA NUEVA

            url = `${BASE_URL}/reservas/crear`;

            body = {
              id_usuario: pending.id_usuario,
              id_clase: pending.id_clase,
              id_instancia: pending.id_instancia,
              fecha_clase: pending.fecha_clase,
              tipo_pago: pending.tipo_pago,
              precio_total: pending.precio_total
            };

          }}
          // ─────────────────────────────
          // 🔁 REQUEST UNIFICADO
          // ─────────────────────────────
          const response = await fetch(url, {

            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });

          const resultado = await response.json();

          if (!response.ok) {

            setExito(false);
            setMensaje(resultado?.mensaje || 'No se pudo procesar el pago');
            setLoading(false);
            return;
          }

          setExito(true);

          if (pending.tipo === 'individual' && pending.tipo_pago === 'SEÑA') {
            setMensaje('Clase señada con éxito');
          } else {
            setMensaje('Pago realizado con éxito');
          }

          localStorage.removeItem('pendingReserva');
          setLoading(false);
          return;
        }
        // ─────────────────────────────
        // fallback general
        // ─────────────────────────────
        setExito(false);
        setMensaje('El servicio para realizar el pago está interrumpido momentáneamente, reintente más tarde');
        setLoading(false);

      } catch (error) {

        console.error(error);

        setExito(false);
        setMensaje('El servicio para realizar el pago está interrumpido momentáneamente, reintente más tarde');
        setLoading(false);
      }
    }

    confirmarReserva();

  }, [status]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#1a1a2e' }}
    >

      <div
        className="rounded-2xl p-6 w-full max-w-sm text-center shadow-xl"
        style={{ background: '#1e1e2e' }}
      >

        {loading && (
          <div className="flex flex-col items-center gap-4">

            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>

            <p className="text-white text-base font-medium">
              {mensaje}
            </p>

          </div>
        )}

        {!loading && (
          <div>

            <span className="text-5xl block mb-4">
              {exito ? '✅' : '❌'}
            </span>

            <h2 className="text-xl font-semibold mb-3 text-white">
              {exito ? '¡Pago exitoso!' : 'Hubo un problema'}
            </h2>

            <p className="text-sm opacity-80 mb-6 text-white leading-relaxed">
              {mensaje}
            </p>

            <button
              onClick={() => navigate('/actividades')}
              className="w-full py-3 rounded-xl text-white font-medium text-sm"
              style={{ background: '#14b8a6' }}
            >
              Volver a Actividades
            </button>

          </div>
        )}

      </div>
    </div>
  );
}