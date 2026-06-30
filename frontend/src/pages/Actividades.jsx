import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import yogaImg from '../assets/Yoga2.png';
import pilatesImg from '../assets/Pilatesmq.png';
import funcionalImg from '../assets/Funcional.png';

//lol q largo
const getUsuarioId = () => JSON.parse(localStorage.getItem('user'))?.id || null;
const BASE_URL   = 'http://localhost:3000/api';
const id_usuario = getUsuarioId();

const IMAGENES_CLASE = { yoga: yogaImg, pilates: pilatesImg, funcional: funcionalImg };
const NOMBRES_DIAS   = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB'];
const MESES          = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MESES_CORTO    = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ─── Helpers ─────────────────────────────────────────────────────
const fechaISO = (d) => {
  const año = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const día = String(d.getDate()).padStart(2, '0');
  return `${año}-${mes}-${día}`;
};
const formatPrecio = (n) => n != null ? `$${Number(n).toLocaleString('es-AR')}` : '—';
const formatCorta  = (iso) => { const [,m,d]=iso.split('-'); return `${+d} ${MESES_CORTO[+m-1]}`; };
const fP = formatPrecio; 
const apiFetch = (url, opts) => fetch(url, opts).then(r => r.json());

//Modicacion alert
function Toast({ mensaje, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, []);
  return (
    <div style={{
      position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
      background:'#1e1e2e', border:'1px solid rgba(16,185,129,0.4)',
      borderLeft:'4px solid #10b981', borderRadius:14, padding:'14px 20px',
      color:'white', fontSize:14, fontWeight:500, zIndex:9999,
      boxShadow:'0 8px 32px rgba(0,0,0,0.4)', maxWidth:400, textAlign:'center',
      animation:'slideUp 0.3s ease'
    }}>
      ✅ {mensaje}
    </div>
  );
}

// ─── DateSelector ─────────────────────────────────────────────────
// Ahora trackea el Date real, no solo el nombre del día
// Limita el desplazamiento a un máximo de 2 meses (60 días aproximadamente)
function DateSelector({ fechaSeleccionada, onSeleccionar }) {
  const [offset, setOffset] = useState(0);
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  
  // Límite: 60 días desde hoy (aproximadamente 2 meses)
  const LIMITE_DIAS = 60;
  const fechaLimite = new Date(hoy);
  fechaLimite.setDate(fechaLimite.getDate() + LIMITE_DIAS);

  // Calcular la fecha del primer día mostrado
  const fechaPrimerDia = new Date(hoy);
  fechaPrimerDia.setDate(fechaPrimerDia.getDate() + offset);

  const dias = Array.from({length:7},(_,i)=>{
    const f = new Date(hoy); f.setDate(hoy.getDate()+offset+i);
    return { label:NOMBRES_DIAS[f.getDay()], numero:`${f.getDate()}/${f.getMonth()+1}`, fechaObj: new Date(f) };
  });

  const isSelected = (d) => fechaISO(d.fechaObj) === fechaISO(fechaSeleccionada);
  
  // Botón anterior deshabilitado si estamos al inicio
  const puedeRetroceder = offset > 0;
  
  // Botón siguiente deshabilitado si la próxima semana excede el límite
  const proximaFecha = new Date(fechaPrimerDia);
  proximaFecha.setDate(proximaFecha.getDate() + 7);
  const puedeAvanzar = proximaFecha <= fechaLimite;

  return (
    <div className="flex items-center gap-1 mb-6 bg-white/5 p-2 rounded-2xl border border-white/5">
      <button onClick={()=>setOffset(o=>Math.max(0,o-7))} disabled={!puedeRetroceder}
              className="text-white text-xl hover:bg-white/10 rounded-full w-9 h-9 border-none cursor-pointer flex-shrink-0 disabled:opacity-20">‹</button>
      {dias.map(d=>(
        <button key={fechaISO(d.fechaObj)}
                onClick={()=>onSeleccionar(d.label, d.fechaObj)}
                className="flex-1 text-center py-2.5 rounded-xl text-xs cursor-pointer border-none transition-all duration-200"
                style={{ background: isSelected(d)?'#8A0BD2':'transparent', color: isSelected(d)?'white':'rgba(255,255,255,0.4)' }}>
          <div className="font-bold">{d.label}</div>
          <div className="text-[10px] opacity-70">{d.numero}</div>
        </button>
      ))}
      <button onClick={()=>setOffset(o=>o+7)} disabled={!puedeAvanzar}
              className="text-white text-xl hover:bg-white/10 rounded-full w-9 h-9 border-none cursor-pointer flex-shrink-0 disabled:opacity-20">›</button>
    </div>
  );
}

// ─── ClaseCard ────────────────────────────────────────────────────
function ClaseCard({ clase, fechaSeleccionada, onReservar }) {
  const img         = IMAGENES_CLASE[clase.actividad?.toLowerCase()] || funcionalImg;
  const cuposLibres = clase.cupos_disponibles ?? 0;
  const estaLlena   = cuposLibres === 0;
  const pct         = Math.round((cuposLibres / clase.cupo_maximo) * 100);
  const colorBarra  = pct > 50 ? '#4ade80' : pct > 20 ? '#f59e0b' : '#f87171';

  const ahora      = new Date();
  const hoyISO     = fechaISO(ahora);
  const fechaClase = fechaISO(fechaSeleccionada);
  let yaInicio = false;
  if (fechaClase < hoyISO) {
    yaInicio = true;
  } else if (fechaClase === hoyISO) {
    const [h, m]   = clase.horario.split(':').map(Number);
    const minClase = h * 60 + m;
    const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
    yaInicio = minAhora >= minClase;
  }

  const deshabilitada = yaInicio || clase.cancelada;
  const borderColor  = deshabilitada ? '#374151' : '#8A0BD2';
  const overlayColor = deshabilitada ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.58)';

  return (
    <div
      onClick={deshabilitada ? undefined : onReservar}
      className={`group rounded-2xl overflow-hidden flex h-36 transition-all duration-300 shadow-xl relative
        ${deshabilitada ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
      style={{ background:'#252535', borderLeft:`5px solid ${borderColor}` }}>

      {clase.cancelada ? (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow"
             style={{background:'#374151', color:'#9ca3af'}}>
          ❌ Clase cancelada
        </div>
      ) : yaInicio ? (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow"
             style={{background:'#374151', color:'#9ca3af'}}>
          🔒 Clase iniciada
        </div>
      ) : null}
      {!yaInicio && !clase.cancelada && estaLlena && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium"
             style={{background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)'}}>
          📅 Mensual c/ espera
        </div>
      )}

      <div className="flex flex-col justify-center px-4 min-w-[96px] flex-shrink-0 bg-black/20">
        <span className="text-[9px] uppercase tracking-widest text-white/40">{clase.dia}</span>
        <span className="text-2xl font-bold text-white">{clase.horario?.slice(0,5)}</span>
        <span className="text-[10px] text-white/40">{clase.duracion} min</span>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center transition-all"
             style={{ backgroundImage:`url(${img})` }}>
          <div className="absolute inset-0 transition-colors duration-300 group-hover:opacity-60"
               style={{ background: overlayColor }} />
        </div>
        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          <h3 className="text-xl font-bold text-white capitalize m-0 leading-tight drop-shadow">{clase.actividad}</h3>
          <div className="flex items-end justify-between">
            <div className="w-2/3">
              {estaLlena ? (
                <>
                  <p className="text-[10px] mb-1 text-red-400 font-medium">Sin cupo este día</p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.1)'}}>
                    <div className="h-full" style={{width:'0%', background:'#f87171'}} />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[10px] mb-1 font-medium" style={{color:colorBarra}}>
                    {pct<=20?'🔥 ¡Últimos lugares!':`👤 ${cuposLibres} libre${cuposLibres!==1?'s':''}`}
                  </p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.1)'}}>
                    <div className="h-full transition-all duration-700" style={{width:`${pct}%`, background:colorBarra}} />
                  </div>
                </>
              )}
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all group-hover:scale-110 group-hover:rotate-90"
                 style={{background:'#8A0BD2', fontSize:'20px', lineHeight:'1'}}>
              +
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OpcionPago ───────────────────────────────────────────────────
function OpcionPago({ icono, titulo, subtitulo, precio, seleccionado, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
            className="w-full text-left p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 mb-2 block"
            style={{
              background: seleccionado?'rgba(138,11,210,0.15)':'rgba(255,255,255,0.03)',
              borderColor: seleccionado?'#8A0BD2':disabled?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.1)',
              opacity: disabled?0.4:1,
              cursor: disabled?'not-allowed':'pointer',
            }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span style={{fontSize:'22px'}}>{icono}</span>
          <div>
            <p className="text-white font-bold text-sm m-0 leading-tight">{titulo}</p>
            <p className="text-xs m-0 mt-0.5" style={{color:'rgba(255,255,255,0.45)'}}>{subtitulo}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white font-bold text-sm m-0">{precio}</p>
          {seleccionado && <span className="text-[10px]" style={{color:'#a855f7'}}>✓ elegida</span>}
        </div>
      </div>
    </button>
  );
}

// ─── ModalDetalle ─────────────────────────────────────────────────
function ModalDetalle({ clase, fechaSeleccionada, onCerrar, onReservaExitosa, onToast }) {
  const navigate = useNavigate(); 
  const [modo, setModo]             = useState('INDIVIDUAL');
  const [paso, setPaso]             = useState('cargando');
  // 'cargando' | 'seleccionar_pago' | 'preview_mensual' | 'lista_espera' | 'lista_espera_mensual' | 'error'
  const [tipoPago, setTipoPago]     = useState(null);
  const [datosMensual, setDatosMensual] = useState(null);
  const [montoPrecio, setMontoPrecio]   = useState(null);
  const [errorMsg, setErrorMsg]         = useState(null);
  const [procesando, setProcesando]     = useState(false);
  const [idInstancia, setIdInstancia]       = useState(null);
  const [puedeUsarSena, setPuedeUsarSena]   = useState(true);
  const [creditosUsuario, setCreditosUsuario] = useState(0);
  const [tieneRenovacion, setTieneRenovacion] = useState(false);

  const PRECIO_BASE    = clase.precio || 2500;
  const CREDITOS_USER  = 2; // TODO: traer del contexto de autenticación
  const cuposLibres    = Math.max(0, clase.cupo_maximo - (clase.cantidad_inscriptos||0));

  useEffect(() => { setTipoPago(null); setErrorMsg(null); verificar(); }, [modo]);

  const verificar = async () => {
  setPaso('cargando');

  if (modo === 'INDIVIDUAL') {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const limite = new Date(hoy); limite.setDate(hoy.getDate() + 7);
    const elegida = new Date(fechaSeleccionada); elegida.setHours(0,0,0,0);
    if (elegida > limite) {
      setErrorMsg('Las reservas individuales solo pueden realizarse con hasta 7 días de anticipación. Elegí una fecha más cercana o usá el pase mensual.');
      setPaso('error');
      return;
    }
  }
  if (modo === 'MENSUAL') {
    const hoy = new Date();
    const dia = hoy.getDate();
    const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const estaEnVentana = dia >= (diasEnMes - 6) || (dia >= 1 && dia <= 10);
    console.log('dia:', dia);
    console.log('diasEnMes:', diasEnMes);
    console.log('estaEnVentana:', estaEnVentana);
    if (estaEnVentana) {
      try {
        const id_usuario = getUsuarioId();
        const mes = fechaSeleccionada.getMonth() + 1;
        const anio = fechaSeleccionada.getFullYear();
        console.log('chequeando renovacion para:', id_usuario, clase.id_clase, mes, anio);


        const check = await apiFetch(
          `${BASE_URL}/renovaciones/tiene-pendiente/${id_usuario}/${clase.id_clase}/${mes}/${anio}`
        );
        console.log('resultado check:', check);

        if (check.ok && check.tiene) {
          setTieneRenovacion(true);
          setPaso('tiene_renovacion');
          return;
        }
      } catch {
        console.log('error en chequeo:', e);
      }
    }
  }
  try {
    const id_usuario = getUsuarioId();
    const body = modo === 'INDIVIDUAL'
      ? { id_usuario, id_clase: clase.id_clase, fecha_clase: fechaISO(fechaSeleccionada) }
      : { id_usuario, id_clase: clase.id_clase, mes: fechaSeleccionada.getMonth() + 1, anio: fechaSeleccionada.getFullYear() };

    const data = await apiFetch(`${BASE_URL}/reservas/verificar-${modo.toLowerCase()}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });

    // ─── FIX: unificar todos los status "OK" de backend ──────────────
    const STATUS_OK = [
      'LISTO_PARA_RESERVAR',       // por si se usa en el futuro
      'LISTO_PARA_PAGAR',          // ídem
      'DISPONIBILIDAD_OK',         // ← individual con cupo
      'LISTO_PARA_RESERVAR_MES',   // ← mensual con cupo
    ];

    if (STATUS_OK.includes(data.status)) {
      // FIX: individual usa 'precio_base', mensual usa 'monto'
      setMontoPrecio(data.precio_base ?? data.monto);

      if (modo === 'INDIVIDUAL') {
        setIdInstancia(data.id_instancia);
        setPuedeUsarSena(data.puede_usar_sena);
        setCreditosUsuario(data.creditos_usuario);
        setPaso('seleccionar_pago');
      } else {
        setDatosMensual(data);
        setPaso('preview_mensual');
      }

    } else if (data.status === 'CLASE_LLENA') {
      setPaso('sin_cupo');

    } else if (
      data.status === 'SIN_CUPO_DISPONIBLE' ||  // ← FIX: mensual sin cupo
      data.status?.includes('LISTA_ESPERA')      // por compatibilidad futura
    ) {
      setPaso('lista_espera_mensual');

    } else {
      setErrorMsg(data.mensaje || 'No se puede procesar la solicitud');
      setPaso('error');
    }

  } catch {
    setErrorMsg('Error al conectar con el servidor');
    setPaso('error');
  }
};

const handleConfirmar = async () => {
  if (modo === 'INDIVIDUAL' && !tipoPago) return;
  setProcesando(true);

  const id_usuario = getUsuarioId();

  try {
    // ══ FLUJO 1: Crédito — llamada directa, sin Mercado Pago ══
    if (tipoPago === 'CREDITO') {
      const data = await apiFetch(`${BASE_URL}/reservas/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario,
          id_clase: clase.id_clase,
          id_instancia: idInstancia,
          fecha_clase: fechaISO(fechaSeleccionada),
          tipo_pago: 'CREDITO',
          precio_total: 0
        })
      });
      if (data.ok) { onToast(data.mensaje); onReservaExitosa(); }
      else { setErrorMsg(data.mensaje); setPaso('error'); }
      return;
    }

    // ══ FLUJO 2: Individual con tarjeta (TOTAL o SEÑA) — redirige a MP ══
    if (modo === 'INDIVIDUAL') {
      const montoACobrar = tipoPago === 'SEÑA' ? montoPrecio / 2 : montoPrecio;

      // Guardamos en localStorage para recuperarlo en PaymentStatus después del pago
      localStorage.setItem('pendingReserva', JSON.stringify({
        tipo: 'individual',
        id_usuario,
        id_clase: clase.id_clase,
        id_instancia: idInstancia,
        fecha_clase: fechaISO(fechaSeleccionada),
        tipo_pago: tipoPago === 'SEÑA' ? 'sena' : 'total',// mod para que entineda sena
        precio_total: montoACobrar
      }));

      const pref = await apiFetch(`${BASE_URL}/payments/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoPago: tipoPago === 'SEÑA' ? 'sena' : 'total',
          descripcion: `${clase.actividad} - ${fechaISO(fechaSeleccionada)}`,
          precio: montoACobrar,
          id_usuario,
          id_clase: clase.id_clase,
          id_instancia: idInstancia,
          fecha_clase: fechaISO(fechaSeleccionada)
        })
      });

      if (!pref || pref.error || !pref.init_point) {
        setErrorMsg(pref?.error || 'El servicio para realizar el pago está interrumpido momentáneamente, reintente más tarde');
        setPaso('error');
        return;
      }

      window.location.href = pref.init_point; // redirige a Mercado Pago
      return;
    }

    // ══ FLUJO 3: Mensual con tarjeta — redirige a MP ══
    if (modo === 'MENSUAL') {
      
      localStorage.setItem("pendingReserva", JSON.stringify({
          tipo: 'mensual',
          id_usuario,
          id_clase:clase.id_clase,
          fechas: datosMensual.fechas,
          precio_total: datosMensual.monto
        }));

      const pref = await apiFetch(`${BASE_URL}/payments/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoPago: 'mensual',
          descripcion: `Reserva Mensual - ${clase.actividad}`,
          precio: datosMensual.monto,
          id_usuario,
          id_clase: clase.id_clase
        })
      });

      if (!pref || pref.error || !pref.init_point) {
        setErrorMsg(pref?.error || 'El servicio para realizar el pago está interrumpido momentáneamente, reintente más tarde');
        setPaso('error');
        return;
      }

      window.location.href = pref.init_point;
}

  } catch {
    setErrorMsg('El servicio para realizar el pago está interrumpido momentáneamente, reintente más tarde');
    setPaso('error');
  } finally {
    setProcesando(false);
  }
};

  const handleListaEspera = async () => {
  setProcesando(true);
  try {
    const res = await fetch(`${BASE_URL}/lista-espera`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idUsuario: getUsuarioId(),
        idClase: clase.id_clase,
        tipoReserva: 'mensual'
      })
    });
    const data = await res.json();
    if (res.ok) {
      onToast(`¡Anotado en la lista de espera! Posición #${data.posicion}`);
      onReservaExitosa();
    } else {
      setErrorMsg(data.error || data.mensaje || 'No se pudo anotar en la lista de espera.');
      setPaso('error');
    }
  } catch {
    setErrorMsg('Error al anotarse');
    setPaso('error');
  } finally {
    setProcesando(false);
  }
};

  // ── Render del contenido según el paso ──
  const renderContenido = () => {
    if (paso==='cargando') return (
      <div className="flex flex-col items-center py-10">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mb-4"
             style={{borderColor:'rgba(138,11,210,0.3)', borderTopColor:'#8A0BD2'}}/>
        <p style={{color:'rgba(255,255,255,0.4)', fontSize:'13px'}}>Verificando disponibilidad...</p>
      </div>
    );

    if (paso==='error') return (
      <div className="rounded-2xl p-4 text-center" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)'}}>
        <span style={{fontSize:'36px', display:'block', marginBottom:'8px'}}>⚠️</span>
        <p style={{color:'#f87171', fontSize:'13px', margin:0}}>{errorMsg}</p>
      </div>
    );

    if (paso==='seleccionar_pago') {
      const precio = montoPrecio||PRECIO_BASE;
      return (
        <div>
          <p style={{color:'rgba(255,255,255,0.4)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px'}}>
            Elegí cómo pagar
          </p>
          <OpcionPago icono="💳" titulo="Pago total"
            subtitulo="Abonás el total ahora vía Mercado Pago"
            precio={formatPrecio(precio)}
            seleccionado={tipoPago==='TOTAL'} onClick={()=>setTipoPago('TOTAL')} />
          <OpcionPago icono="🤝" titulo="Pago con seña"
            subtitulo={puedeUsarSena
              ? `${fP(montoPrecio/2)} ahora + ${fP(montoPrecio/2)} el día de la clase`
              : 'No disponible el mismo día de la clase'}
              precio={`50% = ${fP(montoPrecio/2)}`}
              seleccionado={tipoPago === 'SEÑA'}
              onClick={() => setTipoPago('SEÑA')}
              disabled={!puedeUsarSena}   // ← viene del backend
              />
          <OpcionPago icono="🏷️" titulo="Usar crédito"
            subtitulo={creditosUsuario > 0
              ? `Tenés ${creditosUsuario} crédito${creditosUsuario !== 1 ? 's' : ''}`
              : 'Sin créditos disponibles'}
              precio={`${creditosUsuario} crédito${creditosUsuario !== 1 ? 's' : ''}`}
              seleccionado={tipoPago === 'CREDITO'}
              onClick={() => setTipoPago('CREDITO')}
              disabled={creditosUsuario === 0}   // ← viene del backend
            />
        </div>
      );
    }

    if (paso==='preview_mensual') {
      const d         = datosMensual||{};
      const fechas    = d.fechas||[];
      const original  = d.monto_original||montoPrecio||0;
      const final     = d.monto||montoPrecio||0;
      const desc      = d.descuento||0;
      const mesNombre = MESES[fechaSeleccionada.getMonth()];
      return (
        <div>
          <div className="rounded-2xl p-4 mb-3" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-bold text-sm m-0">📅 {mesNombre} {fechaSeleccionada.getFullYear()}</p>
                <p style={{color:'rgba(255,255,255,0.4)', fontSize:'11px', margin:0}}>{fechas.length} clases incluidas</p>
              </div>
              {desc>0 && (
                <span style={{background:'rgba(16,185,129,0.15)', color:'#34d399', border:'1px solid rgba(16,185,129,0.3)',
                              fontSize:'11px', fontWeight:'bold', padding:'4px 10px', borderRadius:'999px'}}>
                  -{desc}% OFF
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {fechas.map(f=>(
                <span key={f} style={{background:'rgba(138,11,210,0.2)', border:'1px solid rgba(138,11,210,0.4)',
                                      color:'white', fontSize:'10px', fontWeight:'600', padding:'4px 10px', borderRadius:'8px'}}>
                  ✓ {formatCorta(f)}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
            {desc>0 && (
              <>
                <div className="flex justify-between mb-1" style={{fontSize:'13px'}}>
                  <span style={{color:'rgba(255,255,255,0.4)'}}>Precio regular</span>
                  <span style={{color:'rgba(255,255,255,0.4)', textDecoration:'line-through'}}>{formatPrecio(original)}</span>
                </div>
                <div className="flex justify-between mb-2" style={{fontSize:'13px'}}>
                  <span style={{color:'#34d399'}}>Descuento ({desc}%)</span>
                  <span style={{color:'#34d399'}}>− {formatPrecio(original-final)}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-white font-bold" style={{fontSize:'14px'}}>Total a pagar</span>
              <span style={{fontSize:'24px', fontWeight:'bold', color:'#2dd4bf'}}>{formatPrecio(final)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (paso === 'sin_cupo') {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
           style={{background:'rgba(239,68,68,0.1)'}}>
        <span style={{fontSize:'32px'}}>⚠️</span>
      </div>
      <h3 className="text-white font-bold m-0 mb-2" style={{fontSize:'16px'}}>
        Sin cupos disponibles
      </h3>
      <p style={{color:'rgba(255,255,255,0.55)', fontSize:'13px', lineHeight:'1.6'}}>
        No hay lugar para esta clase en la fecha elegida. Probá otro horario o consultá el pase mensual.
      </p>
    </div>
  );
}

if (paso === 'lista_espera_mensual') {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
           style={{background:'rgba(245,158,11,0.15)'}}>
        <span style={{fontSize:'36px'}}>⏳</span>
      </div>
      <h3 className="text-white font-bold m-0 mb-2" style={{fontSize:'16px'}}>
        No hay cupos para todo el mes
      </h3>
      <p style={{color:'rgba(255,255,255,0.55)', fontSize:'13px', lineHeight:'1.6', marginBottom:'16px'}}>
        Algunas clases del período no tienen cupos. Te notificamos si se libera disponibilidad completa.
      </p>
    </div>
  );
}
if (paso === 'tiene_renovacion') {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
           style={{ background: 'rgba(138,11,210,0.15)' }}>
        <span style={{ fontSize: '32px' }}>🔄</span>
      </div>
      <h3 className="text-white font-bold m-0 mb-2" style={{ fontSize: '16px' }}>
        Tenés una renovación pendiente
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
        Ya tenés un lugar reservado para <strong style={{ color: 'white' }}>{clase.actividad}</strong> en este mes.
      </p>
      <div className="rounded-xl p-3"
           style={{ background: 'rgba(138,11,210,0.08)', border: '1px solid rgba(138,11,210,0.2)' }}>
        <p style={{ color: '#c084fc', fontSize: '12px', margin: 0 }}>
          💡 Renovar es más conveniente — mantenés tu lugar asegurado para todo el mes.
        </p>
      </div>
    </div>
  );
}
    return null;
  };

  // ── Render del botón según el paso ──
  const renderBoton = () => {
    if (paso==='cargando') return null;
    const base = "w-full py-3.5 rounded-2xl text-white font-bold border-none cursor-pointer transition-all active:scale-95 mt-4";
    if (paso === 'sin_cupo')
  return 

if (paso === 'lista_espera_mensual')
  return <button onClick={handleListaEspera} disabled={procesando} className={base}
           style={{background:procesando?'rgba(245,158,11,0.4)':'#f59e0b', color:'#451a00'}}>
           {procesando?'Anotando...':'⏳ Ingresar a la lista de espera'}
         </button>;
    if (paso==='seleccionar_pago') {
  const ok = tipoPago && !procesando;
  return <button onClick={handleConfirmar} disabled={!ok} className={base}
           style={{background:ok?'#10b981':'rgba(255,255,255,0.07)', color:ok?'white':'rgba(255,255,255,0.3)',
                   cursor:ok?'pointer':'not-allowed', boxShadow:ok?'0 4px 20px rgba(16,185,129,0.3)':'none'}}>
           {procesando?'Procesando...'
            :tipoPago?'Confirmar reserva individual →'
            :'Seleccioná un método de pago'}
         </button>;
}
    if (paso==='preview_mensual')
      return <button onClick={handleConfirmar} disabled={procesando} className={base}
               style={{background:procesando?'rgba(16,185,129,0.4)':'#10b981', boxShadow:'0 4px 20px rgba(16,185,129,0.3)'}}>
               {procesando?'Procesando...':'Confirmar Reserva Mensual →'}
             </button>;
    if (paso === 'tiene_renovacion') {
      return (
    <button
      onClick={() => { onCerrar(); navigate('/renovaciones'); }}
      className={base}
      style={{ background: '#8A0BD2', boxShadow: '0 4px 20px rgba(138,11,210,0.35)' }}>
      🔄 Ir a Renovaciones →
    </button>
  );
}
    return null;
  };

  const diasCompleto=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)'}}
         onClick={onCerrar}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
           style={{background:'#1a1a2e', maxHeight:'92vh', overflowY:'auto'}}
           onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 text-white relative" style={{background:'linear-gradient(135deg,#4a0560,#7A0BC0)'}}>
          <button onClick={onCerrar}
                  className="absolute top-4 right-4 border-none w-8 h-8 rounded-full cursor-pointer transition-colors"
                  style={{background:'rgba(0,0,0,0.25)', color:'white', fontSize:'14px'}}>✕</button>
          <span style={{fontSize:'10px', background:'rgba(255,255,255,0.2)', padding:'3px 10px', borderRadius:'999px',
                        textTransform:'uppercase', letterSpacing:'0.08em', display:'inline-block'}}>
            {clase.actividad}
          </span>
          <h2 className="font-bold mt-2 m-0 capitalize" style={{fontSize:'20px'}}>
            {diasCompleto[fechaSeleccionada.getDay()]}, {fechaSeleccionada.getDate()} de {MESES[fechaSeleccionada.getMonth()]}
          </h2>
          <p style={{color:'rgba(255,255,255,0.7)', fontSize:'13px', margin:'4px 0 0'}}>
            {clase.horario?.slice(0,5)} hs • {clase.duracion} min
          </p>
        </div>

        {/* Toggle Individual / Mensual */}
        <div className="flex p-1 m-4 rounded-xl" style={{background:'rgba(0,0,0,0.25)'}}>
          {['INDIVIDUAL','MENSUAL'].map(m=>(
            <button key={m} onClick={()=>setModo(m)}
                    className="flex-1 py-2 text-[10px] font-bold rounded-lg border-none cursor-pointer transition-all"
                    style={{ background:modo===m?'#8A0BD2':'transparent', color:modo===m?'white':'rgba(255,255,255,0.35)' }}>
              {m==='INDIVIDUAL'?'📌 INDIVIDUAL':'📅 MENSUAL'}
            </button>
          ))}
        </div>

        <div className="px-5 pb-6">
          {renderContenido()}
          {renderBoton()}
        </div>
      </div>
    </div>
  );
}
// ─── BannerRenovacion ─────────────────────────────────────────────
// ─── BannerRenovacion ─────────────────────────────────────────────
function BannerRenovacion({ banner, onNavegar }) {
  if (!banner?.mostrar) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(banner.fecha_limite);
  venc.setHours(0, 0, 0, 0);
  const diasRestantes = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));

  const fechaFormateada = venc.toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long'
  });

  return (
    <div className="mb-6 rounded-2xl overflow-hidden"
         style={{ border: '1px solid rgba(138,11,210,0.4)' }}>

      {/* Fila principal */}
      <div className="flex items-center justify-between p-4 gap-4"
           style={{ background: 'linear-gradient(135deg, #2d0a4e, #1e0a3c)' }}>

        {/* Ícono + texto */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(138,11,210,0.4)', border: '1px solid rgba(138,11,210,0.6)' }}>
            <span style={{ fontSize: '22px' }}>📅</span>
          </div>
          <div>
            <p className="text-white font-bold m-0" style={{ fontSize: '15px' }}>
              ¡Es momento de renovar tus reservas!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '3px 0 0' }}>
              Tenés tiempo hasta el {fechaFormateada} para renovar tus reservas mensuales
              del próximo mes y asegurar tu lugar.
            </p>
          </div>
        </div>

        {/* Tiempo restante + botón */}
        <div className="flex-shrink-0 rounded-xl p-3 text-right"
             style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', minWidth: '230px' }}>
          <p style={{ color: 'rgba(255,165,0,0.9)', fontSize: '10px', fontWeight: 'bold',
                      textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
            ⏱ Tiempo restante
          </p>
          <p className="text-white font-bold m-0" style={{ fontSize: '22px', lineHeight: 1 }}>
            {diasRestantes} <span style={{ fontSize: '13px', fontWeight: 'normal' }}>días</span>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '3px 0 10px' }}>
            Hasta el {venc.getDate()}/{String(venc.getMonth() + 1).padStart(2, '0')}
          </p>
          <button
            onClick={onNavegar}
            className="w-full py-1.5 rounded-xl text-white font-bold border-none cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'rgba(255,165,0,0.9)', fontSize: '17px' }}>
            Renovar →
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Actividades (componente principal) ──────────────────────────
export default function Actividades() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clases, setClases]                   = useState([]);
  const [claseSeleccionada, setClaseSelec]    = useState(null);
  //const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [fechaSeleccionada, setFechaSelec]    = useState(()=>{ const d=new Date(); d.setHours(0,0,0,0); return d; });
  const [diaSeleccionado, setDiaSel]          = useState(NOMBRES_DIAS[new Date().getDay()]);
  const [creditos, setCreditos]            = useState(null);
  const [toast, setToast] = useState(null);
  const [estadoPermiso, setEstadoPermiso] = useState(null);
  const mostrarToast = (msg) => setToast(msg);
  const [banner, setBanner] = useState(null);

  useEffect(()=>{ cargarClases(); }, [fechaSeleccionada]);

  const cargarClases = async () => {
    setLoading(true);
    try {
      // NOTA BACKEND: el endpoint debe devolver TODAS las clases del día,
      // incluyendo las que ya no tienen cupos (para mostrar lista de espera)
     const data = await apiFetch(`${BASE_URL}/clases/por-dia?dia=${diaSeleccionado}&fecha=${fechaISO(fechaSeleccionada)}&incluirCompletas=true`);
      if (data.ok) setClases(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
  const id = getUsuarioId();
  if (!id) return;
  apiFetch(`${BASE_URL}/usuarios/${id}`)
    .then(d => { 
      if (d.ok) {
        setCreditos(d.data?.creditos ?? 0);
        setEstadoPermiso(d.data?.estado_permiso);
      }
    })
    .catch(() => {});
  }, []);

  useEffect(() => {
  const id = getUsuarioId();
  if (!id) return;
  apiFetch(`${BASE_URL}/renovaciones/banner/${id}`)
    .then(d => { if (d.ok) setBanner(d); })
    .catch(() => {});
  }, []);

  const handleSeleccionarDia = (diaAbrev, fechaObj) => {
    setDiaSel(diaAbrev);
    setFechaSelec(fechaObj);
  };

  const disponibles = clases.filter(c=>(c.cupo_maximo-(c.cantidad_inscriptos||0))>0).length;
  const enEspera    = clases.filter(c=>(c.cupo_maximo-(c.cantidad_inscriptos||0))<=0).length;

  return (
    <div className="flex min-h-screen" style={{background:'#12121f', fontFamily:'system-ui,sans-serif'}}>
  

      <main className={"flex-1 p-6 lg:px-12 lg:pt-10"}>

        {/* Header */}
        <header className="mb-7 flex justify-between items-start">
          <div>
            <h1 className="font-bold text-white m-0" style={{fontSize:'30px'}}>Actividades</h1>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:'4px 0 0'}}>
              Gestioná tus clases y entrenamientos
            </p>
          </div>
           <div className="flex items-center gap-2 rounded-2xl px-4 py-2"
              style={{background:'rgba(175,80,229,0.18)', border:'1px solid rgba(175,80,229,0.35)'}}>
          <span style={{fontSize:'18px'}}>⭐</span>
          <div>
          <p style={{color:'rgba(255,255,255,0.45)', fontSize:'9px', margin:0,
                 textTransform:'uppercase', letterSpacing:'0.1em'}}>Créditos</p>
          <p className="text-white font-bold m-0" style={{fontSize:'16px', lineHeight:1}}>
            {creditos !== null ? creditos : '—'}
            <span style={{color:'rgba(255,255,255,0.45)', fontSize:'11px', fontWeight:'normal'}}> disp.</span>
          </p>
          </div>
        </div>
        </header>
          <BannerRenovacion 
            banner={banner} 
            onNavegar={() => navigate('/renovaciones')} 
          />
        {/* ALERTA: Permiso rechazado */}
        {estadoPermiso === 'rechazado' && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{background:'#fee2e2', border:'1px solid #fca5a5'}}>
            <span style={{fontSize:'24px'}}>⚠️</span>
            <div className="flex-1">
              <p style={{color:'#991b1b', fontWeight:'bold', margin:0}}>
                Tu autorización fue rechazada
              </p>
              <p style={{color:'#7f1d1d', fontSize:'13px', margin:'4px 0 0'}}>
                Necesitas reenviar una nueva autorización para continuar reservando clases.
              </p>
            </div>
            <button 
              onClick={() => navigate('/resubmit-permiso')}
              style={{background:'#dc2626', color:'white', padding:'8px 16px', borderRadius:'6px', border:'none', cursor:'pointer', fontWeight:'500', fontSize:'13px'}}
            >
              Reenviar autorización
            </button>
          </div>
        )}

          {/* Stats + Créditos */}
        {/* Stats */}
<div className="grid grid-cols-4 gap-4 mb-7">

  <div onClick={() => navigate('/mis-reservas')}
       className="p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:brightness-110 transition-all"
       style={{background:'#5B0672', border:'1px solid rgba(139,92,246,0.25)'}}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
         style={{background:'#6a0785'}}>
      <span style={{fontSize:'20px'}}>🗓️</span>
    </div>
    <div>
      <p className="text-white font-bold text-sm m-0">Mis Reservas</p>
      <p style={{color:'rgba(255,255,255,0.4)', fontSize:'11px', margin:0}}>Ver mis clases</p>
    </div>
  </div>

  {/*<div onClick={() => navigate('/lista-espera')}
       className="p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:brightness-110 transition-all"
       style={{background:'#8A0BD2', border:'1px solid rgba(99,102,241,0.25)'}}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
         style={{background:'#970ee7'}}>
      <span style={{fontSize:'20px'}}>👥</span>
    </div>
    <div>
      <p className="text-white font-bold text-sm m-0">Lista Espera</p>
      <p style={{color:'rgba(255,255,255,0.4)', fontSize:'11px', margin:0}}>Clases en espera</p>
    </div>
  </div>*/}
    <div onClick={() => navigate('/qr-viewer')}
     className="p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:brightness-110 transition-all"
     style={{background:'#6D28D9', border:'1px solid rgba(147,51,234,0.25)'}}>
  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
       style={{background:'#7c3aed'}}>
      <span style={{fontSize:'20px'}}>📱</span>
    </div>
    <div>
      <p className="text-white font-bold text-sm m-0">Mi QR</p>
      <p style={{color:'rgba(255,255,255,0.4)', fontSize:'11px', margin:0}}>Ver mi código</p>
    </div>
  </div>
  <div onClick={() => navigate('/renovaciones')}
       className="p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:brightness-110 transition-all"
       style={{background:'#0d9488', border:'1px solid rgba(20,184,166,0.25)'}}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
         style={{background:'#12aea1'}}>
      <span style={{fontSize:'20px'}}>⚡</span>
    </div>
    <div>
      <p className="text-white font-bold text-sm m-0">Renovarr</p>
      <span style={{background:'rgba(20,184,166,0.2)', color:'#2dd4bf', fontSize:'10px',
        fontWeight:'bold', padding:'2px 8px', borderRadius:999, textTransform:'uppercase',
        letterSpacing:'0.06em', display:'inline-block', marginTop:2}}>Mensual</span>
    </div>
  </div>
</div>

        <DateSelector fechaSeleccionada={fechaSeleccionada} onSeleccionar={handleSeleccionarDia} />

        {/* Leyenda de estados */}
        {!loading && clases.length>0 && (
          <div className="flex gap-5 mb-5" style={{fontSize:'11px', color:'rgba(255,255,255,0.35)'}}>
            <span className="flex items-center gap-1.5">
              <span style={{width:10,height:10,borderRadius:3,background:'#8A0BD2',display:'inline-block'}}/>
              {disponibles} con cupo
            </span>
            {enEspera>0&&(
              <span className="flex items-center gap-1.5">
                <span style={{width:10,height:10,borderRadius:3,background:'#f59e0b',display:'inline-block'}}/>
                {enEspera} lista de espera
              </span>
            )}
          </div>
        )}

        {/* Grilla de clases */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24" style={{opacity:0.5}}>
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4"
                 style={{borderColor:'rgba(138,11,210,0.3)', borderTopColor:'#8A0BD2'}}/>
            <p className="text-white text-sm">Cargando actividades...</p>
          </div>
        ) : clases.length>0 ? (
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
            {clases.map(c=>(
              <ClaseCard key={c.id_clase} clase={c} fechaSeleccionada={fechaSeleccionada} onReservar={()=>setClaseSelec(c)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-3xl" style={{background:'rgba(255,255,255,0.03)', border:'1px dashed rgba(255,255,255,0.08)'}}>
            <span style={{fontSize:'48px', display:'block', marginBottom:'12px'}}>💤</span>
            <p style={{color:'rgba(255,255,255,0.35)'}}>No hay actividades programadas para este día.</p>
          </div>
        )}
      </main>

      {claseSeleccionada && (
        <ModalDetalle
          clase={claseSeleccionada}
          fechaSeleccionada={fechaSeleccionada}
          onCerrar={()=>setClaseSelec(null)}
          onReservaExitosa={()=>{ setClaseSelec(null); cargarClases(); }}
          onToast={mostrarToast}
        />
      )}
      {toast && <Toast mensaje={toast} onClose={() => setToast(null)} />}
      <style>{`
          @keyframes slideUp {
          from { opacity:0; transform:translateX(-50%) translateY(20px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
          }
      `}</style>
    </div>
    
  );
  
}