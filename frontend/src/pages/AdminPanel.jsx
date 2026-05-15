import { useNavigate } from "react-router-dom"

export default function AdminPanel() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  return (
    <div className="flex min-h-screen" style={{ background: '#1a1a2e' }}>
      <div className="flex-1 pl-20 pr-6 py-6">
        <div className="border-b pb-3 mb-8" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#8A0BD2' }}>
            Bienvenido
          </p>
          <h1 className="text-3xl font-medium text-white">Panel de administración</h1>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            onClick={() => navigate("/admin/clases/crear")}
            className="flex items-center gap-3 p-6 rounded-xl cursor-pointer hover:opacity-85 transition-opacity"
            style={{ background: '#5B0672' }}
          >
            <span className="text-3xl">➕</span>
            <div>
              <p className="text-white font-medium">Crear clase</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Agregar nueva actividad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}