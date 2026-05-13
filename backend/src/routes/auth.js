const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const connection = require("../db")

const router = express.Router()

// Generar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id_usuario, email: user.email, rol: user.rol },
    process.env.JWT_SECRET || "tu_secreto_super_seguro",
    { expiresIn: "24h" }
  )
}

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body

  // Validación básica
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email y contraseña son requeridos"
    })
  }

  // Buscar usuario en la BD
  const query = "SELECT * FROM usuarios WHERE email = ?"
  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error en BD:", err)
      return res.status(500).json({
        success: false,
        message: "Error en el servidor"
      })
    }

    // Usuario no encontrado
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Mail y/o contraseña incorrectos"
      })
    }

    const user = results[0]

    // Comparar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Mail y/o contraseña incorrectos"
      })
    }

    // Login exitoso - generar token
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

module.exports = router