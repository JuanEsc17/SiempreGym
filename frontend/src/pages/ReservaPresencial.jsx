import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000/api';

const NOMBRES_DIAS = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB'];
const MESES_CORTO  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const fechaISO = (d) => {
  const año = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const día = String(d.getDate()).padStart(2, '0');
  return `${año}-${mes}-${día}`;
};

const formatCorta = (iso) => { 
  const [,m,d] = iso.split('-'); 
  return `${+d} ${MESES_CORTO[+m-1]}`; 
};

// ─── Toast ────────────────────────────────────────────────────
function Toast({ mensaje, tipo = 'exito', onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, []);

  const esError = tipo === 'error';

  return (
    <div style={{
      position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
      background:'#1e1e2e', 
      border: esError ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.4)',
      borderLeft: esError ? '4px solid #ef4444' : '4px solid #10b981',
      borderRadius:14, padding:'14px 20px',
      color:'white', fontSize:14, fontWeight:500, zIndex:9999,
      boxShadow:'0 8px 32px rgba(0,0,0,0.4)', maxWidth:400, textAlign:'center'
    }}>
      {esError ? '❌' : '✅'} {mensaje}
    </div>
  );
}

// ─── DateSelector ─────────────────────────────────────────────────
function DateSelector({ fechaSeleccionada, onSeleccionar }) {
  const [offset, setOffset] = useState(0);
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  
  // Limitar a 60 días (mes actual + siguiente aproximadamente)
  const maxDias = 60;

  const dias = Array.from({length:7},(_,i)=>{
    const f = new Date(hoy); f.setDate(hoy.getDate()+offset+i);
    return { label:NOMBRES_DIAS[f.getDay()], numero:`${f.getDate()}/${f.getMonth()+1}`, fechaObj: new Date(f) };
  });

  const isSelected = (d) => fechaISO(d.fechaObj) === fechaISO(fechaSeleccionada);
  const canNext = offset + 7 < maxDias;

  return (
    <div className="flex items-center gap-1 mb-6 bg-white/5 p-2 rounded-2xl border border-white/5">
      <button onClick={()=>setOffset(o=>Math.max(0,o-7))} disabled={offset===0}
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
      <button onClick={()=>setOffset(o=>o+7)} disabled={!canNext}
              className="text-white text-xl hover:bg-white/10 rounded-full w-9 h-9 border-none cursor-pointer flex-shrink-0 disabled:opacity-20">›</button>
    </div>
  );
}

// ─── ClaseCard ────────────────────────────────────────────────────
function ClaseCard({ clase, onSeleccionar }) {
  const cuposLibres = clase.cupo_maximo - (clase.cantidad_inscriptos || 0);
  const estaLlena = cuposLibres <= 0;
  const pct = Math.round((cuposLibres / clase.cupo_maximo) * 100);

  return (
    <div
      onClick={onSeleccionar}
      className={`group rounded-2xl overflow-hidden flex h-36 transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.02]`}
      style={{ background:'#252535', borderLeft:`5px solid ${estaLlena ? '#f59e0b' : '#8A0BD2'}` }}>

      {estaLlena && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow"
             style={{background:'#f59e0b', color:'#451a00'}}>
          ⏳ Lista de espera
        </div>
      )}

      <div className="flex flex-col justify-center px-4 min-w-[96px] flex-shrink-0 bg-black/20">
        <span className="text-[9px] uppercase tracking-widest text-white/40">{clase.dia}</span>
        <span className="text-2xl font-bold text-white">{clase.horario?.slice(0,5)}</span>
        <span className="text-[10px] text-white/40">{clase.duracion} min</span>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(138,11,210,0.4), rgba(175,80,229,0.1))` }}>
          <div className="absolute inset-0 group-hover:opacity-60 transition-opacity" style={{ background: `rgba(0,0,0,0.5)` }} />
        </div>
        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white capitalize m-0 leading-tight drop-shadow">{clase.actividad}</h3>
          </div>
          <div className="flex items-end justify-between">
            <div className="w-2/3">
              {estaLlena ? (
                <p className="text-[10px] mb-1 text-amber-400 font-medium">Sin cupos disponibles</p>
              ) : (
                <>
                  <p className="text-[10px] mb-1 font-medium" style={{color:pct<=20?'#f87171':'#4ade80'}}>
                    👤 {cuposLibres} libre{cuposLibres!==1?'s':''}
                  </p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.1)'}}>
                    <div className="h-full transition-all duration-700" style={{width:`${pct}%`, background:pct<=20?'#f87171':'#4ade80'}} />
                  </div>
                </>
              )}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all group-hover:scale-110`}
                 style={{background: estaLlena?'#f59e0b':'#8A0BD2', fontSize:'20px', lineHeight:'1'}}>
              {estaLlena ? '⏳' : '+'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Selección de Fechas ────────────────────────────────
function ModalConfirmacion({ clase, usuarioSeleccionado, tipoReserva, fechaSeleccionada, fechasMensuales, onConfirmar, onCerrar, procesando }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)'}} onClick={onCerrar}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{background:'#1a1a2e'}} onClick={e=>e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 text-white relative" style={{background:'linear-gradient(135deg,#4a0560,#7A0BC0)'}}>
          <button onClick={onCerrar} disabled={procesando} className="absolute top-4 right-4 border-none w-8 h-8 rounded-full cursor-pointer transition-colors" style={{background:'rgba(0,0,0,0.25)', color:'white', fontSize:'14px', opacity: procesando ? 0.5 : 1}}>✕</button>
          <h2 className="font-bold m-0 capitalize" style={{fontSize:'18px'}}>{clase.actividad}</h2>
          <p style={{color:'rgba(255,255,255,0.7)', fontSize:'13px', margin:'4px 0 0'}}>Confirmar reserva</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-lg p-4" style={{background:'rgba(138,11,210,0.15)', border:'1px solid rgba(138,11,210,0.3)'}}>
            <p className="text-white/70 text-xs mb-1">Cliente:</p>
            <p className="text-white font-bold">{usuarioSeleccionado.username}</p>
          </div>

          <div className="rounded-lg p-4" style={{background:'rgba(138,11,210,0.15)', border:'1px solid rgba(138,11,210,0.3)'}}>
            <p className="text-white/70 text-xs mb-1">Clase:</p>
            <p className="text-white font-bold">{clase.actividad}</p>
            <p className="text-white/50 text-xs mt-1">{clase.horario?.slice(0,5)} hs - {clase.duracion} min</p>
          </div>

          <div
            className="rounded-lg p-4"
            style={{
            background: 'rgba(138,11,210,0.15)',
            border: '1px solid rgba(138,11,210,0.3)'
            }}
          >
          <p className="text-white/70 text-xs mb-1">
            {tipoReserva === "INDIVIDUAL" ? "Fecha:" : "Fechas:"}
          </p>

            {tipoReserva === "INDIVIDUAL" ? (
                                              <p className="text-white font-bold">
                                              {formatCorta(fechaISO(fechaSeleccionada))}
                                              </p>
          
                                            ) : (
          <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
          {fechasMensuales.map((f) => (
                                        <span
                                          key={f}
                                          className="px-2 py-1 rounded-lg text-xs font-semibold"
                                          style={{
                                                  background: "rgba(138,11,210,0.3)",
                                                  color: "white"
                                                }}
                                        >
          {formatCorta(f)}
      </span>
      ))}
    </div>
                                  )}
          </div>

          <div className="rounded-lg p-4" style={{background:'rgba(138,11,210,0.15)', border:'1px solid rgba(138,11,210,0.3)'}}>
            <p className="text-white/70 text-xs mb-1">Tipo de reserva:</p>
            <p className="text-white font-bold">{tipoReserva === 'INDIVIDUAL' ? 'Individual' : 'Mensual'}</p>
          </div>
          <div className="rounded-lg p-4" style={{background:'rgba(138,11,210,0.15)', border:'1px solid rgba(138,11,210,0.3)'}}>
            <p className="text-white/70 text-xs mb-1">Precio:</p>
            <p className="text-white font-bold">${Number(clase.precio_individual).toLocaleString('es-AR')}</p>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onCerrar} disabled={procesando} className="flex-1 py-3 rounded-2xl border-2 border-white/20 text-white font-bold cursor-pointer hover:bg-white/5 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={procesando}
              className="flex-1 py-3 rounded-2xl text-white font-bold cursor-pointer transition-all disabled:opacity-50"
              style={{background:'linear-gradient(135deg,#AF50E5,#8A0BD2)', boxShadow:'0 4px 20px rgba(138,11,210,0.3)'}}>
              {procesando ? 'Reservando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReservaPresencial() {
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [diaSeleccionado, setDiaSeleccionado] = useState(NOMBRES_DIAS[new Date().getDay()]);

  const [busqueda, setBusqueda] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [tipoReserva, setTipoReserva] = useState("INDIVIDUAL");
  const [claseParaReservar, setClaseParaReservar] = useState(null);
  const [toast, setToast] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const [fechasMensuales, setFechasMensuales] = useState([]);

  // ────────────────────────────────────────
  // CARGAR CLASES POR DÍA
  // ────────────────────────────────────────
  useEffect(() => {
    const cargarClases = async () => {
      try {
        const response = await fetch(`${BASE_URL}/clases/por-dia?dia=${diaSeleccionado}&fecha=${fechaISO(fechaSeleccionada)}&incluirCompletas=true`);
        const data = await response.json();
        if (data.ok) {
          // Ordenar por horario
          const clasesOrdenadas = data.data.sort((a, b) => a.horario.localeCompare(b.horario));
          setClases(clasesOrdenadas);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    };
    cargarClases();
  }, [fechaSeleccionada, diaSeleccionado]);

  // ────────────────────────────────────────
  // BUSCADOR USUARIOS
  // ────────────────────────────────────────
  useEffect(() => {
    const buscarUsuario = async () => {
      if (busqueda.length < 3) {
        setUsuarios([]);
        return;
      }
      try {
        const response = await fetch(`${BASE_URL}/usuarios/buscar?query=${busqueda}`);
        const data = await response.json();
        if (data.ok) {
          setUsuarios(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const timer = setTimeout(buscarUsuario, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // ────────────────────────────────────────
  // MANEJAR SELECCIÓN DE FECHA
  // ────────────────────────────────────────
  const handleSeleccionarDia = (diaAbrev, fechaObj) => {
    setDiaSeleccionado(diaAbrev);
    setFechaSeleccionada(fechaObj);
  };

  // ────────────────────────────────────────
  // COMPLETAR RESERVA
  // ────────────────────────────────────────
  const handleReservar = async () => {
    if (!usuarioSeleccionado || !claseParaReservar) {
      setToast({ mensaje: 'Error: faltan datos', tipo: 'error' })
      return;
    }

    setProcesando(true);
    try {
      let endpoint = '';
      let body = {};

      if (tipoReserva === 'INDIVIDUAL') {
        // Primero verificar para obtener id_instancia
        const verificarEndpoint = `${BASE_URL}/reservas/verificar-individual`;
        const verificarBody = {
          id_usuario: usuarioSeleccionado.id_usuario,
          id_clase: claseParaReservar.id_clase,
          fecha_clase: fechaISO(fechaSeleccionada)
        };

        const verificarResponse = await fetch(verificarEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verificarBody)
        });

        const verificarData = await verificarResponse.json();

        if (!verificarData.ok || verificarData.status !== 'LISTO_PARA_RESERVAR') {
          setToast({ mensaje: verificarData.mensaje || 'No se puede reservar esta clase', tipo: 'error' });
          setProcesando(false);
          setClaseParaReservar(null);
          return;
        }

        // Ahora crear la reserva con el id_instancia
        endpoint = `${BASE_URL}/reservas/crear-individual-presencial`;
        body = {
          id_usuario: usuarioSeleccionado.id_usuario,
          id_clase: claseParaReservar.id_clase,
          id_instancia: verificarData.id_instancia,
          fecha_clase: fechaISO(fechaSeleccionada),
          tipo_pago: 'TOTAL',
          monto_total: claseParaReservar.precio_individual
        };
      } else {
        // Para mensual, primero verificar para obtener las fechas y monto
        const verificarEndpoint = `${BASE_URL}/reservas/verificar-mensual`;
        const verificarBody = {
          id_usuario: usuarioSeleccionado.id_usuario,
          id_clase: claseParaReservar.id_clase,
          mes: fechaSeleccionada.getMonth() + 1,
          anio: fechaSeleccionada.getFullYear(),
          esPresencial: true
        };

        const verificarResponse = await fetch(verificarEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verificarBody)
        });

        const verificarData = await verificarResponse.json();

        if (!verificarData.ok || verificarData.status !== 'LISTO_PARA_PAGAR') {
          setToast({ mensaje: verificarData.mensaje || 'No se puede reservar esta clase', tipo: 'error' });
          setProcesando(false);
          setClaseParaReservar(null);
          return;
        }

        // Ahora crear la reserva mensual con las fechas obtenidas
        endpoint = `${BASE_URL}/reservas/crear-mensual-presencial`;
        body = {
          id_usuario: usuarioSeleccionado.id_usuario,
          id_clase: claseParaReservar.id_clase,
          fechas: verificarData.fechas,
          monto_total: verificarData.monto
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ mensaje: data.mensaje || 'Reserva realizada exitosamente', tipo: 'exito' });
        setClaseParaReservar(null);
        setBusqueda("");
        setUsuarioSeleccionado(null);
      } else {
        setToast({ mensaje: data.mensaje || 'Error al reservar', tipo: 'error' });
      }
    } catch (error) {
      console.log("Error:", error);
      setToast({ mensaje: 'Error al conectar con el servidor', tipo: 'error' });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{background:'#12121f', fontFamily:'system-ui,sans-serif'}}>
      
      {/* SIDEBAR - PANEL LATERAL */}
      <div className="w-80 bg-black/40 border-r border-white/10 p-6 overflow-y-auto flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-6">Reserva Presencial</h2>

        {/* Buscador de Cliente */}
        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2">Buscar cliente:</label>
          <input
            placeholder="Username o email"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl px-4 py-2 text-white outline-none border-2 border-white/10 focus:border-[#8A0BD2] transition-colors"
            style={{background:'rgba(255,255,255,0.05)'}}
          />
          
          {usuarios.length > 0 && (
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
              {usuarios.map(usuario => (
                <button
                  key={usuario.id_usuario}
                  onClick={() => {
                    setUsuarioSeleccionado(usuario);
                    setBusqueda(usuario.username);
                    setUsuarios([]);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
                  style={{background:'rgba(138,11,210,0.15)', border:'1px solid rgba(138,11,210,0.3)'}}>
                  <p className="text-white font-medium text-sm m-0">{usuario.username}</p>
                  <p className="text-white/50 text-xs m-0">{usuario.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cliente Seleccionado */}
        {usuarioSeleccionado && (
          <div className="p-4 rounded-xl mb-6" style={{background:'rgba(138,11,210,0.2)', border:'1px solid rgba(138,11,210,0.4)'}}>
            <p className="text-white/70 text-xs mb-1">Cliente seleccionado:</p>
            <p className="text-white font-bold">{usuarioSeleccionado.username}</p>
            <button
              onClick={() => {
                setUsuarioSeleccionado(null);
                setBusqueda("");
              }}
              className="text-xs text-[#AF50E5] hover:text-[#D980F9] mt-2 cursor-pointer underline">
              Cambiar cliente
            </button>
          </div>
        )}

        {/* Tipo de Reserva */}
        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2">Tipo de reserva:</label>
          <div className="flex gap-2">
            {['INDIVIDUAL', 'MENSUAL'].map(tipo => (
              <button
                key={tipo}
                onClick={() => setTipoReserva(tipo)}
                className="flex-1 py-2 rounded-lg font-bold text-xs transition-all border-2"
                style={{
                  background: tipoReserva === tipo ? '#8A0BD2' : 'transparent',
                  borderColor: tipoReserva === tipo ? '#8A0BD2' : 'rgba(255,255,255,0.2)',
                  color: tipoReserva === tipo ? 'white' : 'rgba(255,255,255,0.5)'
                }}>
                {tipo === 'INDIVIDUAL' ? 'Individual' : 'Mensual'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:px-12 lg:pt-10 overflow-y-auto">
        
        {/* Header */}
        <header className="mb-7 flex justify-between items-start">
        <div>
          <h1 className="font-bold text-white m-0" style={{fontSize:'30px'}}>
          Actividades
          </h1>

          <p style={{color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:'4px 0 0'}}>
          Selecciona una actividad para reservar al cliente
          </p>
        </div>

        <button
        onClick={() => navigate("/empleado")}
        className="px-4 py-2 rounded-xl text-white font-medium cursor-pointer transition-all hover:opacity-90"
        style={{
          background: "#8A0BD2",
          border: "none"
        }}
        >
        ← Volver
        </button>
        </header>

        {/* Date Selector */}
        <DateSelector
          fechaSeleccionada={fechaSeleccionada}
          onSeleccionar={handleSeleccionarDia}
        />

        {/* Clases Grid */}
<div className="space-y-3">
  {clases.length > 0 ? (
    clases.map(clase => (
      <ClaseCard
        key={clase.id_clase}
        clase={clase}
        onSeleccionar={async () => {
          if (!usuarioSeleccionado) {
            setToast({ mensaje: 'Por favor selecciona un cliente primero', tipo: 'error' });
            return;
          }

          if (tipoReserva === "MENSUAL") {
            try {
              const response = await fetch(`${BASE_URL}/reservas/verificar-mensual`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  id_usuario: usuarioSeleccionado.id_usuario,
                  id_clase: clase.id_clase,
                  mes: fechaSeleccionada.getMonth() + 1,
                  anio: fechaSeleccionada.getFullYear(),
                  esPresencial: true
                })
              });

              const data = await response.json();

              if (!data.ok) {
                setToast({ mensaje: data.mensaje || 'No se puede reservar esta clase', tipo: 'error' });
                return;
              }

              setFechasMensuales(data.fechas || []);
            } catch (error) {
              console.error(error);
              setToast({ mensaje: 'Error al obtener las fechas', tipo: 'error' });
              return;
            }
          } else {
            setFechasMensuales([]);
          }

          setClaseParaReservar(clase);
        }}
      />
    ))
  ) : (
    <div className="text-center py-12">
      <p className="text-white/50 text-lg">
        No hay clases disponibles para esta fecha
      </p>
    </div>
  )}
</div>
      </main>

      {/* Modal de Confirmación */}
      {claseParaReservar && (
        <ModalConfirmacion
          clase={claseParaReservar}
          usuarioSeleccionado={usuarioSeleccionado}
          tipoReserva={tipoReserva}
          fechaSeleccionada={fechaSeleccionada}
          fechasMensuales={fechasMensuales}
          onConfirmar={handleReservar}
          onCerrar={() => setClaseParaReservar(null)}
          procesando={procesando}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
