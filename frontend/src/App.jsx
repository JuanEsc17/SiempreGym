
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
import MisReservas from './pages/MisReservas'
import PermisosAdmin from "./pages/PermisosAdmin";
import EmpleadoPanel from "./pages/EmpleadoPanel"

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

// ruta para empleados
function RutaEmpleado({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  if (!user) {
    return <Navigate to="/login" />
  }
  if (
    user.rol !== "empleado" &&
    user.rol !== "admin"
  ) {
    return <Navigate to="/" />
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
        <Route path="/actividades" element={<RutaUsuario><Actividades /></RutaUsuario>} />
        <Route path="/mis-reservas" element={<RutaProtegida><MisReservas /></RutaProtegida>} />

        {/** Rutas de administración **/}
        <Route path="/admin" element={<RutaAdmin><AdminPanel /></RutaAdmin>} />
        <Route path="/crear-clase" element={<RutaAdmin><CrearClase /></RutaAdmin>} />
        <Route path="/editar-clase/:id" element={<RutaAdmin><EditarClase /></RutaAdmin>} />
        <Route path="/ver-clases-admin" element={<RutaEmpleado><VerClasesAdmin /></RutaEmpleado>} />
        <Route path="/reserva-presencial" element={<RutaEmpleado><ReservaPresencial /></RutaEmpleado>}/>
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/admin/permisos" element={<PermisosAdmin />} />

        {/** Rutas para empleado */}
        <Route path="/empleado" element={<RutaEmpleado><EmpleadoPanel /></RutaEmpleado>}/>
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