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

  useEffect(() => {

    if (ejecutado.current) return;
    ejecutado.current = true;

    async function confirmarReserva() {

      // ─────────────────────────────
      // Pago rechazado o pendiente
      // ─────────────────────────────
      if (status !== 'approved') {

        setExito(false);

        setMensaje(
          'El pago no fue aprobado.'
        );

        sessionStorage.removeItem('pendingReserva');

        setLoading(false);

        return;
      }

      // ─────────────────────────────
      // Buscar reserva pendiente
      // ─────────────────────────────
      const pendingData =
        sessionStorage.getItem('pendingReserva');

      if (!pendingData) {

        setExito(false);

        setMensaje(
          'No se encontró una reserva pendiente.'
        );

        setLoading(false);

        return;
      }

      try {

        const pending = JSON.parse(pendingData);

        let url;
        let body;

        // ─────────────────────────────
        // Reserva individual
        // ─────────────────────────────
        if (pending.tipo === 'individual') {

          url = `${BASE_URL}/reservas/crear`;

          body = {
            id_usuario: pending.id_usuario,
            id_clase: pending.id_clase,
            id_instancia: pending.id_instancia,
            fecha_clase: pending.fecha_clase,
            tipo_pago: pending.tipo_pago,
            precio_total: pending.precio_total
          };

        } else {

          // ─────────────────────────────
          // Reserva mensual
          // ─────────────────────────────
          url = `${BASE_URL}/reservas/crear-mensual`;

          body = {
            id_usuario: pending.id_usuario,
            id_clase: pending.id_clase,
            fechas: pending.fechas,
            monto_total: pending.monto_total
          };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        const resultado = await response.json();

        if (resultado.ok) {

          setExito(true);

          setMensaje(
            resultado.mensaje ||
            'Reserva confirmada correctamente.'
          );

          sessionStorage.removeItem('pendingReserva');

        } else {

          setExito(false);

          setMensaje(
            resultado.mensaje ||
            'No se pudo registrar la reserva.'
          );
        }

      } catch (error) {

        console.error(error);

        setExito(false);

        setMensaje(
          'Ocurrió un error al registrar la reserva.'
        );

      } finally {

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
              {exito
                ? '¡Pago exitoso!'
                : 'Hubo un problema'}
            </h2>

            <p className="text-sm opacity-80 mb-6 text-white leading-relaxed">
              {mensaje}
            </p>

            <button
              onClick={() => navigate('/actividades')}
              className="w-full py-3 rounded-xl text-white font-medium text-sm border-none cursor-pointer transition-all"
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