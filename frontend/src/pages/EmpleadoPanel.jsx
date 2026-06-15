import { useNavigate } from "react-router-dom"

export default function EmpleadoPanel() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen" style={{ background: '#1a1a2e' }}>
      <div className="flex-1 pl-20 pr-6 py-6">

        <div
          className="border-b pb-3 mb-8"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: '#8A0BD2' }}
          >
            Bienvenido
          </p>

          <h1 className="text-3xl font-medium text-white">
            Panel de empleado
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4">

          {/* RESERVA PRESENCIAL */}
          <div
            onClick={() => navigate("/reserva-presencial")}
            className="flex items-center gap-3 p-6 rounded-xl cursor-pointer hover:opacity-85 transition-opacity"
            style={{ background: '#AF50E5' }}
          >
            <span className="text-3xl">📅</span>

            <div>
              <p className="text-white font-medium">
                Reserva presencial
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Registrar reservas para clientes
              </p>
            </div>
          </div>

          {/* VER CLASES */}
          <div
            onClick={() => navigate("/ver-clases-admin")}
            className="flex items-center gap-3 p-6 rounded-xl cursor-pointer hover:opacity-85 transition-opacity"
            style={{ background: '#8A0BD2' }}
          >
            <span className="text-3xl">📋</span>

            <div>
              <p className="text-white font-medium">
                Ver clases
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Consultar horarios y actividades
              </p>
            </div>
          </div>

          {/* REGISTRAR CLIENTE */}
          <div
            onClick={() => navigate("/empleado/registrar-usuario")}
            className="flex items-center gap-3 p-6 rounded-xl cursor-pointer hover:opacity-85 transition-opacity"
            style={{ background: '#5B0672' }}
          >
            <span className="text-3xl">➕</span>

            <div>
              <p className="text-white font-medium">
                Registrar cliente
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Crear una nueva cuenta para un cliente
              </p>
            </div>
          </div>

          {/* REGISTRAR ASISTENCIA */}
          <div
            onClick={() => navigate("/empleado/asistencia")}
            className="flex items-center gap-3 p-6 rounded-xl cursor-pointer hover:opacity-85 transition-opacity"
            style={{ background: '#6D28D9' }}
          >
            <span className="text-3xl">✅</span>

            <div>
              <p className="text-white font-medium">
                Registrar asistencia
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Marcar asistencia manual de clientes
              </p>
            </div>
          </div>

          {/* REGISTRAR PAGO EFECTIVO */}
          <div
            onClick={() => navigate("/registrar-pago")}
            className="flex items-center gap-3 p-6 rounded-xl cursor-pointer hover:opacity-85 transition-opacity"
            style={{ background: '#10B981' }}
          >
            <span className="text-3xl">💵</span>

            <div>
              <p className="text-white font-medium">
                Registrar pago efectivo
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Actualizar pagos pendientes de clientes
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}