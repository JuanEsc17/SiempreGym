import { useState } from "react"
import { useNavigate } from "react-router-dom"
import gymImage from "../assets/hero.png"

const USERS_DB = {
  "facundotaddei@gmail.com": { password: "Mar1234!", rol: "cliente" },
  "simonbanos@gmail.com": { password: "Cocina123!", rol: "profesor" },
  "matiascorrea@gmail.com": { password: "Arte123!", rol: "empleado" },
  "agusperez@gmail.com": { password: "Password123!", rol: "cliente" },
  "florenciaesc@gmail.com": { password: "Termo123!", rol: "administrador" }
}

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [userFor2FA, setUserFor2FA] = useState(null)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password) => {
    return password && password.length >= 1
  }

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const sendVerificationEmail = (email, code) => {
    console.log(`Código enviado a ${email}: ${code}`)
    return true
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
    await new Promise(resolve => setTimeout(resolve, 500))

    const user = USERS_DB[formData.email]

    if (!user) {
      setServerError("Mail y/o contraseña incorrectos")
      setIsLoading(false)
      return
    }

    if (user.password !== formData.password) {
      setServerError("Mail y/o contraseña incorrectos")
      setIsLoading(false)
      return
    }

    // Si es admin, mostrar pantalla 2FA
    if (user.rol === "administrador") {
      const code = generateVerificationCode()
      setGeneratedCode(code)
      sendVerificationEmail(formData.email, code)
      setUserFor2FA({ email: formData.email, rol: user.rol })
      setShow2FA(true)
      setIsLoading(false)
      return
    }

    // Login exitoso
    setErrors({})
    setServerError("")
    localStorage.setItem("user", JSON.stringify({ email: formData.email, rol: user.rol }))
    console.log(`Login exitoso como ${user.rol}:`, formData.email)
    setFormData({ email: "", password: "" })
    setIsLoading(false)
    navigate("/")
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    if (!verificationCode) {
      setErrors({ verificationCode: "El código es obligatorio" })
      return
    }
    if (verificationCode !== generatedCode) {
      setErrors({ verificationCode: "Código incorrecto" })
      return
    }

    localStorage.setItem("user", JSON.stringify({ email: userFor2FA.email, rol: userFor2FA.rol }))
    console.log("Login exitoso con 2FA")
    setShow2FA(false)
    setFormData({ email: "", password: "" })
    navigate("/")
  }

  const handleBack2FA = () => {
    setShow2FA(false)
    setVerificationCode("")
    setGeneratedCode("")
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