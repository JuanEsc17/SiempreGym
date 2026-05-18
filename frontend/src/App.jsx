
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Header from "./components/Header"
import PaymentStatus from './pages/PaymentStatus'
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Actividades from "./pages/Actividades.jsx"
import CrearClase from "./pages/CrearClase.jsx"
import AdminPanel from "./pages/AdminPanel.jsx"
import EditarClase from "./pages/EditarClase.jsx"
import VerClasesAdmin from "./pages/VerClasesAdmin.jsx"

//para que si no es admin no pueda entrar a las rutas de admin
function RutaAdmin({ children }) {
  const { isAdmin, isAuthenticated } = useAuth()
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />
  }
  return children
}

function AppContent() {
  const { isLoading } = useAuth()
  const location = useLocation()
  
  // Rutas donde no debe aparecer el Header
  const noHeaderRoutes = ["/login", "/register"]
  const showHeader = !noHeaderRoutes.includes(location.pathname)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8A0BD2] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {showHeader && <Header />}
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
        <Route path="/payment-status" element={<PaymentStatus />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App