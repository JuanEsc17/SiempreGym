import React, { useState, useEffect } from 'react';
import { clasesService, reservasService } from '../services/apiReserva';
import './Actividades.css';
import yogaImg from '../assets/Yoga2.png';
import funcionalImg from '../assets/Funcional.png';
import pilatesImg from '../assets/Pilatesmq.png';

// ─── Tarjeta de cada clase ───────────────────────────
const imagenesClase = {
  yoga: yogaImg,
  pilates: pilatesImg,
  funcional: funcionalImg
};
function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-menu-icon">☰</div>
    </div>
  );
}

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
    <div className="date-selector">
      <button className="date-arrow" onClick={() => setOffset(o => o - 1)}>‹</button>
      {dias.map(d => (
        <button
          key={d.numero}
          className={`date-pill ${diaSeleccionado === d.dia ? 'active' : ''}`}
          onClick={() => onSeleccionar(d.dia)}
        >
          {d.dia} {d.numero}
        </button>
      ))}
      <button className="date-arrow" onClick={() => setOffset(o => o + 1)}>›</button>
    </div>
  );
}

function ClaseCard({ clase, onReservar }) {
  const imagen = imagenesClase[clase.actividad?.toLowerCase()] || imagenesClase.funcional;

  const diasMap = {
    lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
    jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb'
  };

  return (
    <div className="clase-card">
      <div className="clase-time">
        <span className="clase-dia">{diasMap[clase.dia] || clase.dia}</span>
        <span className="clase-hora">{clase.horario?.slice(0, 5)}</span>
        <span className="clase-duracion">{clase.duracion} min</span>
      </div>
      <div className="clase-body" style={{ backgroundImage: `url(${imagen})` }}>
        <div className="clase-overlay" />
        <div className="clase-content">
          <p className="clase-nombre">{clase.actividad}</p>
          <p className="clase-cupos">👤 {clase.cupos_disponibles} lugares disponibles</p>
        </div>
        <span className="reservar-label">Reservar</span>
        <button className="btn-reservar" onClick={onReservar}>+</button>
      </div>
    </div>
  );
}

// ─── Modal de detalle ────────────────────────────────
function ModalDetalle({ clase, onCerrar, onReservaExitosa }) {
  const [tipoPago, setTipoPago] = useState(null);
  const [usarCredito, setUsarCredito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [exito, setExito] = useState(false);

  // Cliente hardcodeado por ahora, después viene del login
  const CLIENTE_ID = 1;

  async function handleReservar() {
    setLoading(true);
    setMensaje(null);
    try {
      const pago = usarCredito ? 'CREDITO' : tipoPago;
      const resultado = await reservasService.crearReserva(CLIENTE_ID, clase.id_clase, pago);
      if (resultado.ok) {
        setExito(true);
        setMensaje(resultado.mensaje);
        setTimeout(() => onReservaExitosa(), 2000);
      } else {
        setMensaje(resultado.mensaje);
      }
    } catch (err) {
      setMensaje('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  function toggleCredito() {
    setUsarCredito(!usarCredito);
    setTipoPago(null);
  }

  const puedeReservar = usarCredito || tipoPago !== null;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Hero */}
        <div className="modal-hero">
          <button className="modal-close" onClick={onCerrar}>✕</button>
          <span className="modal-disponible">● Disponible</span>
          <h2 className="modal-titulo">{clase.actividad}</h2>
        </div>

        {/* Detalles */}
        <div className="modal-body">
          <p className="modal-section-title">ℹ Detalles de la actividad</p>

          <div className="modal-detalle-row">
            <span className="modal-label">FECHA</span>
            <span className="modal-valor">{clase.dia}</span>
          </div>
          <div className="modal-detalle-row">
            <span className="modal-label">HORARIO</span>
            <span className="modal-valor">{clase.horario?.slice(0, 5)} hs</span>
          </div>
          <div className="modal-detalle-row">
            <span className="modal-label">DURACIÓN</span>
            <span className="modal-valor">{clase.duracion} min</span>
          </div>
          <div className="modal-detalle-row">
            <span className="modal-label">CAPACIDAD</span>
            <span className="modal-valor">{clase.cupos_disponibles} / {clase.cupo_maximo} personas</span>
          </div>

          <p className="modal-spots">⚡ {clase.cupos_disponibles} lugares disponibles</p>

          {/* Mensaje resultado */}
          {mensaje && (
            <div className={`modal-mensaje ${exito ? 'exito' : 'error'}`}>
              {mensaje}
            </div>
          )}

          {/* Crédito */}
          <div className={`credito-row ${usarCredito ? 'selected' : ''}`} onClick={toggleCredito}>
            <div className="credito-info">
              <span className="credito-icon">🏷️</span>
              <div>
                <p className="credito-title">Usar crédito</p>
                <p className="credito-sub">2 créditos disponibles</p>
              </div>
            </div>
            <div className={`credito-check ${usarCredito ? 'checked' : ''}`} />
          </div>

          {/* Opciones de pago — solo si no usa crédito */}
          {!usarCredito && (
            <div className="pago-opciones">
              <p className="pago-titulo">Forma de pago</p>
              <div className="pago-grid">
                <div
                  className={`pago-opt ${tipoPago === 'TOTAL' ? 'selected' : ''}`}
                  onClick={() => setTipoPago('TOTAL')}
                >
                  <p className="pago-opt-nombre">Pago total</p>
                  <p className="pago-opt-monto">${clase.precio}</p>
                </div>
                <div
                  className={`pago-opt ${tipoPago === 'SEÑA' ? 'selected' : ''}`}
                  onClick={() => setTipoPago('SEÑA')}
                >
                  <p className="pago-opt-nombre">Seña 50%</p>
                  <p className="pago-opt-monto">${clase.precio / 2} ahora</p>
                  <p className="pago-opt-pendiente">${clase.precio / 2} pendiente</p>
                </div>
              </div>
            </div>
          )}

          {/* Botón reservar */}
          <button
            className="btn-confirmar"
            onClick={handleReservar}
            disabled={!puedeReservar || loading}
          >
            {loading ? 'Procesando...' : 'Reservar actividad'}
          </button>

        </div>
      </div>
    </div>
  );
}
function ModalReservas({ onCerrar }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const CLIENTE_ID = 1;

  const estadoColor = {
    CONFIRMADA: { bg: '#dcfce7', color: '#166534', texto: 'Confirmada' },
    CANCELADA: { bg: '#fee2e2', color: '#991b1b', texto: 'Cancelada' },
    PENDIENTE_PAGO: { bg: '#fef3c7', color: '#92400e', texto: 'Pendiente de pago' }
  };

  const pagoIcono = {
    PLAN: '📋 Plan mensual',
    CREDITO: '🏷️ Crédito',
    TOTAL: '💵 Pago total',
    SEÑA: '💳 Seña 50%'
  };

  useEffect(() => {
    reservasService.getMisReservas(CLIENTE_ID)
      .then(data => { if (data.ok) setReservas(data.data); })
      .finally(() => setLoading(false));
  }, []);

  const diasMap = {
    lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
    jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom'
  };

  const imagenesClaseModal = {
    yoga: yogaImg,
    pilates: pilatesImg,
    funcional: funcionalImg
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-reservas-card" onClick={e => e.stopPropagation()}>

        <div className="modal-reservas-header">
          <h2>Mis Reservas</h2>
          <button className="modal-close-white" onClick={onCerrar}>✕</button>
        </div>

        {loading && <p className="modal-reservas-loading">Cargando reservas...</p>}

        {!loading && reservas.length === 0 && (
          <div className="modal-reservas-empty">
            <p>📅</p>
            <p>No tenés reservas aún</p>
          </div>
        )}

        {!loading && reservas.length > 0 && (
          <div className="modal-reservas-lista">
            {reservas.map(r => {
              const est = estadoColor[r.estado] || estadoColor.CONFIRMADA;
              const img = imagenesClaseModal[r.actividad?.toLowerCase()] || funcionalImg;
              return (
                <div key={r.id_reserva} className="reserva-item">
                  <div className="reserva-img" style={{ backgroundImage: `url(${img})` }}>
                    <div className="reserva-img-overlay" />
                    <span className="reserva-actividad">{r.actividad}</span>
                  </div>
                  <div className="reserva-info">
                    <div className="reserva-info-top">
                      <div>
                        <p className="reserva-dia">{diasMap[r.dia] || r.dia}</p>
                        <p className="reserva-hora">{r.horario?.slice(0, 5)} hs</p>
                        <p className="reserva-duracion">{r.duracion} min</p>
                      </div>
                      <span className="reserva-estado" style={{ background: est.bg, color: est.color }}>
                        {est.texto}
                      </span>
                    </div>
                    <div className="reserva-info-bottom">
                      <span className="reserva-pago">{pagoIcono[r.tipo_pago] || r.tipo_pago}</span>
                      {r.saldo_pendiente > 0 && (
                        <span className="reserva-saldo">⚠ Saldo: ${r.saldo_pendiente}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────
function ActividadesPage() {
    const [clases, setClases] = useState([]);
    const [claseSeleccionada, setClaseSeleccionada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const nombresDias = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    const [diaSeleccionado, setDiaSeleccionado] = useState(
    nombresDias[new Date().getDay()]);
    const [mostrarReservas, setMostrarReservas] = useState(false);

  useEffect(() => {
    cargarClasesPorDia(diaSeleccionado);
  }, [diaSeleccionado]);

  async function cargarClasesPorDia(dia) {
    try {
      setLoading(true);
      const respuesta = await clasesService.getPorDia(dia);
      if (respuesta.ok) {
        setClases(respuesta.data);
      }
    } catch (err) {
      setError('Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-layout">
        <Sidebar />
        <div className="actividades-container">

        <div className="actividades-header">
            <h1>Actividades</h1>
        </div>

        <div className="actividades-top-cards">
        <div className="top-card purple-1" onClick={() => setMostrarReservas(true)}>
          <span>📅</span>
          <p>Reservas</p>
        </div>
        <div className="top-card purple-2">
          <span>📋</span>
          <p>Listas de espera</p>
        </div>
        <div className="top-card purple-3">
          <span>🏷️</span>
          <p>Créditos</p>
        </div>
        <div className="top-card dark">
          <p className="plan-title">Plan Mensual</p>
          <p className="plan-status">Activa</p>
        </div>
      </div>
    |<DateSelector
        diaSeleccionado={diaSeleccionado}
    onSeleccionar={setDiaSeleccionado}
    />
    {loading && <p className="loading-text">Cargando clases...</p>}
    {error && <p className="error-text">{error}</p>}

    {!loading && !error && (
        <>
          <h2 className="actividades-subtitle">Actividades Disponibles</h2>
          <div className="clases-grid">
            {clases.length === 0 ? (
              <p className="empty-text">No hay clases disponibles</p>
            ) : (
              clases.map(clase => (
                <ClaseCard
                  key={clase.id_clase}
                  clase={clase}
                  onReservar={() => setClaseSeleccionada(clase)}
                />
              ))
            )}
          </div>
        </>
      )}
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

export default ActividadesPage;