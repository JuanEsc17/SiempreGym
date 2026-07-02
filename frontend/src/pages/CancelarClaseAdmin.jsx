import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const BASE_URL = 'http://localhost:3000/api'

const DIAS_LABEL = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
}

function Sidebar() {
  return (
    <div className="fixed top-0 left-0 h-screen w-14 flex flex-col items-center pt-5 z-50"
      style={{ background: '#5B0672' }}>
      <span className="text-white text-2xl cursor-pointer">☰</span>
    </div>
  )
}

export default function CancelarClaseAdmin() {
  const navigate = useNavigate()
  const [instancias, setInstancias] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelando, setCancelando] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const [actividadFiltro, setActividadFiltro] = useState("")
  const [fechaFiltro, setFechaFiltro] = useState("")

  useEffect(() => {
    cargarInstancias()
  }, [])

  async function cargarInstancias() {
    try {
      setLoading(true)
      const res = await axios.get(`${BASE_URL}/instancias/bimestre`)
      if (res.data.ok) setInstancias(res.data.data)
    } catch {
      setInstancias([])
    } finally {
      setLoading(false)
    }
  }

  async function cancelarClase(instancia) {
    const confirmacion = window.confirm(
      `¿Cancelar la clase de ${instancia.actividad} del ${instancia.fecha} a las ${instancia.horario?.slice(0, 5)}?`
    )
    if (!confirmacion) {
      setToastMsg('Operación cancelada')
      return
    }

    try {
      setCancelando(instancia.id_instancia || `${instancia.id_clase}-${instancia.fecha}`)
      const res = await axios.post(`${BASE_URL}/instancias/cancelar`, {
        id_clase: instancia.id_clase,
        fecha: instancia.fecha
      })
      if (res.data.ok) {
        alert(res.data.mensaje)
        cargarInstancias()
      }
    } catch (error) {
      const mensaje = error?.response?.data?.mensaje || 'No se pudo cancelar la clase'
      alert(mensaje)
    } finally {
      setCancelando(null)
    }
  }

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(''), 4000)
    return () => clearTimeout(t)
  }, [toastMsg])

  //marian
  const instanciasFiltradas = instancias.filter(inst => {

  const coincideActividad =
    actividadFiltro === "" ||
    inst.actividad === actividadFiltro

  const coincideFecha =
    fechaFiltro === "" ||
    inst.fecha === fechaFiltro

  return coincideActividad && coincideFecha
})
//

  const groupedByDay = {}
  instanciasFiltradas.forEach(inst => {
    if (!groupedByDay[inst.fecha]) {
      groupedByDay[inst.fecha] = []
    }
    groupedByDay[inst.fecha].push(inst)
  })

  const sortedDates = Object.keys(groupedByDay).sort()

  return (
    <div className="flex min-h-screen" style={{ background: '#1a1a2e' }}>
      <Sidebar />

      <div className="flex-1 pl-20 pr-6 py-6">

        <div className="flex items-center justify-between border-b pb-3 mb-8"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#8A0BD2' }}>
              Panel de administración
            </p>
            <h1 className="text-3xl font-medium text-white">Cancelar clase</h1>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-lg text-sm border-none cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: '#2d2d3a', color: 'rgba(255,255,255,0.7)' }}
          >
            ← Volver al panel
          </button>
        </div>

      
        {/* FILTROS */}
<div className="flex gap-4 mb-6 flex-wrap">

  <select
    value={actividadFiltro}
    onChange={(e) => setActividadFiltro(e.target.value)}
    className="px-4 py-2 rounded-lg"
    style={{
      background: "#2d2d3a",
      color: "white",
      border: "1px solid rgba(255,255,255,0.1)"
    }}
  >
    <option value="">Todas las actividades</option>
    <option value="yoga">Yoga</option>
    <option value="pilates">Pilates</option>
    <option value="funcional">Funcional</option>
  </select>

  <input
    type="date"
    value={fechaFiltro}
    onChange={(e) => setFechaFiltro(e.target.value)}
    className="px-4 py-2 rounded-lg"
    style={{
      background: "#2d2d3a",
      color: "white",
      border: "1px solid rgba(255,255,255,0.1)"
    }}
  />

</div>
        

        {loading && (
          <p className="text-center py-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Cargando clases de los próximos 2 meses...
          </p>
        )}

        {!loading && instanciasFiltradas.length === 0 && (
          <p className="text-center py-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            No se encontraron clases con los filtros seleccionados.
          </p>
        )}

        {!loading && sortedDates.map(fecha => {
          const dateObj = new Date(fecha + 'T12:00:00')
          const diaSemana = dateObj.toLocaleDateString('es-ES', { weekday: 'long' })
          const fechaDisplay = dateObj.toLocaleDateString('es-ES', {
            day: 'numeric', month: 'long', year: 'numeric'
          })

          return (
            <div key={fecha} className="mb-6">
              <h2 className="text-white text-lg font-medium capitalize mb-3" style={{ color: '#8A0BD2' }}>
                {diaSemana} - {fechaDisplay}
              </h2>

              <div className="flex flex-col gap-3">
                {groupedByDay[fecha].map(inst => {
                  const isCanceled = inst.cancelada
                  const cancelKey = inst.id_instancia || `${inst.id_clase}-${inst.fecha}`

                  return (
                    <div key={cancelKey}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{
                        background: '#2d2d3a',
                        borderLeft: isCanceled ? '3px solid #dc2626' : '3px solid #8A0BD2',
                        opacity: isCanceled ? 0.6 : 1
                      }}>
                      <div className="flex items-center gap-4">
                        <img
                          src={`http://localhost:3000/uploads/${inst.imagen}`}
                          alt={inst.actividad}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          onError={(e) => { e.target.src = ''; e.target.style.display = 'none' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium capitalize">{inst.actividad}</p>
                            {isCanceled && (
                              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow"
                                style={{ background: '#374151', color: '#9ca3af' }}>
                                ❌ Clase cancelada
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {DIAS_LABEL[inst.dia] || inst.dia} · {inst.horario?.slice(0, 5)} hs · {inst.duracion} min
                            {inst.profesor ? ` · ${inst.profesor}` : ''}
                            {inst.sala ? ` · Sala ${inst.sala}` : ''}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Cupo: {inst.cupo_maximo} · Inscriptos: {inst.inscriptos}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        {isCanceled ? (
                          <span className="text-xs px-3 py-2 rounded-lg"
                            style={{ background: '#2d2d3a', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            No disponible
                          </span>
                        ) : (
                          <button
                            onClick={() => cancelarClase(inst)}
                            disabled={cancelando === cancelKey}
                            className="px-5 py-2 rounded-lg text-white text-sm border-none cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                            style={{ background: '#DC2626' }}
                          >
                            {cancelando === cancelKey ? 'Cancelando...' : 'Cancelar clase'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

      </div>

      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1e1e2e', border: '1px solid rgba(139, 11, 210, 0.4)',
          borderLeft: '4px solid #8A0BD2', borderRadius: 14, padding: '14px 20px',
          color: 'white', fontSize: 14, fontWeight: 500, zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: 400, textAlign: 'center'
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  )
}
