import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import gymImage from "../assets/hero.png"
import { loginUser, verify2FA } from "../services/authService"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [userFor2FA, setUserFor2FA] = useState(null)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password) => {
    return password && password.length >= 1
  }

  const getRedirectPath = (rol) => {
    if (rol === "cliente") return "/actividades"
    if (rol === "admin") return "/admin"
    if (rol === "empleado") return "/empleado" // agrego para empleado (marian)
    return "/"
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = "El email es obligatorio"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido"
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos 1 carácter"
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    const result = await loginUser(formData.email, formData.password)

    if (!result.success) {
      setServerError(result.message)
      setIsLoading(false)
      return
    }

    // Si requiere 2FA
    if (result.requires2FA) {
      setUserFor2FA({ email: formData.email, userId: result.userId })
      setShow2FA(true)
      setIsLoading(false)
      return
    }

    // Login exitoso directo
    setErrors({})
    setServerError("")
    login(result.user, result.token)
    console.log("Login exitoso:", result.user.email)
    setFormData({ email: "", password: "" })
    setIsLoading(false)
    navigate(getRedirectPath(result.user.rol))
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    if (!verificationCode) {
      setErrors({ verificationCode: "El código es obligatorio" })
      return
    }

    const result = await verify2FA(userFor2FA.email, verificationCode)

    if (!result.success) {
      setErrors({ verificationCode: result.message })
      return
    }

    login(result.user, result.token)
    console.log("Login exitoso con 2FA")
    setShow2FA(false)
    setFormData({ email: "", password: "" })
    navigate(getRedirectPath(result.user.rol))
  }

  const handleBack2FA = () => {
    setShow2FA(false)
    setVerificationCode("")
    setUserFor2FA(null)
    setErrors({})
    setFormData({ email: "", password: "" })
  }

  if (show2FA) {
    return (
      <div className="flex h-screen font-[Roboto] overflow-hidden">
        <div className="w-1/2 bg-[#E2CEF6] overflow-y-auto">
          <div className="min-h-screen flex flex-col justify-center px-16 py-10">
            <div className="max-w-md mx-auto w-full">
              <h1 className="text-4xl italic font-light text-[#5B0672] mb-2">Verificación</h1>
              <p className="text-sm text-[#5B0672] mb-8">
                Te hemos enviado código a <strong>{userFor2FA?.email}</strong>
              </p>
              <form onSubmit={handleVerify2FA}>
                <div className="mb-6">
                  <label className="block text-sm mb-2 text-[#5B0672]">Código de verificación</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value)
                      setErrors({ ...errors, verificationCode: "" })
                    }}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-3 bg-transparent outline-none focus:border-[#AF50E5] text-center"
                  />
                  {errors.verificationCode && <p className="text-red-600 text-xs mt-2">{errors.verificationCode}</p>}
                </div>
                <button type="submit" className="w-full bg-[#8A0BD2] text-white font-semibold py-3 rounded-full mb-4 hover:bg-[#AF50E5] transition">
                  Verificar código →
                </button>
                <button
                  type="button"
                  onClick={handleBack2FA}
                  className="w-full border-2 border-[#8A0BD2] text-[#5B0672] font-semibold py-3 rounded-full hover:bg-[#D9B7E8]"
                >
                  Volver
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="w-1/2 bg-[#5B0672] overflow-hidden flex items-center justify-center">
          <img src={gymImage} alt="Gym" className="w-full h-full object-cover" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen font-[Roboto] overflow-hidden">
      <div className="w-1/2 bg-[#E2CEF6] overflow-y-auto">
        <div className="min-h-screen flex flex-col justify-center px-16 py-10">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-4xl italic font-light text-[#5B0672] mb-8">Iniciar sesión</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm mb-2 text-[#5B0672]">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@example.com"
                  className="w-full border-2 border-[#8A0BD2] rounded-md p-3 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="mb-6">
                <label className="block text-sm mb-2 text-[#5B0672]">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border-2 border-[#8A0BD2] rounded-md p-3 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>
              {serverError && (
                <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-600 rounded">
                  <p className="text-red-700 text-sm">{serverError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8A0BD2] text-white font-semibold py-3 rounded-full mb-4 hover:bg-[#AF50E5] transition disabled:opacity-50"
              >
                {isLoading ? "Iniciando..." : "Iniciar sesión →"}
              </button>
              <div className="text-center mb-6">
                <a href="#" className="text-sm text-[#5B0672] underline hover:text-[#8A0BD2]">
                  Olvidé mi contraseña
                </a>
              </div>
              <div className="text-center">
                <p className="text-sm text-[#5B0672]">
                  ¿Todavía no tienes cuenta?{" "}
                  <a href="/register" className="underline font-semibold hover:text-[#8A0BD2]">
                    Regístrate
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="w-1/2 bg-[#5B0672] overflow-hidden flex items-center justify-center">
        <img src={gymImage} alt="Gym" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}