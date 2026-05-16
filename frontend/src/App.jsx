
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"//importar paginas

import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Actividades from "./pages/Actividades.jsx"

//imports admin
import CrearClase from "./pages/CrearClase.jsx"
import AdminPanel from "./pages/AdminPanel.jsx"
import EditarClase from "./pages/EditarClase.jsx"
import VerClasesAdmin from "./pages/VerClasesAdmin.jsx"

//para que si no es admin no pueda entrar a las rutas de admin
function RutaAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user || user.rol !== 'admin') {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/actividades" element={<Actividades />} />

        {/** Rutas de administración **/}
        <Route path="/admin" element={<RutaAdmin><AdminPanel /></RutaAdmin>} />
        <Route path="/crear-clase" element={<RutaAdmin><CrearClase /></RutaAdmin>} />
        <Route path="/editar-clase/:id" element={<RutaAdmin><EditarClase /></RutaAdmin>} />
        <Route path="/ver-clases-admin" element={<RutaAdmin><VerClasesAdmin /></RutaAdmin>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App