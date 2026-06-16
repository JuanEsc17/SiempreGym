const express = require("express")
const cors = require("cors")
const path = require('path')
require('dotenv').config();
require("./src/db")
const authRoutes = require("./src/routes/auth")
const registerRoutes = require("./src/routes/registerRoutes")
const clasesRoutes = require("./src/routes/clasesRoutes")
const reservasRoutes = require("./src/routes/reservasRoutes")
const usuariosRoutes = require("./src/routes/usuariosRoutes")
const paymentRoutes = require("./src/routes/paymentRoutes")
const listaEsperaRoutes = require("./src/routes/listaEsperaRoutes")
const asistenciasRoutes = require("./src/routes/asistenciasRoutes");
const renovacionesRoutes = require("./src/routes/renovacionesRoutes")
require("./src/crons/renovacionesCron")
const reportesRoutes = require("./src/routes/reportesRoutes")
const personalRoutes = require("./src/routes/personalRoutes")

const app = express()



app.use('/uploads', express.static('uploads'))
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
app.use("/api/payments", paymentRoutes)
app.use("/api/lista-espera", listaEsperaRoutes)
app.use("/api/asistencias", asistenciasRoutes)
app.use("/api/renovaciones", renovacionesRoutes)
app.use("/api/reportes", reportesRoutes)
app.use("/api/personal", personalRoutes)

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})