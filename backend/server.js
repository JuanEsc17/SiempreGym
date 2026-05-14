const express = require("express")
const cors = require("cors")

require("./src/db")
const authRoutes = require("./src/routes/auth")

const registerRoutes = require("./src/routes/register");

const app = express()

// middleware
app.use(cors())
app.use(express.json())

// ruta de prueba
app.get("/", (req, res) => {
    res.send("Backend funcionando 🚀")
})

app.use("/api/auth", authRoutes);
app.use("/api", registerRoutes);

// levantar servidor
const PORT = 3000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})