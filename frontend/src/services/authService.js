const API_URL = "http://localhost:3000/api/auth"

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  } catch (error) {
    console.error("Error en login:", error)
    return { success: false, message: "Error de conexión con el servidor" }
  }
}

export const verify2FA = async (email, code) => {
  try {
    const response = await fetch(`${API_URL}/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    })
    return response.json()
  } catch (error) {
    console.error("Error en verificación 2FA:", error)
    return { success: false, message: "Error de conexión con el servidor" }
  }
}

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("token")
    
    // Llamar al endpoint de logout (opcional en este caso)
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }).catch(err => console.log("Error al notificar logout al servidor:", err))

    // Limpiar datos locales
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    return { success: true, message: "Sesión cerrada correctamente" }
  } catch (error) {
    console.error("Error en logout:", error)
    return { success: false, message: "Error al cerrar sesión" }
  }
}

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error("Error al obtener usuario actual:", error)
    return null
  }
}

export const isAuthenticated = () => {
  return !!localStorage.getItem("token")
}

//para cambio de contraseña
const API_USUARIOS_URL = "http://localhost:3000/api/usuarios"

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_USUARIOS_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    return response.json()
  } catch (error) {
    console.error("Error al solicitar reset:", error)
    return { ok: false, mensaje: "Error de conexión con el servidor" }
  }
}

export const verifyResetCode = async (email, codigo) => {
  try {
    const response = await fetch(`${API_USUARIOS_URL}/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, codigo })
    })
    return response.json()
  } catch (error) {
    console.error("Error al verificar código:", error)
    return { ok: false, mensaje: "Error de conexión con el servidor" }
  }
}

export const resetPassword = async (email, contraseñaNueva, confirmacionContraseña) => {
  try {
    const response = await fetch(`${API_USUARIOS_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, contraseñaNueva, confirmacionContraseña })
    })
    return response.json()
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    return { ok: false, mensaje: "Error de conexión con el servidor" }
  }
}