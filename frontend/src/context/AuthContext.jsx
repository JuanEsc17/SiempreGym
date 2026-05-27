import { createContext, useContext, useState, useEffect } from "react"
import { logoutUser as logoutService } from "../services/authService"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Inicializar desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const savedToken = localStorage.getItem("token")
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch (error) {
        console.error("Error al cargar sesión:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }
    setIsLoading(false)
  }, [])

  const logout = async () => {
    try {
      await logoutService()
      setUser(null)
      setToken(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      return { success: true }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      return { success: false, error }
    }
  }

  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", tokenData)
  }

  const isAuthenticated = !!token && !!user
  const isAdmin = user?.rol === "admin"
  const isEmpleado = user?.rol === "empleado"

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated,
      isAdmin,
      isEmpleado,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider")
  }
  return context
}
