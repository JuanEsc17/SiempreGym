
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
import ReservaPresencial from "./pages/ReservaPresencial.jsx"
<<<<<<< HEAD
import MisReservas from './pages/MisReservas';
=======
import PermisosAdmin from "./pages/PermisosAdmin";
>>>>>>> 9db4e6d24e80e5b22a320a51f96a1bf19c543a84

// Ruta protegida para usuarios autenticados
function RutaProtegida({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  // Bloquear acceso a admins en rutas de usuario regular
  if (isAdmin) {
    return <Navigate to="/admin" />
  }
  
  return children
}

// Ruta protegida para usuarios no admin
function RutaUsuario({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (isAdmin) {
    return <Navigate to="/admin" />
  }
  
  return children
}

// Ruta protegida solo para administradores
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
<<<<<<< HEAD
        <Route path="/actividades" element={<RutaProtegida><Actividades /></RutaProtegida>} />
        <Route path="/mis-reservas" element={<RutaProtegida><MisReservas /></RutaProtegida>} />
=======
        <Route path="/actividades" element={<RutaUsuario><Actividades /></RutaUsuario>} />
>>>>>>> 9db4e6d24e80e5b22a320a51f96a1bf19c543a84

        {/** Rutas de administración **/}
        <Route path="/admin" element={<RutaAdmin><AdminPanel /></RutaAdmin>} />
        <Route path="/crear-clase" element={<RutaAdmin><CrearClase /></RutaAdmin>} />
        <Route path="/editar-clase/:id" element={<RutaAdmin><EditarClase /></RutaAdmin>} />
        <Route path="/ver-clases-admin" element={<RutaAdmin><VerClasesAdmin /></RutaAdmin>} />
        <Route path="/reserva-presencial" element={<RutaAdmin><ReservaPresencial /></RutaAdmin>}/>
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/admin/permisos" element={<PermisosAdmin />} />
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