const express = require("express")
const cors = require("cors")
const path = require('path')


require("./src/db")
const authRoutes = require("./src/routes/auth")
const registerRoutes = require("./src/routes/register")
const clasesRoutes = require("./src/routes/clasesRoutes")
const reservasRoutes = require("./src/routes/reservasRoutes")
const usuariosRoutes = require("./src/routes/usuariosRoutes")

const app = express()

app.use('/uploads', express.static('uploads'))//para servir las imagenes de las clases
app.use('/uploads', (req, res, next) => {
    res.setHeader('Content-Type', 'image/jpeg')
    next()
}, express.static(path.join(__dirname, 'uploads')))
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Backend funcionando 🚀")
})

app.use("/api/auth", authRoutes)
app.use("/api", registerRoutes)
app.use("/api/clases", clasesRoutes)
app.use("/api/reservas", reservasRoutes)
app.use("/api/usuarios", usuariosRoutes)

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})