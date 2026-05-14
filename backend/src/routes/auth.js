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
      
      // Guardar código con expiración (10 minutos)
      codes2FA.set(email, {
        code,
        timestamp: Date.now(),
        userId: user.id_usuario
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
      message: "Datos incompletos"
    })
  }

  const storedData = codes2FA.get(email)

  // Verificar que el código existe y no expiró (10 minutos)
  if (!storedData || storedData.code !== code) {
    return res.status(401).json({
      success: false,
      message: "Código incorrecto"
    })
  }

  if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
    codes2FA.delete(email)
    return res.status(401).json({
      success: false,
      message: "Código expirado"
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

    // Limpiar código usado
    codes2FA.delete(email)

    res.status(200).json({
      success: true,
      message: "2FA verificado",
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

module.exports = router