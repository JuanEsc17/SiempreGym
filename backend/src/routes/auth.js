const express = require("express")
const jwt = require("jsonwebtoken")
const connection = require("../db")
const { sendVerificationCode } = require("../services/emailService")

const router = express.Router()

// Almacenar códigos temporalmente (en producción, usar Redis)
const codes2FA = new Map()

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id_usuario, email: user.email, rol: user.rol },
    process.env.JWT_SECRET || "tu_secreto_super_seguro",
    { expiresIn: "24h" }
  )
}

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email y contraseña son requeridos"
    })
  }

  const query = "SELECT * FROM usuarios WHERE email = ?"
  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error en BD:", err)
      return res.status(500).json({
        success: false,
        message: "Error en el servidor"
      })
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Mail y/o contraseña incorrectos"
      })
    }

    const user = results[0]
    const passwordMatch = user.password === password
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Mail y/o contraseña incorrectos"
      })
    }

    // Si es admin, enviar código 2FA
    if (user.rol === "admin") {
      const code = generateVerificationCode()
      
      // Guardar código con expiración (15 minutos)
      codes2FA.set(email, {
        code,
        timestamp: Date.now(),
        userId: user.id_usuario,
        usado: false
      })

      // Enviar email
      const emailSent = await sendVerificationCode(email, code)

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: "Error al enviar el código de verificación"
        })
      }

      return res.status(200).json({
        success: true,
        message: "Código enviado a tu email",
        requires2FA: true,
        email: user.email,
        userId: user.id_usuario
      })
    }

    // Login directo para otros roles
    const token = generateToken(user)
    res.status(200).json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      }
    })
  })
})

// POST /api/auth/verify-2fa
router.post("/verify-2fa", (req, res) => {
  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Campo incompleto"
    })
  }

  const storedData = codes2FA.get(email)

  if (!storedData) {
    return res.status(401).json({
      success: false,
      message: "Código no válido"
    })
  }

  // Verificar si el código fue usado
  if (storedData.usado) {
    return res.status(401).json({
      success: false,
      message: "Código ya utilizado"
    })
  }

  // Verificar expiración (15 minutos)
  if (Date.now() - storedData.timestamp > 15 * 60 * 1000) {
    codes2FA.delete(email)
    return res.status(401).json({
      success: false,
      message: "Este código ya venció"
    })
  }

  // Verificar que el código coincide
  if (storedData.code !== code) {
    return res.status(401).json({
      success: false,
      message: "Código incorrecto"
    })
  }

  // Buscar usuario
  connection.query("SELECT * FROM usuarios WHERE id_usuario = ?", [storedData.userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      })
    }

    const user = results[0]
    const token = generateToken(user)

    // Marcar código como usado
    storedData.usado = true

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      }
    })
  })
})

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  try {
    // En una implementación con blacklist de tokens, aquí se agregaría el token a la lista negra
    // Por ahora, simplemente respondemos confirmando el logout
    res.status(200).json({
      success: true,
      message: "Sesión cerrada correctamente"
    })
  } catch (error) {
    console.error("Error en logout:", error)
    res.status(500).json({
      success: false,
      message: "Error al cerrar sesión"
    })
  }
})

module.exports = router