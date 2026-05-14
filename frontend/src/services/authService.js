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
