import { useNavigate } from "react-router-dom"
import gymLogo from "../assets/logo.png"

export default function Header() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const isLoggedIn = !!user

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  return (
    <header className="bg-gradient-to-r from-[#5d0874] to-[#8A0BD2] text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img src={gymLogo} alt="SiempreGym Logo" className="h-12 w-12 rounded-full object-cover" />
          <h1 className="text-3xl font-bold">SiempreGym</h1>
        </div>
        <div className="flex gap-4 items-center">
          {isLoggedIn ? (
            <>
              <span className="text-sm">Hola, <strong>{user.nombre}</strong></span>
              <button onClick={handleLogout} className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="px-6 py-2 rounded-lg bg-white text-[#5B0672] font-semibold">
                Iniciar Sesión
              </button>
              <button onClick={() => navigate("/register")} className="px-6 py-2 rounded-lg bg-[#AF50E5] text-white font-semibold">
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}