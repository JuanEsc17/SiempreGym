import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import gymImage from "../assets/hero.png"

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, isEmpleado } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-[#5B0672] via-[#8A0BD2] to-[#AF50E5] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-4">Bienvenido a SiempreGym</h2>
            <p className="text-xl text-[#E2CEF6] mb-6">
              Tu destino para transformar tu cuerpo y tu vida. Entrena con los mejores profesionales y alcanza tus objetivos fitness.
            </p>
            <div className="flex gap-4">
              {isAuthenticated ? (
                isAdmin ? (
                  <button
                    onClick={() => navigate("/admin")}
                    className="px-8 py-3 rounded-lg bg-white text-[#5B0672] font-bold text-lg hover:bg-[#E2CEF6] transition-colors"
                  >
                    Panel Admin
                  </button>
                ) : isEmpleado ? (
                  <button
                    onClick={() => navigate("/empleado")}
                    className="px-8 py-3 rounded-lg bg-white text-[#5B0672] font-bold text-lg hover:bg-[#E2CEF6] transition-colors"
                  >
                    Panel Empleado
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/actividades")}
                    className="px-8 py-3 rounded-lg bg-white text-[#5B0672] font-bold text-lg hover:bg-[#E2CEF6] transition-colors"
                  >
                    Ver Actividades
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-8 py-3 rounded-lg bg-white text-[#5B0672] font-bold text-lg hover:bg-[#E2CEF6] transition-colors"
                  >
                    Entrar Ahora
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-8 py-3 rounded-lg border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-[#5B0672] transition-colors"
                  >
                    Crear Cuenta
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <img src={gymImage} alt="SiempreGym" className="rounded-2xl shadow-2xl w-full h-96 object-cover" />
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-4 text-[#5B0672]">Nuestras Actividades</h3>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Descubre las mejores opciones de entrenamiento adaptadas a tu nivel
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Activity 1: Clases Grupal */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow hover:-translate-y-2 duration-300">
              <div className="h-48 bg-linear-to-br from-[#8A0BD2] to-[#AF50E5] flex items-center justify-center">
                <div className="text-8xl">👥</div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-[#5B0672] mb-3">Clases Grupales</h4>
                <p className="text-gray-600 mb-6">
                  Participa en emocionantes clases grupales con profesores certificados. Yoga, pilates y funcional. Entrena con energía y motivación en comunidad.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-[#E2CEF6] text-[#5B0672] px-3 py-1 rounded-full text-sm font-semibold">
                    Motivación
                  </span>
                  <span className="bg-[#E2CEF6] text-[#5B0672] px-3 py-1 rounded-full text-sm font-semibold">
                    Comunidad
                  </span>
                </div>
              </div>
            </div>

            {/* Activity 2: Entrenamiento Personalizado */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow hover:-translate-y-2 duration-300">
              <div className="h-48 bg-linear-to-br from-[#AF50E5] to-[#8A0BD2] flex items-center justify-center">
                <div className="text-8xl">💪</div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-[#5B0672] mb-3">Entrenamiento Personalizado</h4>
                <p className="text-gray-600 mb-6">
                  Obtén un programa 100% personalizado según tus objetivos. Nuestros entrenadores diseñarán rutinas específicas para maximizar resultados y evitar lesiones.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-[#E2CEF6] text-[#5B0672] px-3 py-1 rounded-full text-sm font-semibold">
                    Resultados
                  </span>
                  <span className="bg-[#E2CEF6] text-[#5B0672] px-3 py-1 rounded-full text-sm font-semibold">
                    Expertos
                  </span>
                </div>
              </div>
            </div>

            {/* Activity 3: Membresía Completa */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow hover:-translate-y-2 duration-300">
              <div className="h-48 bg-linear-to-br from-[#5B0672] to-[#8A0BD2] flex items-center justify-center">
                <div className="text-8xl">⚡</div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-[#5B0672] mb-3">Membresía Completa</h4>
                <p className="text-gray-600 mb-6">
                  Acceso ilimitado a todas nuestras instalaciones, clases, piscina, sauna y área de musculación. Entrenamientos sin límites 24/7 con todo incluido.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-[#E2CEF6] text-[#5B0672] px-3 py-1 rounded-full text-sm font-semibold">
                    Premium
                  </span>
                  <span className="bg-[#E2CEF6] text-[#5B0672] px-3 py-1 rounded-full text-sm font-semibold">
                    24/7
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D033B] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2026 SiempreGym. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 mt-2">
            Tu mejor versión comienza aquí
          </p>
        </div>
      </footer>
    </div>
  )
}
