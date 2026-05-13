const express = require("express")
const cors = require("cors")

require("./src/db")
const authRoutes = require("./src/routes/auth")

const app = express()

// middleware
app.use(cors())
app.use(express.json())

// ruta de prueba
app.get("/", (req, res) => {
    res.send("Backend funcionando 🚀")
})

// levantar servidor
const PORT = 3000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})