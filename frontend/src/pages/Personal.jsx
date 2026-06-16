import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"

const ROL_STYLES = {
  profesor: "bg-purple-900 text-purple-300 border border-purple-700",
  empleado: "bg-blue-900 text-blue-300 border border-blue-700"
}

export default function Personal() {
  const navigate = useNavigate()

  const [personal, setPersonal]           = useState([])
  const [busqueda, setBusqueda]           = useState("")
  const [total, setTotal]                 = useState(0)
  const [cargando, setCargando]           = useState(false)

  const [modalAbierto, setModalAbierto]   = useState(false)
  const [empleadoSelec, setEmpleadoSelec] = useState(null)
  const [nuevoRol, setNuevoRol]           = useState("")
  const [guardando, setGuardando]         = useState(false)
  const [toast, setToast]                 = useState(null) // { mensaje, tipo }

  const mostrarToast = (mensaje, tipo = "exito") => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPersonal = useCallback(async () => {
    setCargando(true)
    try {
      const params = new URLSearchParams({ busqueda, pagina: 1, porPagina: 1000 })
      const res = await fetch(`http://localhost:3000/api/personal?${params}`)
      const data = await res.json()
      if (res.ok) {
        setPersonal(data.personal || [])
        setTotal(data.total || 0)
      } else {
        console.error("Error del servidor:", data.error)
        setPersonal([])
      }
    } catch (error) {
      console.error(error)
      setPersonal([])
    } finally {
      setCargando(false)
    }
  }, [busqueda])

  useEffect(() => {
    fetchPersonal()
  }, [fetchPersonal])

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value)
  }

  const abrirModal = (empleado) => {
    setEmpleadoSelec(empleado)
    setNuevoRol(empleado.rol)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEmpleadoSelec(null)
    setNuevoRol("")
  }

  const confirmarCambioRol = async () => {
    if (!empleadoSelec) return

    // mismo rol
    if (nuevoRol === empleadoSelec.rol) {
      mostrarToast("Este usuario ya tiene asignado ese rol", "advertencia")
      cerrarModal()
      return
    }

    setGuardando(true)
    try {
      const res = await fetch(
        `http://localhost:3000/api/personal/${empleadoSelec.id_usuario}/rol`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rol: nuevoRol })
        }
      )
      const data = await res.json()

      if (res.ok) {
        mostrarToast("Rol otorgado exitosamente", "exito")
        cerrarModal()
        fetchPersonal()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error(error)
      alert("Error al conectar con el servidor")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.tipo === "exito"
            ? "bg-green-800 text-green-200 border border-green-600"
            : "bg-yellow-800 text-yellow-200 border border-yellow-600"
        }`}>
          {toast.tipo === "exito" ? "✓ " : "⚠ "}{toast.mensaje}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
  <div>
    <button
      onClick={() => navigate("/admin")}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-3"
    >
      ← Volver al panel
    </button>
    <h1 className="text-3xl font-bold">Personal</h1>
    <p className="text-gray-400 mt-1">Gestioná todo el personal del gimnasio</p>
  </div>
  <button
    onClick={() => navigate("/admin/personal/nuevo")}
    className="flex items-center gap-2 bg-[#8A0BD2] hover:bg-[#AF50E5] text-white px-5 py-2.5 rounded-lg transition font-medium"
  >
    <span className="text-lg">＋</span> Agregar Personal
  </button>
</div>

      {/* Buscador + total */}
      <div className="flex items-center justify-between mb-5">
        <input
          type="text"
          value={busqueda}
          onChange={handleBusqueda}
          placeholder="Buscar por nombre, usuario o email..."
          className="w-80 bg-[#13132b] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#8A0BD2] transition"
        />
        <span className="text-sm text-gray-400">{total} resultado{total !== 1 ? "s" : ""}</span>
      </div>

      {/* Tabla */}
      <div className="bg-[#13132b] rounded-xl border border-[#2a2a4a] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a4a]">
              <th className="text-left px-6 py-4 text-purple-400 font-medium">Nombre y Apellido</th>
              <th className="text-left px-6 py-4 text-purple-400 font-medium">Email</th>
              <th className="text-left px-6 py-4 text-purple-400 font-medium">Usuario</th>
              <th className="text-left px-6 py-4 text-purple-400 font-medium">Rol</th>
              <th className="text-left px-6 py-4 text-purple-400 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">Cargando...</td>
              </tr>
            ) : personal.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">No se encontraron resultados</td>
              </tr>
            ) : (
              personal.map((emp) => (
                <tr key={emp.id_usuario} className="border-b border-[#1e1e3a] hover:bg-[#1a1a35] transition">
                  <td className="px-6 py-4 font-medium">{emp.nombre} {emp.apellido}</td>
                  <td className="px-6 py-4 text-gray-400">{emp.email}</td>
                  <td className="px-6 py-4 text-gray-400">{emp.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${ROL_STYLES[emp.rol] || "bg-gray-800 text-gray-300"}`}>
                      {emp.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => abrirModal(emp)}
                      className="text-sm text-purple-400 hover:text-purple-200 border border-purple-800 hover:border-purple-500 px-3 py-1.5 rounded-lg transition"
                    >
                      Cambiar rol
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal cambio de rol */}
      {modalAbierto && empleadoSelec && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#13132b] border border-[#2a2a4a] rounded-xl p-6 w-full max-w-sm shadow-xl">

            <h2 className="text-lg font-semibold mb-1">Cambiar rol</h2>
            <p className="text-gray-400 text-sm mb-5">
              {empleadoSelec.nombre} {empleadoSelec.apellido}
            </p>

            <label className="block text-sm text-gray-300 mb-2">Nuevo rol</label>
            <select
              value={nuevoRol}
              onChange={(e) => setNuevoRol(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-[#4a4a6a] rounded-lg p-3 text-white outline-none focus:border-[#8A0BD2] transition mb-6"
            >
              <option value="empleado">Empleado</option>
              <option value="profesor">Profesor</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={cerrarModal}
                disabled={guardando}
                className="flex-1 border border-[#4a4a6a] text-gray-300 py-2.5 rounded-lg hover:border-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambioRol}
                disabled={guardando}
                className="flex-1 bg-[#8A0BD2] text-white py-2.5 rounded-lg hover:bg-[#AF50E5] transition disabled:opacity-40"
              >
                {guardando ? "Guardando..." : "Confirmar"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}