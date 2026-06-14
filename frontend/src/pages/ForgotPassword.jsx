import { useState } from "react"
import { useNavigate } from "react-router-dom"
import gymImage from "../assets/hero.png"
import { requestPasswordReset } from "../services/authService"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validate = () => {
    const newErrors = {}
    if (!email) {
      newErrors.email = "Se debe ingresar el mail"
    } else if (!validateEmail(email)) {
      newErrors.email = "Email inválido"
    }
    return newErrors
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (errors.email) {
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

    setIsLoading(true)
    const result = await requestPasswordReset(email)

    if (!result.ok) {
      setServerError(result.mensaje || "Error al enviar el código")
      setIsLoading(false)
      return
    }

    // Guardar email en sessionStorage para usar en la siguiente página
    sessionStorage.setItem("resetEmail", email)
    setSuccess(true)
    setIsLoading(false)
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      navigate("/verify-code")
    }, 2000)
  }

  return (
    <div className="flex h-screen font-[Roboto] overflow-hidden">
      <div className="w-1/2 bg-[#E2CEF6] overflow-y-auto">
        <div className="min-h-screen flex flex-col justify-center px-16 py-10">
          <div className="max-w-md mx-auto w-full">
            {!success ? (
              <>
                <h1 className="text-4xl italic font-light text-[#5B0672] mb-2">Recuperar Contraseña</h1>
                <p className="text-sm text-[#5B0672] mb-8">
                  Ingresa tu email y te enviaremos un código de confirmación
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm mb-2 text-[#5B0672]">Correo electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="usuario@example.com"
                      className="w-full border-2 border-[#8A0BD2] rounded-md p-3 bg-transparent outline-none focus:border-[#AF50E5]"
                    />
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                  </div>
                  {serverError && <p className="text-red-600 text-sm mb-4">{serverError}</p>}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#8A0BD2] text-white font-semibold py-3 rounded-full mb-4 hover:bg-[#AF50E5] transition disabled:opacity-50"
                  >
                    {isLoading ? "Enviando..." : "Enviar código →"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full border-2 border-[#8A0BD2] text-[#5B0672] font-semibold py-3 rounded-full hover:bg-[#D9B7E8]"
                  >
                    Volver a Login
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <h1 className="text-3xl italic font-light text-[#5B0672] mb-4">¡Código Enviado!</h1>
                <p className="text-sm text-[#5B0672] mb-4">
                  Hemos enviado un código de confirmación a <strong>{email}</strong>
                </p>
                <p className="text-xs text-[#5B0672] opacity-75">
                  Serás redirigido en unos momentos...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-1/2 bg-[#5B0672] overflow-hidden flex items-center justify-center">
        <img src={gymImage} alt="Gym" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}