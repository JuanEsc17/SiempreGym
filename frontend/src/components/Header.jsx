import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import gymLogo from "../assets/logo.png"

export default function Header() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    const result = await logout()
    if (result.success) {
      setShowLogoutConfirm(false)
      navigate("/")
    }
  }

  return (
    <>
      <header className="bg-gradient-to-r from-[#5d0874] to-[#8A0BD2] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          >
            <img src={gymLogo} alt="SiempreGym Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-3xl font-bold">SiempreGym</h1>
          </div>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-sm">Hola, <strong>{user?.nombre}</strong></span>
                {user?.rol === "admin" && (
                  <span className="text-xs px-2 py-1 bg-red-600 rounded-full font-semibold">ADMIN</span>
                )}
                <button 
                  onClick={handleLogoutClick} 
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate("/login")} 
                  className="px-6 py-2 rounded-lg bg-white text-[#5B0672] font-semibold hover:opacity-90 transition-opacity"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => navigate("/register")} 
                  className="px-6 py-2 rounded-lg bg-[#AF50E5] text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modal de confirmación de logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Confirmar cierre de sesión</h2>
            <p className="text-gray-600 mb-2">¿Estás seguro de que deseas cerrar sesión?</p>
            <p className="text-sm text-gray-500 mb-6">Sesión del usuario: <strong>{user?.email}</strong></p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}