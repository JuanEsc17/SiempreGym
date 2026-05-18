import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const BASE_URL = 'http://localhost:3000/api'

const DIAS_LABEL = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
}

const ESTADO_COLORS = {
  activa: { bg: '#16a34a22', color: '#4ade80', texto: 'Activa' },
  inactiva: { bg: '#dc262622', color: '#f87171', texto: 'Inactiva' },
}

function Sidebar() {
  return (
    <div className="fixed top-0 left-0 h-screen w-14 flex flex-col items-center pt-5 z-50"
      style={{ background: '#5B0672' }}>
      <span className="text-white text-2xl cursor-pointer">☰</span>
    </div>
  )
}

export default function VerClasesAdmin() {
  const navigate = useNavigate()
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const res = await axios.get(`${BASE_URL}/clases/todas`)
        if (res.data.ok) setClases(res.data.data)
      } catch {
        setClases([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const clasesFiltradas = clases.filter(c =>
    c.actividad?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.dia?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="flex min-h-screen" style={{ background: '#1a1a2e' }}>
      <Sidebar />

      <div className="flex-1 pl-20 pr-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-8"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#8A0BD2' }}>
              Panel de administración
            </p>
            <h1 className="text-3xl font-medium text-white">Ver y editar clases</h1>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-lg text-sm border-none cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: '#2d2d3a', color: 'rgba(255,255,255,0.7)' }}
          >
            ← Volver al panel
          </button>
        </div>

        {/* Buscador 
        <input
          type="text"
          placeholder="Buscar por actividad o día..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-xl text-white text-sm outline-none"
          style={{
            background: '#2d2d3a',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />*/}

        {/* Lista */}
        {loading && (
          <p className="text-center py-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Cargando clases...
          </p>
        )}

        {!loading && clasesFiltradas.length === 0 && (
          <p className="text-center py-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            No hay clases registradas
          </p>
        )}

        <div className="flex flex-col gap-3">
          {clasesFiltradas.map(clase => {
            const estado = ESTADO_COLORS[clase.estado] || ESTADO_COLORS.activa
            return (
              <div key={clase.id_clase}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: '#2d2d3a', borderLeft: '3px solid #8A0BD2' }}>
                <div className="flex items-center gap-4">
                  {/* Ícono actividad */}
                  <img 
                      src={`http://localhost:3000/uploads/${clase.imagen}`}
                      alt={clase.actividad}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = '' ; e.target.style.display='none' }}
                      />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium capitalize">{clase.actividad}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: estado.bg, color: estado.color }}>
                        {estado.texto}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {DIAS_LABEL[clase.dia] || clase.dia} · {clase.horario?.slice(0, 5)} hs · {clase.duracion} min · cupo {clase.cupo_maximo} · {clase.cantidad_inscriptos} inscriptos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/editar-clase/${clase.id_clase}`)}
                  className="px-5 py-2 rounded-lg text-white text-sm border-none cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                  style={{ background: '#8A0BD2' }}
                >
                  Editar
                </button>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}