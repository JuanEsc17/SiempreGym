// frontend/src/pages/Renovaciones.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000/api';
const getUsuarioId = () => JSON.parse(localStorage.getItem('user'))?.id || null;

const IMAGENES_CLASE = {
  yoga:      new URL('../assets/tapete.jpeg',        import.meta.url).href,
  pilates:   new URL('../assets/pesa.png',    import.meta.url).href,
  funcional: new URL('../assets/pesa2.png',    import.meta.url).href,
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const apiFetch = (url, opts) => fetch(url, opts).then(r => r.json());
const formatPrecio = (n) => n != null ? `$${Number(n).toLocaleString('es-AR')}` : '—';
const formatCorta  = (iso) => {
  const [,m,d] = iso.split('-');
  return `${+d}/${+m}`;
};

// ─── Verificar ventana habilitada (cliente) ───────────────────
function estaEnVentana() {
  const hoy = new Date(); //const hoy = new Date('2026-07-05'); // FECHA SIMULADA
  const dia = hoy.getDate();
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  return dia >= (diasEnMes - 6) || (dia >= 1 && dia <= 10);
}

// ─── TarjetaRenovacion ────────────────────────────────────────
function TarjetaRenovacion({ renovacion, onRenovar }) {
  const img = IMAGENES_CLASE[renovacion.actividad?.toLowerCase()] 
              || IMAGENES_CLASE.funcional;

  const nombreMes = MESES[renovacion.mes - 1];
  const bloqueada = !renovacion.puede_renovar_ahora;

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl"
         style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Imagen + info actividad */}
      <div className="flex items-center gap-4 p-4"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Imagen */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img src={img} alt={renovacion.actividad}
               className="w-full h-full object-cover" />
        </div>

        {/* Info clase */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold m-0 capitalize" style={{ fontSize: '17px' }}>
              {renovacion.actividad}
            </h3>
            <span style={{
              background: 'rgba(138,11,210,0.2)', color: '#c084fc',
              fontSize: '10px', fontWeight: 'bold', padding: '2px 8px',
              borderRadius: 999, border: '1px solid rgba(138,11,210,0.3)'
            }}>
              Reserva mensual
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', margin: '0 0 2px' }}>
            📅 {renovacion.dia.charAt(0).toUpperCase() + renovacion.dia.slice(1)} {renovacion.horario?.slice(0,5)} hs
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
            Con {renovacion.nombre_profesor || 'Sin profesor asignado'}
          </p>
        </div>
      </div>

      {/* Detalle renovación */}
      <div className="grid grid-cols-2 gap-3 p-4"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Mes a renovar */}
        <div className="rounded-xl p-3"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px',
                      textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
            Mes a renovar
          </p>
          <p className="text-white font-bold m-0" style={{ fontSize: '14px' }}>
            📅 {nombreMes} {renovacion.anio}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '3px 0 0' }}>
            {renovacion.cantidad_clases} clase{renovacion.cantidad_clases !== 1 ? 's' : ''} incluidas
          </p>
        </div>

        {/* Total a pagar */}
        <div className="rounded-xl p-3"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px',
                      textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
            Total a pagar
          </p>
          <p className="font-bold m-0" style={{ fontSize: '22px', color: '#2dd4bf' }}>
            {formatPrecio(renovacion.monto)}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '3px 0 0' }}>
            Precio final
          </p>
        </div>
      </div>

      {/* Fechas */}
      <div className="px-4 pt-3 pb-1">
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px',
                    textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
          Fechas incluidas
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {renovacion.fechas?.map(f => (
            <span key={f} style={{
              background: 'rgba(138,11,210,0.15)', border: '1px solid rgba(138,11,210,0.3)',
              color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '600',
              padding: '3px 8px', borderRadius: '6px'
            }}>
              {formatCorta(f)}
            </span>
          ))}
        </div>
      </div>

      {/* Botón */}
      <div className="px-4 pb-4">
        {bloqueada ? (
          <div className="w-full py-3 rounded-xl text-center"
               style={{ background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>
              🔒 Fuera del período de renovación
            </p>
          </div>
        ) : (
          <button
            onClick={() => onRenovar(renovacion)}
            className="w-full py-3 rounded-xl text-white font-bold border-none cursor-pointer transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
            style={{ background: '#8A0BD2', fontSize: '14px',
                     boxShadow: '0 4px 20px rgba(138,11,210,0.35)' }}>
             🔁Renovar reserva
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Renovaciones (componente principal) ─────────────────────
export default function Renovaciones() {
  const navigate = useNavigate();
  const [renovaciones, setRenovaciones]   = useState([]);
  const [ventanaActiva, setVentanaActiva] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [procesando, setProcesando]       = useState(false);
  const [error, setError]                 = useState(null);

  useEffect(() => { cargarRenovaciones(); }, []);

  const cargarRenovaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const id = getUsuarioId();
      if (!id) return;
      const data = await apiFetch(`${BASE_URL}/renovaciones/${id}`);
      if (data.ok) {
        setRenovaciones(data.renovaciones);
        setVentanaActiva(data.ventana_activa);
      }
    } catch {
      setError('Error al cargar las renovaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRenovar = async (renovacion) => {
    setProcesando(true);
    try {
      const id_usuario = getUsuarioId();

      // 1. Verificar renovación
      const verificacion = await apiFetch(`${BASE_URL}/renovaciones/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_renovacion: renovacion.id_renovacion })
      });

      if (!verificacion.ok) {
        setError(verificacion.mensaje);
        return;
      }

      // 2. Guardar en localStorage para PaymentStatus
      localStorage.setItem('pendingReserva', JSON.stringify({
        tipo:          'mensual',
        id_renovacion: renovacion.id_renovacion,
        id_usuario,
        id_clase:      renovacion.id_clase,
        mes:           renovacion.mes,
        anio:          renovacion.anio,
        precio_total:  verificacion.monto
      }));

      // 3. Crear preferencia MP
      const pref = await apiFetch(`${BASE_URL}/payments/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoPago:    'mensual',
          descripcion: `Renovación ${renovacion.actividad} - ${MESES[renovacion.mes - 1]} ${renovacion.anio}`,
          precio:      verificacion.monto,
          id_usuario,
          id_clase:    renovacion.id_clase
        })
      });

      if (!pref?.init_point) {
        setError('El servicio de pago está momentáneamente interrumpido, reintentá más tarde');
        return;
      }

      // 4. Redirigir a MP
      window.location.href = pref.init_point;

    } catch {
      setError('Error al procesar la renovación');
    } finally {
      setProcesando(false);
    }
  };

  // ── Calcular días restantes para el header ──
  const hoy = new Date();
  const dia = hoy.getDate();
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const esUltimaSemana = dia >= (diasEnMes - 6);
  const mesSiguiente = hoy.getMonth() === 11 ? 0 : hoy.getMonth() + 1;
  const anioVenc = hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const fechaVenc = new Date(anioVenc, mesSiguiente, 10);
  const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen p-6 lg:px-12 lg:pt-10"
         style={{ background: '#12121f', fontFamily: 'system-ui,sans-serif' }}>

      {/* Header */}
      <header className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/actividades')}
                className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all hover:brightness-110"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '18px' }}>
          ←
        </button>
        <div>
          <h1 className="font-bold text-white m-0" style={{ fontSize: '26px' }}>
            Renovar Reservas Mensuales
          </h1>
        </div>
      </header>

      {/* Fuera de ventana */}
      {!ventanaActiva && renovaciones.length > 0 && (
        <div className="mb-6 rounded-2xl p-4 flex items-center gap-3"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '24px' }}>🔒</span>
          <div>
            <p className="text-white font-bold m-0" style={{ fontSize: '14px' }}>
              Fuera del período de renovación
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '3px 0 0' }}>
              Podés renovar durante la última semana del mes y hasta el día 10 del mes siguiente.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2"
             style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span>⚠️</span>
          <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24" style={{ opacity: 0.5 }}>
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4"
               style={{ borderColor: 'rgba(138,11,210,0.3)', borderTopColor: '#8A0BD2' }} />
          <p className="text-white text-sm">Cargando renovaciones...</p>
        </div>

      ) : renovaciones.length === 0 ? (
        <div className="text-center py-24 rounded-3xl"
             style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>✅</span>
          <p className="text-white font-bold m-0" style={{ fontSize: '16px' }}>
            No tenés renovaciones pendientes
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '8px' }}>
            Cuando realices una reserva mensual, aquí aparecerán tus renovaciones.
          </p>
        </div>

      ) : (
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          {renovaciones.map(r => (
            <TarjetaRenovacion
              key={r.id_renovacion}
              renovacion={r}
              onRenovar={handleRenovar}
            />
          ))}
        </div>
      )}

      {/* Overlay procesando */}
      {procesando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
             style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-8 text-center"
               style={{ background: '#1e1e2e', border: '1px solid rgba(138,11,210,0.3)' }}>
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
                 style={{ borderColor: 'rgba(138,11,210,0.3)', borderTopColor: '#8A0BD2' }} />
            <p className="text-white font-bold m-0">Procesando renovación...</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '6px 0 0' }}>
              Serás redirigido a Mercado Pago
            </p>
          </div>
        </div>
      )}
    </div>
  );
}