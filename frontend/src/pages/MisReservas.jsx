import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import yogaImg     from '../assets/Yoga2.png';
import pilatesImg  from '../assets/Pilatesmq.png';
import funcionalImg from '../assets/Funcional.png';

const BASE_URL     = 'http://localhost:3000/api';
const UPLOADS_URL  = 'http://localhost:3000/uploads';
const getUsuarioId = () => JSON.parse(localStorage.getItem('user') || '{}')?.id || null;

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto',
               'Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

const COLORES_CLASE = { yoga:'#4a0560', pilates:'#0d5555', funcional:'#7c2d12' };
//const EMOJIS_CLASE  = { yoga:'🧘', pilates:'🤸', funcional:'💪' };
const IMAGENES_CLASE = { yoga: yogaImg, pilates: pilatesImg, funcional: funcionalImg };

// FIX: maneja ISO string, datetime string y date string
const formatFecha = (valor) => {
  if (!valor) return '—';
  const limpio = String(valor).split('T')[0].split(' ')[0];
  const [anio, mes, dia] = limpio.split('-').map(Number);
  if (!anio || isNaN(anio) || !mes || !dia) return '—';
  const d = new Date(anio, mes - 1, dia);
  return `${DIAS[d.getDay()]} ${dia} de ${MESES[mes - 1]}`;
};

const getPagoInfo = (r) => {
  if (r.tipo_reserva === 'mensual') return 'Membresía';
  if (r.tipo_pago === 'credito')    return 'Con crédito';
  if (r.tipo_pago === 'seña')       return 'Pago con seña';
  if (r.tipo_pago === 'total')      return 'Pago total';
  return r.tipo_pago || 'Pago total';
};

const getEstado = (r) => {
  if (r.estado === 'cancelada')
    return { label:'Cancelada',         icon:'✕', color:'#ef4444', bg:'rgba(239,68,68,0.12)', desc:'Cancelada por vos' };
  if (r.estado === 'asistio')
    return { label:'Asistió',           icon:'✓', color:'#6366f1', bg:'rgba(99,102,241,0.12)', desc:'Clase completada' };
  if (r.estado === 'pendiente')
    return { label:'Pendiente de pago', icon:'⏳', color:'#f59e0b', bg:'rgba(245,158,11,0.12)', desc:'pendiente' };
  // Seña pagada con saldo pendiente
  if (r.tipo_pago === 'seña' && Number(r.saldo_pendiente) > 0)
    return { label:'Seña pagada',       icon:'🤝', color:'#f97316', bg:'rgba(249,115,22,0.12)', desc:'Saldo pendiente a completar' };
  // Pago con crédito
  if (r.tipo_pago === 'credito')
    return { label:'Confirmada',icon:'✓', color:'#10b981', bg:'rgba(16,185,129,0.12)', desc:'Reserva confirmada' };
  // Pago total
  if (r.tipo_pago === 'total')
    return { label:'Confirmada',        icon:'✓', color:'#10b981', bg:'rgba(16,185,129,0.12)', desc:'Reserva confirmada' };
  return   { label:'Confirmada',        icon:'✓', color:'#10b981', bg:'rgba(16,185,129,0.12)', desc: 'Reserva confirmada' };
};

function Countdown() {
  const [tiempo, setTiempo] = useState('');
  useEffect(() => {
    const calc = () => {
      const ahora = new Date();
      const vence = new Date(ahora.getFullYear(), ahora.getMonth(), 11, 0, 5, 0);
      const diff  = vence - ahora;
      if (diff <= 0) { setTiempo('Vencido'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTiempo(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontFamily:'monospace', fontWeight:'bold' }}>{tiempo}</span>;
}

export default function MisReservas() {
  const navigate = useNavigate();
  const [reservas, setReservas]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filtroTipo, setFiltroTipo]     = useState('todos');
  const [vista, setVista] = useState('proximas'); // 'proximas' o 'historial'

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const id = getUsuarioId();
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetch(`${BASE_URL}/reservas/usuario/${id}`).then(r => r.json());
      if (data.ok) setReservas(data.data);
    } finally { setLoading(false); }
  };

  const cancelarReserva = async (id_reserva) => {
    if (!window.confirm('¿Estás seguro? No podrás recuperar tu reserva.')) return;
    
    try {
      const response = await fetch(`${BASE_URL}/reservas/${id_reserva}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: getUsuarioId() })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.mensaje);
        cargar(); // Recargar lista
      } else {
        alert(`Error: ${data.mensaje}`);
      }
    } catch (error) {
      console.error('Error al cancelar:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const completarPagoSena = async (reserva) => {
  if (!reserva.id_reserva || !reserva.id_clase) {
    alert('Faltan datos de la reserva');
    return;
  }

  // Calcular precio del saldo pendiente
  const saldoPendiente = Number(reserva.saldo_pendiente || 0);
  //const precioTotal = reserva.precio_individual || 0;
  //const mitadPrecio = precioTotal / 2;

  try {
    // Guardar en localStorage para después del pago en MP
    localStorage.setItem('pendingReserva', JSON.stringify({
      tipo: 'individual',
      id_usuario: getUsuarioId(),
      id_clase: reserva.id_clase,
      id_instancia: reserva.id_instancia,
      fecha_clase: reserva.fecha_clase.split('T')[0],// cambio de tipo de fecha a string para evitar problemas de formato en el backend;
      tipo_pago: 'seña',
      precio_total: saldoPendiente,
      id_reserva: reserva.id_reserva // Para actualizar la reserva existente
    }));

    // Crear preferencia en Mercado Pago
    const pref = await fetch(`${BASE_URL}/payments/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoPago: 'sena',
        descripcion: `${reserva.actividad} - Saldo pendiente ${formatFecha(reserva.fecha_clase)}`,
        precio: saldoPendiente,
        id_usuario: getUsuarioId(),
        id_clase: reserva.id_clase
      })
    }).then(r => r.json());

    if (pref.init_point) {
      window.location.href = pref.init_point;
    } else {
      alert('Error al procesar el pago');
    }
  } catch (error) {
    console.error('Error al completar pago:', error);
    alert('Error al procesar la solicitud');
  }
};

  const filtradas = reservas.filter(r => {
    if (filtroTipo !== 'todos' && r.tipo_reserva !== filtroTipo) return false;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaClase = new Date(r.fecha_clase);
    
    if (vista === 'proximas') {
      // Solo mostrar futuras
      return fechaClase >= hoy;
    } else {
      // Mostrar solo pasadas
      return fechaClase < hoy;
    }
  }).sort((a, b) => {
    const fechaA = new Date(a.fecha_clase);
    const fechaB = new Date(b.fecha_clase);
    
    if (vista === 'proximas') {
      // Próximas: de más cercana a más lejana
      return fechaA - fechaB;
    } else {
      // Historial: de más reciente a más antigua
      return fechaB - fechaA;
    }
  });

  const selectStyle = {
    background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:10, color:'white', padding:'8px 14px',
    fontSize:13, cursor:'pointer', outline:'none', minWidth:160,
  };

  return (
    <div style={{ minHeight:'100vh', background:'#12121f', padding:'32px 40px', fontFamily:'system-ui,sans-serif' }}>

      <button onClick={() => navigate(-1)}
        style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)',
          cursor:'pointer', fontSize:13, marginBottom:20, padding:0,
          display:'flex', alignItems:'center', gap:6 }}>
        ← Volver
      </button>

      <h1 style={{ color:'white', fontSize:26, fontWeight:'bold', margin:'0 0 4px' }}>Mis Reservas</h1>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, margin:'0 0 28px' }}>
        Administrá tus clases reservadas
      </p>

      <div style={{ display:'flex', gap:20, marginBottom:28, flexWrap:'wrap', alignItems:'flex-end' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          <label style={{ color:'rgba(255,255,255,0.35)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Tipo de reserva
          </label>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={selectStyle}>
            <option value="todos">Todos los tipos</option>
            <option value="individual">Individual</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>
        
        <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
          <button 
            onClick={() => setVista('proximas')}
            style={{ 
              background: vista === 'proximas' ? 'rgba(138,11,210,0.3)' : 'rgba(138,11,210,0.12)',
              border: `1px solid ${vista === 'proximas' ? 'rgba(138,11,210,0.6)' : 'rgba(138,11,210,0.3)'}`,
              color: vista === 'proximas' ? '#c084fc' : 'rgba(255,255,255,0.6)',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              if (vista !== 'proximas') e.target.style.background = 'rgba(138,11,210,0.2)';
            }}
            onMouseLeave={e => {
              if (vista !== 'proximas') e.target.style.background = 'rgba(138,11,210,0.12)';
            }}
          >
            📅 Próximas
          </button>
          
          <button 
            onClick={() => setVista('historial')}
            style={{ 
              background: vista === 'historial' ? 'rgba(138,11,210,0.3)' : 'rgba(138,11,210,0.12)',
              border: `1px solid ${vista === 'historial' ? 'rgba(138,11,210,0.6)' : 'rgba(138,11,210,0.3)'}`,
              color: vista === 'historial' ? '#c084fc' : 'rgba(255,255,255,0.6)',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              if (vista !== 'historial') e.target.style.background = 'rgba(138,11,210,0.2)';
            }}
            onMouseLeave={e => {
              if (vista !== 'historial') e.target.style.background = 'rgba(138,11,210,0.12)';
            }}
          >
            📜 Historial
          </button>
        </div>
      </div>

      <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:600, marginBottom:14 }}>
        {vista === 'proximas' ? 'Mis próximas clases' : 'Historial de reservas'}
        <span style={{ color:'rgba(255,255,255,0.25)', fontWeight:'normal', marginLeft:8 }}>({filtradas.length})</span>
      </p>

      {loading ? (
        <div style={{ textAlign:'center', paddingTop:80, opacity:0.4 }}>
          <div style={{ width:38, height:38, border:'3px solid rgba(138,11,210,0.25)',
            borderTopColor:'#8A0BD2', borderRadius:'50%', margin:'0 auto 12px',
            animation:'spin 1s linear infinite' }} />
          <p style={{ color:'white', fontSize:13 }}>Cargando reservas...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div style={{ textAlign:'center', paddingTop:80, opacity:0.4 }}>
          <span style={{ fontSize:44, display:'block', marginBottom:12 }}>
            {vista === 'proximas' ? '📅' : '📜'}
          </span>
          <p style={{ color:'white', fontSize:14 }}>
            {vista === 'proximas' 
              ? `No tenés clases próximas${filtroTipo !== 'todos' ? ' con ese filtro' : ''}.`
              : `No tenés historial de reservas${filtroTipo !== 'todos' ? ' con ese filtro' : ''}.`
            }
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtradas.map(r => {
            const estado     = getEstado(r);
            const colorClase = COLORES_CLASE[r.actividad?.toLowerCase()] || '#5B0672';
            const imgClase = IMAGENES_CLASE[r.actividad?.toLowerCase()] || null;
            const imagenUrl  = r.imagen ? `${UPLOADS_URL}/${r.imagen}` : null;
            const puedeCanc  = (r.estado === 'reservada' || r.estado === 'pendiente') && vista !== 'historial';
            
            return (
              <div key={r.id_reserva}
                style={{ 
                  background:'#1a1a2e', 
                  borderRadius:14, 
                  overflow:'hidden',
                  border:`1px solid ${estado.color}33`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease'
                }}>
                
                {/* Card superior - Clase info */}
                <div style={{ display:'flex', gap:0 }}>
                  {/* Imagen */}
                  <div style={{ 
                    width:140, 
                    flexShrink:0, 
                    background:colorClase, 
                    position:'relative',
                    display:'flex', 
                    alignItems:'center', 
                    justifyContent:'center', 
                    overflow:'hidden' 
                  }}>
                    <img 
                      src={imagenUrl || imgClase || ''}
                      alt={r.actividad}
                      style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }}
                      onError={e => {
                        if (imgClase) e.target.src = imgClase;
                        else e.target.style.display = 'none';
                      }}
                    />
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)' }} />
                  </div>

                  {/* Info principal */}
                  <div style={{ flex:1, padding:'16px 20px', display:'flex', flexDirection:'column', justifyContent:'center', gap:8 }}>
                    <div>
                      <h3 style={{ 
                        color:'white', 
                        fontWeight:'bold', 
                        fontSize:18, 
                        margin:'0 0 4px 0',
                        textTransform:'capitalize' 
                      }}>
                        {r.actividad}
                      </h3>
                      <p style={{ 
                        color:'rgba(255,255,255,0.6)', 
                        fontSize:13, 
                        margin:0,
                        fontWeight:500
                      }}>
                        📅 {formatFecha(r.fecha_clase)} • ⏰ {r.horario?.slice(0,5)} hs
                      </p>
                    </div>
                    
                    {/* Detalles */}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {r.nombre_sala && (
                        <span style={{ 
                          background:'rgba(138,11,210,0.2)', 
                          border:'1px solid rgba(138,11,210,0.35)',
                          color:'#c084fc', 
                          fontSize:11, 
                          fontWeight:600, 
                          padding:'4px 10px', 
                          borderRadius:6 
                        }}>
                          🏛️ Sala {r.nombre_sala}
                        </span>
                      )}
                      {r.nombre_profesor && (
                        <span style={{ 
                          background:'rgba(99,102,241,0.15)', 
                          border:'1px solid rgba(99,102,241,0.3)',
                          color:'#a5b4fc', 
                          fontSize:11, 
                          fontWeight:600, 
                          padding:'4px 10px', 
                          borderRadius:6 
                        }}>
                          👤 {r.nombre_profesor.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estado - lado derecho */}
                  <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent:'center', gap:4, textAlign:'right' }}>
                    <div style={{ 
                      display:'inline-flex', 
                      alignItems:'center', 
                      gap:6,
                      background:estado.bg, 
                      color:estado.color, 
                      fontSize:12,
                      fontWeight:'bold', 
                      padding:'6px 14px', 
                      borderRadius:999,
                      border: `1px solid ${estado.color}44`
                    }}>
                      {estado.icon} {estado.label}
                    </div>
                    {vista === 'historial' && (
                      <p style={{ 
                        color:'rgba(255,255,255,0.35)', 
                        fontSize:11, 
                        margin:0,
                        fontWeight:500
                      }}>
                        ✓ Clase pasada
                      </p>
                    )}
                    {r.estado === 'pendiente' && vista !== 'historial' && (
                      <p style={{ 
                        color:'rgba(255,255,255,0.4)', 
                        fontSize:11, 
                        margin:0,
                        fontWeight:500
                      }}>
                        ⏳ <Countdown />
                      </p>
                    )}
                    {r.estado !== 'pendiente' && r.estado !== 'cancelada' && vista !== 'historial' && estado.desc && (
                      <p style={{ 
                        color:'rgba(255,255,255,0.3)', 
                        fontSize:11, 
                        margin:0 
                      }}>
                        {estado.desc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height:'1px', background:'rgba(255,255,255,0.08)' }} />

                {/* Card inferior - Detalles y acciones */}
                <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:16, justifyContent:'space-between', flexWrap:'wrap' }}>
                  {/* Tipo reserva y pago */}
                  <div style={{ display:'flex', gap:16, flex:1, minWidth:200 }}>
                    <div>
                      <p style={{ 
                        color:'rgba(255,255,255,0.5)', 
                        fontSize:11, 
                        margin:'0 0 4px 0',
                        textTransform:'uppercase',
                        letterSpacing:'0.05em',
                        fontWeight:600
                      }}>
                        Tipo
                      </p>
                      <p style={{ 
                        color:'white', 
                        fontSize:13, 
                        margin:0,
                        fontWeight:600,
                        textTransform:'capitalize'
                      }}>
                        {r.tipo_reserva === 'mensual' ? '📅 Membresía' : '🎫 Individual'}
                      </p>
                    </div>
                    <div>
                      <p style={{ 
                        color:'rgba(255,255,255,0.5)', 
                        fontSize:11, 
                        margin:'0 0 4px 0',
                        textTransform:'uppercase',
                        letterSpacing:'0.05em',
                        fontWeight:600
                      }}>
                        Pago
                      </p>
                      <p style={{ 
                        color:'#b4b4ff', 
                        fontSize:13, 
                        margin:0,
                        fontWeight:500
                      }}>
                        {getPagoInfo(r)}
                      </p>
                    </div>
                  </div>

                  {/* Botones */}
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    {r.tipo_pago === 'seña' && Number(r.saldo_pendiente) > 0 && (r.estado === 'reservada' || r.estado == 'pendiente') && vista !== 'historial' && (
                      <button 
                        onClick={() => completarPagoSena(r)}
                        style={{ 
                          background:'rgba(34,197,94,0.15)', 
                          border:'1px solid rgba(34,197,94,0.4)',
                          color:'#22c55e', 
                          borderRadius:8, 
                          padding:'8px 14px', 
                          fontSize:12,
                          fontWeight:'bold', 
                          cursor:'pointer', 
                          display:'flex', 
                          alignItems:'center', 
                          gap:6,
                          transition:'all 0.2s',
                          whiteSpace:'nowrap'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(34,197,94,0.25)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(34,197,94,0.15)'}
                      >
                        💳 Pagar
                      </button>
                    )}
                    {puedeCanc && (
                      <button 
                        onClick={() => cancelarReserva(r.id_reserva)} 
                        style={{ 
                          background:'rgba(239,68,68,0.15)', 
                          border:'1px solid rgba(239,68,68,0.4)',
                          color:'#ff6b6b', 
                          borderRadius:8, 
                          padding:'8px 14px', 
                          fontSize:12,
                          fontWeight:'bold', 
                          cursor:'pointer', 
                          display:'flex', 
                          alignItems:'center', 
                          gap:6,
                          transition:'all 0.2s',
                          whiteSpace:'nowrap'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(239,68,68,0.25)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(239,68,68,0.15)'}
                      >
                        🗑️ Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}