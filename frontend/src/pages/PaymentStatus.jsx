import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('Procesando tu pago...');
  const [exito, setExito] = useState(null);

  // Capturamos las variables que nos manda Mercado Pago en la URL
  const status = searchParams.get('status'); // 'success', 'failure', 'pending'
  const collectionStatus = searchParams.get('collection_status'); // Alternativa de MP (approved, rejected)

  useEffect(() => {
    async function confirmarReserva() {
      // 1. Validamos si el pago fue aprobado por Mercado Pago
      const pagoAprobado = status === 'success' || collectionStatus === 'approved';

      if (!pagoAprobado) {
        setExito(false);
        setMensaje('El pago no pudo ser procesado o fue rechazado. Reintentá nuevamente.');
        setLoading(false);
        // Limpiamos la reserva pendiente si falló
        localStorage.removeItem('pending_reservation');
        return;
      }

      // 2. Si fue exitoso, recuperamos lo que dejamos anotado en Actividades.jsx
      const pendingData = localStorage.getItem('pending_reservation');
      
      if (!pendingData) {
        setExito(false);
        setMensaje('No se encontró ninguna reserva pendiente de confirmación.');
        setLoading(false);
        return;
      }

      try {
        const reservaInfo = JSON.parse(pendingData);

        // 3. Le pegamos a nuestro backend para asentar la reserva real
        // Reemplazá BASE_URL con tu URL correspondiente (ej: http://localhost:3000/api)
        const response = await fetch('http://localhost:3000/api/reservas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_usuario: reservaInfo.id_usuario,
            id_clase: reservaInfo.id_clase,
            tipo_pago: reservaInfo.tipo_pago, // 'TOTAL' o 'SEÑA'
            precio_total: reservaInfo.precio_total // Sirve para que el backend calcule el saldo
          })
        });

        const resultado = await response.json();

        if (resultado.ok) {
          setExito(true);
          setMensaje(resultado.mensaje || '¡Reserva confirmada con éxito!');
          // Limpiamos el localStorage ya que se procesó correctamente
          localStorage.removeItem('pending_reservation');
        } else {
          setExito(false);
          setMensaje(resultado.mensaje || 'Hubo un problema al registrar tu reserva en el sistema.');
        }

      } catch (error) {
        // Escenario 3: Si se cae la red justo al volver
        setExito(false);
        setMensaje('El servicio está interrumpido momentáneamente, pero tu pago fue procesado. Contactate con administración.');
      } finally {
        setLoading(false);
      }
    }

    confirmarReserva();
  }, [status, collectionStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#1a1a2e' }}>
      <div className="rounded-2xl p-6 w-full max-w-sm text-center shadow-xl" style={{ background: '#1e1e2e' }}>
        
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
            <p className="text-white text-base font-medium">{mensaje}</p>
          </div>
        )}

        {!loading && (
          <div>
            <span className="text-5xl block mb-4">{exito ? '✅' : '❌'}</span>
            <h2 className="text-xl font-semibold mb-3 text-white">
              {exito ? '¡Pago Exitoso!' : 'Hubo un inconveniente'}
            </h2>
            <p className="text-sm opacity-80 mb-6 text-white leading-relaxed">{mensaje}</p>
            
            <button 
              onClick={() => navigate('/actividades')} // Cambiá por tu ruta del panel principal
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