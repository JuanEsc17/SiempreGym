import React, { useState, useEffect } from 'react';
import yogaImg from '../assets/Yoga2.png';
import pilatesImg from '../assets/Pilatesmq.png';
import funcionalImg from '../assets/Funcional.png';

const BASE_URL = 'http://localhost:3001/api';
const CLIENTE_ID = 1;

const imagenesClase = {
  yoga: yogaImg,
  pilates: pilatesImg,
  funcional: funcionalImg
};

// ─── Sidebar ────────────────────────────────────────
function Sidebar() {
  return (
    <div className="fixed top-0 left-0 h-screen w-14 flex flex-col items-center pt-5 z-50"
      style={{ background: '#5B0672' }}>
      <span className="text-white text-2xl cursor-pointer">☰</span>
    </div>
  );
}

// ─── DateSelector ────────────────────────────────────
function DateSelector({ diaSeleccionado, onSeleccionar }) {
  const [offset, setOffset] = useState(0);
  const nombresDias = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  const dias = [];
  const hoy = new Date();

  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + offset + i);
    const dia = nombresDias[fecha.getDay()];
    const numero = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
    dias.push({ dia, numero });
  }

  return (
    <div className="flex items-center gap-2 mb-5 w-full">
      <button onClick={() => setOffset(o => o - 1)}
        className="text-white text-2xl opacity-70 hover:opacity-100 bg-transparent border-none cursor-pointer px-2">
        ‹
      </button>
      {dias.map(d => (
        <button
          key={d.numero}
          onClick={() => onSeleccionar(d.dia)}
          className={`flex-1 text-center py-2 rounded-lg text-xs cursor-pointer border-none transition-all
            ${diaSeleccionado === d.dia
              ? 'text-white font-medium'
              : 'text-white opacity-70 hover:opacity-100'}`}
          style={{
            background: diaSeleccionado === d.dia ? '#8A0BD2' : '#2d2d3a'
          }}>
          {d.dia} {d.numero}
        </button>
      ))}
      <button onClick={() => setOffset(o => o + 1)}
        className="text-white text-2xl opacity-70 hover:opacity-100 bg-transparent border-none cursor-pointer px-2">
        ›
      </button>
    </div>
  );
}

// ─── ClaseCard ───────────────────────────────────────
function ClaseCard({ clase, onReservar }) {
  const imagen = imagenesClase[clase.actividad?.toLowerCase()] || funcionalImg;
  const diasMap = {
    lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
    jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom'
  };

  const porcentaje = Math.round((clase.cupos_disponibles / clase.cupo_maximo) * 100);
  const colorBarra = porcentaje > 50 ? '#4ade80' : porcentaje > 20 ? '#f59e0b' : '#f87171';
  const labelCupos = porcentaje <= 20 ? '🔴 Casi lleno' : `👤 ${clase.cupos_disponibles} lugares disponibles`;

  return (
    <div className="rounded-2xl overflow-hidden flex h-28 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      style={{ 
        background: '#2d2d3a', 
        borderLeft: '4px solid #8A0BD2',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
      }}>
      <div className="flex flex-col justify-center px-3 min-w-[85px]">
        <span className="text-xs opacity-50 text-white">{diasMap[clase.dia] || clase.dia}</span>
        <span className="text-xl font-medium text-white leading-tight">{clase.horario?.slice(0, 5)}</span>
        <span className="text-xs opacity-50 text-white mt-1">{clase.duracion} min</span>
      </div>
      <div className="flex-1 relative overflow-hidden rounded-r-2xl"
        style={{ backgroundImage: `url(${imagen})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
        <div className="relative z-10 p-3 h-full flex flex-col justify-between">
          <p className="text-xl font-medium text-white capitalize">{clase.actividad}</p>
          <div>
            <p className="text-xs mb-1" style={{ color: colorBarra }}>{labelCupos}</p>
            <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="h-1 rounded-full transition-all"
                style={{ width: `${porcentaje}%`, background: colorBarra }} />
            </div>
          </div>
        </div>
        <span className="absolute bottom-3 right-12 z-10 text-xs text-white opacity-80">Reservar</span>
        <button onClick={onReservar}
          className="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xl border-none cursor-pointer transition-all hover:opacity-80 hover:scale-110"
          style={{ background: '#f59e0b', boxShadow: '0 2px 8px rgba(245,158,11,0.5)' }}>
          +
        </button>
      </div>
    </div>
  );
}

// ─── ModalDetalle ────────────────────────────────────
function ModalDetalle({ clase, onCerrar, onReservaExitosa }) {
  const [tipoPago, setTipoPago] = useState(null);
  const [usarCredito, setUsarCredito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [exito, setExito] = useState(false);

  async function handleReservar() {
    setLoading(true);
    setMensaje(null);
    try {
      const pago = usarCredito ? 'CREDITO' : tipoPago;
      if (!pago) { setMensaje('Debés elegir una forma de pago'); setLoading(false); return; }
      const response = await fetch(`${BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: CLIENTE_ID, id_clase: clase.id_clase, tipo_pago: pago })
      });
      const resultado = await response.json();
      if (resultado.ok) {
        setExito(true);
        setMensaje(resultado.mensaje);
        setTimeout(() => onReservaExitosa(), 2000);
      } else {
        setExito(false);
        setMensaje(resultado.mensaje);
      }
    } catch {
      setMensaje('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  function toggleCredito() {
    setUsarCredito(!usarCredito);
    setTipoPago(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onCerrar}>
      <div className="rounded-2xl overflow-hidden w-80 max-h-[90vh] overflow-y-auto"
        style={{ background: '#1e1e2e' }} onClick={e => e.stopPropagation()}>

        {/* Hero */}
        <div className="relative h-28 flex flex-col justify-end p-4"
          style={{ background: 'linear-gradient(135deg, #5B0672, #8A0BD2)' }}>
          <span className="absolute top-2 left-3 text-white text-xs px-3 py-1 rounded-full"
            style={{ background: '#16a34a' }}>● Disponible</span>
          <button onClick={onCerrar}
            className="absolute top-2 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs border-none cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.35)' }}>✕</button>
          <h2 className="text-xl font-medium text-white capitalize">{clase.actividad}</h2>
        </div>

        {/* Body */}
        <div className="p-4 rounded-t-2xl" style={{ background: '#f8f8f8' }}>
          <p className="text-sm font-medium text-gray-700 pb-2 border-b border-gray-200 mb-3">
            ℹ Detalles de la actividad
          </p>

          <div className="flex flex-col gap-2 mb-3">
            {[
              { label: 'FECHA', valor: clase.dia },
              { label: 'HORARIO', valor: `${clase.horario?.slice(0, 5)} hs` },
              { label: 'DURACIÓN', valor: `${clase.duracion} min` },
              { label: 'CAPACIDAD', valor: `${clase.cupos_disponibles} / ${clase.cupo_maximo} personas` }
            ].map(({ label, valor }) => (
              <div key={label} className="flex flex-col">
                <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-medium text-gray-800 capitalize">{valor}</span>
              </div>
            ))}
          </div>

          <p className="text-xs font-medium mb-3" style={{ color: '#16a34a' }}>
            ⚡ {clase.cupos_disponibles} lugares disponibles
          </p>

          {mensaje && (
            <div className={`p-2 rounded-lg text-xs mb-3 ${exito ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {mensaje}
            </div>
          )}

          {/* Crédito */}
          <div onClick={toggleCredito}
            className={`flex items-center justify-between p-3 rounded-xl border-2 mb-3 cursor-pointer transition-all
              ${usarCredito ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏷️</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Usar crédito</p>
                <p className="text-xs text-gray-500">2 créditos disponibles</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
              ${usarCredito ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
              {usarCredito && <span className="text-white text-xs">✓</span>}
            </div>
          </div>

          {/* Opciones de pago */}
          {!usarCredito && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Forma de pago</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'TOTAL', nombre: 'Pago total', monto: `$${clase.precio}`, extra: null },
                  { id: 'SEÑA', nombre: 'Seña 50%', monto: `$${clase.precio / 2} ahora`, extra: `$${clase.precio / 2} pendiente` }
                ].map(opt => (
                  <div key={opt.id} onClick={() => setTipoPago(opt.id)}
                    className={`border-2 rounded-xl p-3 cursor-pointer transition-all
                      ${tipoPago === opt.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}>
                    <p className="text-sm font-medium text-gray-800">{opt.nombre}</p>
                    <p className="text-xs text-gray-500 mt-1">{opt.monto}</p>
                    {opt.extra && <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>{opt.extra}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleReservar}
            disabled={loading || (!usarCredito && !tipoPago)}
            className="w-full py-3 rounded-xl text-white font-medium text-sm border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#14b8a6' }}>
            {loading ? 'Procesando...' : 'Reservar actividad'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ModalReservas ───────────────────────────────────
function ModalReservas({ onCerrar }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const estadoColor = {
    CONFIRMADA: { bg: 'bg-green-100', color: 'text-green-800', texto: 'Confirmada' },
    CANCELADA: { bg: 'bg-red-100', color: 'text-red-800', texto: 'Cancelada' },
    PENDIENTE_PAGO: { bg: 'bg-yellow-100', color: 'text-yellow-800', texto: 'Pendiente de pago' }
  };

  const pagoIcono = {
    PLAN: '📋 Plan mensual',
    CREDITO: '🏷️ Crédito',
    TOTAL: '💵 Pago total',
    SEÑA: '💳 Seña 50%'
  };

  const diasMap = {
    lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
    jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom'
  };

  useEffect(() => {
    fetch(`${BASE_URL}/reservas/usuario/${CLIENTE_ID}`)
      .then(r => r.json())
      .then(data => { if (data.ok) setReservas(data.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onCerrar}>
      <div className="rounded-2xl overflow-hidden w-[500px] max-h-[80vh] flex flex-col"
        style={{ background: '#1e1e2e' }} onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-5 rounded-t-2xl"
          style={{ background: 'linear-gradient(135deg, #5B0672, #8A0BD2)' }}>
          <h2 className="text-lg font-medium text-white">Mis Reservas</h2>
          <button onClick={onCerrar}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs border-none cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.3)' }}>✕</button>
        </div>

        <div className="overflow-y-auto p-4 flex flex-col gap-3">
          {loading && <p className="text-center py-10 text-white opacity-60">Cargando reservas...</p>}
          {!loading && reservas.length === 0 && (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-white opacity-60">No tenés reservas aún</p>
            </div>
          )}
          {!loading && reservas.map(r => {
            const est = estadoColor[r.estado] || estadoColor.CONFIRMADA;
            const img = imagenesClase[r.actividad?.toLowerCase()] || funcionalImg;
            return (
              <div key={r.id_reserva} className="rounded-xl overflow-hidden flex h-24"
                style={{ background: '#2d2d3a' }}>
                <div className="w-28 relative flex-shrink-0"
                  style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} />
                  <span className="relative z-10 text-white text-sm font-medium p-2 capitalize block">{r.actividad}</span>
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs opacity-50 text-white capitalize">{diasMap[r.dia] || r.dia}</p>
                      <p className="text-lg font-medium text-white leading-tight">{r.horario?.slice(0, 5)} hs</p>
                      <p className="text-xs opacity-50 text-white">{r.duracion} min</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${est.bg} ${est.color}`}>
                      {est.texto}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-60 text-white">{pagoIcono[r.tipo_pago] || r.tipo_pago}</span>
                    {r.saldo_pendiente > 0 && (
                      <span className="text-xs" style={{ color: '#f59e0b' }}>⚠ Saldo: ${r.saldo_pendiente}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────
export default function Actividades() {
  const [clases, setClases] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [mostrarReservas, setMostrarReservas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nombresDias = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  const [diaSeleccionado, setDiaSeleccionado] = useState(nombresDias[new Date().getDay()]);

  useEffect(() => {
    cargarClasesPorDia(diaSeleccionado);
  }, [diaSeleccionado]);

  async function cargarClasesPorDia(dia) {
    try {
      setLoading(true);
      const diasMap = {
        'DOM': 'domingo', 'LUN': 'lunes', 'MAR': 'martes',
        'MIE': 'miercoles', 'JUE': 'jueves', 'VIE': 'viernes', 'SAB': 'sabado'
      };
      const response = await fetch(`${BASE_URL}/clases/por-dia?dia=${dia}`);
      const data = await response.json();
      if (data.ok) setClases(data.data);
    } catch {
      setError('Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#1a1a2e' }}>
      <Sidebar />
      <div className="flex-1 pl-20 pr-6 py-6">

        {/* Header */}
        <div className="border-b pb-3 mb-5" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <h1 className="text-3xl font-medium text-white">Actividades</h1>
        </div>

        {/* Top cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div onClick={() => setMostrarReservas(true)}
            className="flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:opacity-85 transition-opacity"
            style={{ background: '#5B0672' }}>
            <span className="text-2xl">📅</span>
            <p className="text-sm font-medium text-white">Reservas</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:opacity-85 transition-opacity"
            style={{ background: '#8A0BD2' }}>
            <span className="text-2xl">📋</span>
            <p className="text-sm font-medium text-white">Listas de espera</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:opacity-85 transition-opacity"
            style={{ background: '#AF50E5' }}>
            <span className="text-2xl">🏷️</span>
            <p className="text-sm font-medium text-white">Créditos</p>
          </div>
          <div className="flex flex-col justify-center p-4 rounded-xl"
            style={{ background: '#2d2d3a' }}>
            <p className="text-base font-medium text-white">Plan Mensual</p>
            <p className="text-xs mt-1" style={{ color: '#4ade80' }}>Activa</p>
          </div>
        </div>

        {/* Date selector */}
        <DateSelector diaSeleccionado={diaSeleccionado} onSeleccionar={setDiaSeleccionado} />

        {/* Clases */}
        <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Actividades Disponibles</p>

        {loading && <p className="text-center py-10" style={{ color: 'rgba(255,255,255,0.6)' }}>Cargando clases...</p>}
        {error && <p className="text-center py-10" style={{ color: '#f87171' }}>{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-3">
            {clases.length === 0
              ? <p className="text-center py-10 col-span-2" style={{ color: 'rgba(255,255,255,0.6)' }}>No hay clases disponibles</p>
              : clases.map(clase => (
                <ClaseCard
                  key={clase.id_clase}
                  clase={clase}
                  onReservar={() => setClaseSeleccionada(clase)}
                />
              ))
            }
          </div>
        )}

        {/* Modales */}
        {claseSeleccionada && (
          <ModalDetalle
            clase={claseSeleccionada}
            onCerrar={() => setClaseSeleccionada(null)}
            onReservaExitosa={() => {
              setClaseSeleccionada(null);
              cargarClasesPorDia(diaSeleccionado);
            }}
          />
        )}

        {mostrarReservas && (
          <ModalReservas onCerrar={() => setMostrarReservas(false)} />
        )}

      </div>
    </div>
  );
}