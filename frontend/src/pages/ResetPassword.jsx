import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import gymImage from "../assets/hero.png"
import { resetPassword } from "../services/authService"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [contraseñaNueva, setContraseñaNueva] = useState("")
  const [confirmacionContraseña, setConfirmacionContraseña] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const resetEmail = sessionStorage.getItem("resetEmail")
    const codeVerified = sessionStorage.getItem("codeVerified")
    
    if (!resetEmail || !codeVerified) {
      navigate("/forgot-password")
      return
    }
    setEmail(resetEmail)
  }, [navigate])

  const validatePassword = (password) => {
    // +8 caracteres, 1 mayúscula, 1 especial, máx 20
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,20}$/
    return regex.test(password)
  }

  const validate = () => {
    const newErrors = {}

    if (!contraseñaNueva) {
      newErrors.contraseñaNueva = "Se debe ingresar la contraseña"
    } else if (!validatePassword(contraseñaNueva)) {
      newErrors.contraseñaNueva = "Debe tener al menos 8 caracteres, una mayúscula, un carácter especial y máximo 20"
    }

    if (!confirmacionContraseña) {
      newErrors.confirmacionContraseña = "Se debe ingresar la confirmación de contraseña"
    }

    return newErrors
  }

  const handleChange = (field) => {
    return (e) => {
      const value = e.target.value
      if (field === "contraseñaNueva") {
        setContraseñaNueva(value)
      } else {
        setConfirmacionContraseña(value)
      }
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" })
      }
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
    const result = await resetPassword(email, contraseñaNueva, confirmacionContraseña)

    if (!result.ok) {
      setServerError(result.mensaje || "Error al cambiar la contraseña")
      setIsLoading(false)
      return
    }

    // Limpiar sessionStorage
    sessionStorage.removeItem("resetEmail")
    sessionStorage.removeItem("codeVerified")
    
    setIsLoading(false)
    
    // Mostrar mensaje de éxito y redirigir
    alert("¡Contraseña actualizada exitosamente!")
    navigate("/login")
  }

  if (!email) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="flex h-screen font-[Roboto] overflow-hidden">
      <div className="w-1/2 bg-[#E2CEF6] overflow-y-auto">
        <div className="min-h-screen flex flex-col justify-center px-16 py-10">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-4xl italic font-light text-[#5B0672] mb-8">Cambiar Contraseña</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
  <label className="block text-sm mb-2 text-[#5B0672]">Nueva Contraseña</label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      value={contraseñaNueva}
      onChange={handleChange("contraseñaNueva")}
      placeholder="••••••••"
      className="w-full border-2 border-[#8A0BD2] rounded-md p-3 bg-transparent outline-none focus:border-[#AF50E5]"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-3 text-[#5B0672]"
    >
      {showPassword ? "👁️" : "👁️‍🗨️"}
    </button>
  </div>
  {/* Requisitos de contraseña */}
  <div className="mt-2 text-xs text-[#5B0672] space-y-1">
    <p className="font-semibold">Requisitos:</p>
    <ul className="list-disc list-inside">
      <li>Mínimo 8 caracteres, máximo 20</li>
      <li>Al menos 1 letra mayúscula</li>
      <li>Al menos 1 carácter especial (!@#$%^&*)</li>
      <li>La contraseña debe ser distinta a la actual</li>
    </ul>
  </div>
  {errors.contraseñaNueva && (
    <p className="text-red-600 text-xs mt-1">{errors.contraseñaNueva}</p>
  )}
</div>

              <div className="mb-6">
                <label className="block text-sm mb-2 text-[#5B0672]">Confirmar Contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmacionContraseña}
                    onChange={handleChange("confirmacionContraseña")}
                    placeholder="••••••••"
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-3 bg-transparent outline-none focus:border-[#AF50E5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-[#5B0672]"
                  >
                    {showConfirm ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.confirmacionContraseña && (
                  <p className="text-red-600 text-xs mt-1">{errors.confirmacionContraseña}</p>
                )}
              </div>

              {serverError && <p className="text-red-600 text-sm mb-4">{serverError}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8A0BD2] text-white font-semibold py-3 rounded-full mb-4 hover:bg-[#AF50E5] transition disabled:opacity-50"
              >
                {isLoading ? "Cambiando..." : "Cambiar Contraseña →"}
              </button>

              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem("resetEmail")
                  sessionStorage.removeItem("codeVerified")
                  navigate("/login")
                }}
                className="w-full border-2 border-[#8A0BD2] text-[#5B0672] font-semibold py-3 rounded-full hover:bg-[#D9B7E8]"
              >
                Cancelar
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