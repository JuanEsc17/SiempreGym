import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import gymImage from "../assets/hero.png"
import { verifyResetCode } from "../services/authService"

export default function VerifyCode() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [codigo, setCodigo] = useState("")
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60) // 15 minutos

  useEffect(() => {
    // Obtener email de sessionStorage
    const resetEmail = sessionStorage.getItem("resetEmail")
    if (!resetEmail) {
      navigate("/forgot-password")
      return
    }
    setEmail(resetEmail)

    // Timer para el código (15 minutos)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const validate = () => {
    const newErrors = {}
    if (!codigo) {
      newErrors.codigo = "Se debe ingresar código de confirmación"
    }
    return newErrors
  }

  const handleChange = (e) => {
    setCodigo(e.target.value)
    if (errors.codigo) {
      setErrors({})
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

    if (timeLeft === 0) {
      setServerError("El código ha expirado. Por favor solicita uno nuevo.")
      return
    }

    setIsLoading(true)
    const result = await verifyResetCode(email, codigo)

    if (!result.ok) {
      setServerError(result.mensaje || "Error al verificar el código")
      setIsLoading(false)
      return
    }

    // Guardar verificación en sessionStorage
    sessionStorage.setItem("codeVerified", "true")
    setIsLoading(false)
    navigate("/reset-password")
  }

  if (!email) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="flex h-screen font-[Roboto] overflow-hidden">
      <div className="w-1/2 bg-[#E2CEF6] overflow-y-auto">
        <div className="min-h-screen flex flex-col justify-center px-16 py-10">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-4xl italic font-light text-[#5B0672] mb-2">Verificación</h1>
            <p className="text-sm text-[#5B0672] mb-4">
              Te hemos enviado código a <strong>{email}</strong>
            </p>
            <p className={`text-xs ${timeLeft < 300 ? "text-red-600" : "text-[#5B0672]"} mb-8`}>
              El código expira en: <strong>{formatTime(timeLeft)}</strong>
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm mb-2 text-[#5B0672]">Código de verificación</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={handleChange}
                  placeholder="00000"
                  maxLength="5"
                  className="w-full border-2 border-[#8A0BD2] rounded-md p-3 bg-transparent outline-none focus:border-[#AF50E5] text-center text-2xl tracking-widest"
                />
                {errors.codigo && <p className="text-red-600 text-xs mt-1">{errors.codigo}</p>}
              </div>
              {serverError && (
                <div className="bg-red-100 border-2 border-red-600 rounded-md p-4 mb-4">
                    <p className="text-red-600 text-sm font-semibold">{serverError}</p>
                </div>
            )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8A0BD2] text-white font-semibold py-3 rounded-full mb-4 hover:bg-[#AF50E5] transition disabled:opacity-50"
              >
                {isLoading ? "Verificando..." : "Confirmar →"}
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem("resetEmail")
                  navigate("/forgot-password")
                }}
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