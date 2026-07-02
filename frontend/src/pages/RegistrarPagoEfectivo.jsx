import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = 'http://localhost:3000/api'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

const formatFecha = (valor) => {
  if (!valor) return '—'
  const limpio = String(valor).split('T')[0].split(' ')[0]
  const [anio, mes, dia] = limpio.split('-').map(Number)
  if (!anio || isNaN(anio) || !mes || !dia) return '—'
  const d = new Date(anio, mes - 1, dia)
  return `${DIAS[d.getDay()]} ${dia} de ${MESES[mes - 1]}`
}

const formatHora = (valor) => {
  if (!valor) return '—'
  return String(valor).slice(0,5)
}

function Toast({ mensaje, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 4000)
    return () => clearTimeout(id)
  }, [])
  return (
    <div style={{
      position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
      background:'#1e1e2e', border:'1px solid rgba(16,185,129,0.4)',
      borderLeft:'4px solid #10b981', borderRadius:14, padding:'14px 20px',
      color:'white', fontSize:14, fontWeight:500, zIndex:9999,
      boxShadow:'0 8px 32px rgba(0,0,0,0.4)', maxWidth:420, textAlign:'center'
    }}>
      {mensaje}
    </div>
  )
}

function ModalConfirmacion({ reserva, cliente, onConfirmar, onCancelar, procesando }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)' }} onClick={onCancelar}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{ background:'#1a1a2e' }} onClick={e => e.stopPropagation()}>
        <div className="p-6 text-white relative" style={{ background:'linear-gradient(135deg,#4a0560,#7A0BC0)' }}>
          <button onClick={onCancelar} disabled={procesando} className="absolute top-4 right-4 border-none w-8 h-8 rounded-full cursor-pointer transition-colors" style={{ background:'rgba(0,0,0,0.25)', color:'white', fontSize:'14px', opacity: procesando ? 0.5 : 1 }}>✕</button>
          <h2 className="font-bold m-0" style={{ fontSize:'20px' }}>Confirmar pago presencial</h2>
          <p className="text-white/70 mt-2 text-sm">Verifica los datos antes de completar el pago.</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-2xl p-4" style={{ background:'rgba(138,11,210,0.15)', border:'1px solid rgba(138,11,210,0.3)' }}>
            <p className="text-white/60 text-xs mb-1">Cliente</p>
            <p className="text-white font-semibold">{cliente.username}</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background:'rgba(138,11,210,0.15)', border:'1px solid rgba(138,11,210,0.3)' }}>
            <p className="text-white/60 text-xs mb-1">Actividad</p>
            <p className="text-white font-semibold">{reserva.actividad}</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background:'rgba(138,11,210,0.15)', border:'1px solid rgba(138,11,210,0.3)' }}>
            <p className="text-white/60 text-xs mb-1">Fecha</p>
            <p className="text-white font-semibold">{formatFecha(reserva.fecha_clase)} • {formatHora(reserva.horario)} hs</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background:'rgba(138,11,210,0.15)', border:'1px solid rgba(138,11,210,0.3)' }}>
            <p className="text-white/60 text-xs mb-1">Monto pendiente</p>
            <p className="text-white font-semibold">${reserva.saldo_pendiente}</p>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={onCancelar} disabled={procesando} className="flex-1 py-3 rounded-2xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={onConfirmar} disabled={procesando} className="flex-1 py-3 rounded-2xl text-white font-bold transition-all disabled:opacity-50" style={{ background:'linear-gradient(135deg,#AF50E5,#8A0BD2)' }}>
              {procesando ? 'Completando...' : 'Completar pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegistrarPagoEfectivo() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [cliente, setCliente] = useState(null)
  const [pendientes, setPendientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [toast, setToast] = useState(null)
  const [modalReserva, setModalReserva] = useState(null)

  useEffect(() => {
    if (busqueda.length < 3) {
      setUsuarios([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`${BASE_URL}/usuarios/buscar?query=${encodeURIComponent(busqueda)}`)
        const data = await response.json()
        if (data.ok) setUsuarios(data.data)
      } catch (error) {
        console.error(error)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [busqueda])

  useEffect(() => {
    if (!cliente) {
      setPendientes([])
      return
    }

    const cargarPendientes = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${BASE_URL}/reservas/usuario/${cliente.id_usuario}`)
        const data = await response.json()
        if (data.ok) {
          const pagosPendientes = data.data.filter(r =>
            r.tipo_pago === 'seña' &&
            r.saldo_pendiente > 0 &&
            r.estado === 'reservada'
          )
          setPendientes(pagosPendientes)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    cargarPendientes()
  }, [cliente])

  const seleccionarCliente = (usuario) => {
    setCliente(usuario)
    setBusqueda(usuario.username)
    setUsuarios([])
    setModalReserva(null)
  }

  const handleRegistrarPago = async () => {
    if (!modalReserva) return

    setProcesando(true)
    try {
      const response = await fetch(`${BASE_URL}/reservas/registrar-pago-efectivo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_reserva: modalReserva.id_reserva })
      })
      const data = await response.json()
      if (!response.ok) {
        setToast(data.mensaje || 'No se pudo completar el pago')
        return
      }
      setToast('Pago completado correctamente')
      setModalReserva(null)
      setCliente({ ...cliente })
      const updated = pendientes.filter(r => r.id_reserva !== modalReserva.id_reserva)
      setPendientes(updated)
    } catch (error) {
      console.error(error)
      setToast('Error al conectar con el servidor')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#12121f', padding:'32px 40px', fontFamily:'system-ui,sans-serif' }}>
      <button onClick={() => navigate(-1)}
        style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)',
          cursor:'pointer', fontSize:13, marginBottom:20, padding:0,
          display:'flex', alignItems:'center', gap:6 }}>
        ← Volver
      </button>

      <h1 style={{ color:'white', fontSize:26, fontWeight:'bold', margin:'0 0 4px' }}>Completar pago presencial</h1>
      <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, margin:'0 0 28px' }}>
        Busca un cliente y completa sus pagos pendientes de forma presencial.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:20, alignItems:'start' }}>

        <div style={{ background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:24 }}>
          <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:12, marginBottom:10 }}>Buscar cliente por usuario o email</label>
          <input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setCliente(null)
            }}
            placeholder="Ej: Usuario1111"
            style={{ width:'100%', borderRadius:14, border:'1px solid rgba(255,255,255,0.12)', padding:'12px 14px', background:'#12121f', color:'white', outline:'none' }}
          />

          {usuarios.length > 0 && (
            <div style={{ marginTop:14, maxHeight:220, overflowY:'auto', borderRadius:14, border:'1px solid rgba(255,255,255,0.08)', background:'#12121f' }}>
              {usuarios.map(usuario => (
                <button
                  key={usuario.id_usuario}
                  onClick={() => seleccionarCliente(usuario)}
                  style={{ width:'100%', textAlign:'left', padding:'12px 14px', border:'none', background:'transparent', color:'white', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                    <span>{usuario.username}</span>
                    <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>{usuario.email}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {cliente && (
            <div style={{ marginTop:18, padding:18, border:'1px solid rgba(138,11,210,0.25)', borderRadius:14, background:'rgba(138,11,210,0.08)' }}>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, margin:'0 0 6px' }}>Cliente seleccionado</p>
              <p style={{ color:'white', fontWeight:'600', margin:0 }}>{cliente.username}</p>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:12, margin:'4px 0 0' }}>{cliente.email}</p>
            </div>
          )}
        </div>

        <div style={{ minHeight:400, background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, gap:12 }}>
            <div>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, margin:'0 0 6px' }}>Pagos pendientes</p>
              <h2 style={{ color:'white', fontSize:18, margin:0 }}>Cliente seleccionado</h2>
            </div>
            <div style={{ color:'rgba(255,255,255,0.45)', fontSize:12 }}>{cliente ? pendientes.length : 'Busca un cliente'}</div>
          </div>

          {loading ? (
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>Cargando pagos pendientes...</p>
          ) : !cliente ? (
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>Selecciona un cliente para ver sus pagos pendientes.</p>
          ) : pendientes.length === 0 ? (
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>No se encontraron pagos pendientes para este cliente.</p>
          ) : (
            <div style={{ display:'grid', gap:14 }}>
              {pendientes.map(reserva => (
                <div key={reserva.id_reserva} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start' }}>
                    <div>
                      <p style={{ color:'rgba(255,255,255,0.7)', fontSize:12, margin:'0 0 6px' }}>Actividad</p>
                      <p style={{ color:'white', fontWeight:700, margin:0 }}>{reserva.actividad}</p>
                    </div>
                    <button
                      onClick={() => setModalReserva(reserva)}
                      style={{ border:'none', borderRadius:12, background:'#8A0BD2', color:'white', padding:'10px 14px', fontSize:12, cursor:'pointer' }}>
                      Completar pago
                    </button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:14, marginTop:14 }}>
                    <div>
                      <p style={{ color:'rgba(255,255,255,0.55)', fontSize:11, margin:'0 0 4px' }}>Fecha</p>
                      <p style={{ color:'white', fontSize:13, margin:0 }}>{formatFecha(reserva.fecha_clase)}</p>
                    </div>
                    <div>
                      <p style={{ color:'rgba(255,255,255,0.55)', fontSize:11, margin:'0 0 4px' }}>Horario</p>
                      <p style={{ color:'white', fontSize:13, margin:0 }}>{formatHora(reserva.horario)} hs</p>
                    </div>
                    <div>
                      <p style={{ color:'rgba(255,255,255,0.55)', fontSize:11, margin:'0 0 4px' }}>Saldo pendiente</p>
                      <p style={{ color:'#22c55e', fontSize:13, margin:0, fontWeight:700 }}>${reserva.saldo_pendiente}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalReserva && cliente && (
        <ModalConfirmacion
          reserva={modalReserva}
          cliente={cliente}
          onConfirmar={handleRegistrarPago}
          onCancelar={() => {
            setToast('Pago cancelado')
            setModalReserva(null)
          }}
          procesando={procesando}
        />
      )}

      {toast && <Toast mensaje={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
