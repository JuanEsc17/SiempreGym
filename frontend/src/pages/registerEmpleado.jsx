import { useState } from "react"
import { useNavigate } from "react-router-dom"

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  const today = new Date()
  const birthDate = new Date(fechaNacimiento)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

export default function RegisterEmpleado() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    username: "",
    email: "",
    dni: "",
    telefono: "",
    fechaNacimiento: "",
    rol: "empleado",
    password: ""
  })

  const [errors, setErrors]         = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.nombre) {
      newErrors.nombre = "El nombre es obligatorio"
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombre)) {
      newErrors.nombre = "Solo puede contener letras y espacios"
    }

    if (!formData.apellido) {
      newErrors.apellido = "El apellido es obligatorio"
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.apellido)) {
      newErrors.apellido = "Solo puede contener letras y espacios"
    }

    if (!formData.username) {
      newErrors.username = "El usuario es obligatorio"
    } else if (formData.username.length > 50) {
      newErrors.username = "No puede superar los 50 caracteres"
    }

    if (!formData.email) {
      newErrors.email = "El email es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.dni) {
      newErrors.dni = "El DNI es obligatorio"
    } else if (!/^[0-9]+$/.test(formData.dni)) {
      newErrors.dni = "Solo números"
    }

    if (!formData.telefono) {
      newErrors.telefono = "El teléfono es obligatorio"
    } else if (!/^[0-9]+$/.test(formData.telefono)) {
      newErrors.telefono = "Solo números"
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria"
    } else if (calcularEdad(formData.fechaNacimiento) < 18) {
      newErrors.fechaNacimiento = "El empleado debe ser mayor de 18 años"
    }

    if (!formData.rol) {
      newErrors.rol = "El rol es obligatorio"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria"
    } else if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,20}$/.test(formData.password)) {
      newErrors.password = "Entre 9 y 20 caracteres, una mayúscula y un carácter especial"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    try {
      const response = await fetch("http://localhost:3000/api/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.mensaje)
        navigate("/admin/personal")
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error(error)
      alert("Error al conectar con el servidor")
    }
  }

  const inputClass = "w-full bg-[#1a1a2e] border border-[#4a4a6a] rounded-lg p-3 text-white placeholder-gray-500 outline-none focus:border-[#8A0BD2] transition"
  const labelClass = "block text-sm mb-1 text-gray-300"
  const errorClass = "text-red-400 text-xs mt-1"

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Registrar Empleado / Profesor</h1>
          <p className="text-gray-400 mt-1">Completá los datos para crear un nuevo miembro del personal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#13132b] rounded-xl p-8 border border-[#2a2a4a]">
          <div className="grid grid-cols-2 gap-5">

            <div>
              <label className={labelClass}>Nombre <span className="text-purple-400">*</span></label>
              <input type="text" name="nombre" value={formData.nombre}
                onChange={handleChange} placeholder="Ej: Juan" className={inputClass} />
              {errors.nombre && <p className={errorClass}>{errors.nombre}</p>}
            </div>

            <div>
              <label className={labelClass}>Apellido <span className="text-purple-400">*</span></label>
              <input type="text" name="apellido" value={formData.apellido}
                onChange={handleChange} placeholder="Ej: Pérez" className={inputClass} />
              {errors.apellido && <p className={errorClass}>{errors.apellido}</p>}
            </div>

            <div>
              <label className={labelClass}>Nombre de usuario <span className="text-purple-400">*</span></label>
              <input type="text" name="username" maxLength={50} value={formData.username}
                onChange={handleChange} placeholder="Ej: juan.perez" className={inputClass} />
              {errors.username && <p className={errorClass}>{errors.username}</p>}
            </div>

            <div>
              <label className={labelClass}>Email <span className="text-purple-400">*</span></label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="Ej: juan@email.com" className={inputClass} />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>

            <div>
              <label className={labelClass}>DNI <span className="text-purple-400">*</span></label>
              <input type="text" name="dni" value={formData.dni}
                onChange={handleChange} placeholder="Ej: 12345678" className={inputClass} />
              {errors.dni && <p className={errorClass}>{errors.dni}</p>}
            </div>

            <div>
              <label className={labelClass}>Teléfono <span className="text-purple-400">*</span></label>
              <input type="text" name="telefono" value={formData.telefono}
                onChange={handleChange} placeholder="Ej: 2215555555" className={inputClass} />
              {errors.telefono && <p className={errorClass}>{errors.telefono}</p>}
            </div>

            <div>
              <label className={labelClass}>Fecha de nacimiento <span className="text-purple-400">*</span></label>
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento}
                onChange={handleChange} className={inputClass} />
              {errors.fechaNacimiento && <p className={errorClass}>{errors.fechaNacimiento}</p>}
            </div>

            <div>
              <label className={labelClass}>Rol <span className="text-purple-400">*</span></label>
              <select name="rol" value={formData.rol} onChange={handleChange} className={inputClass}>
                <option value="empleado">Empleado</option>
                <option value="profesor">Profesor</option>
              </select>
              {errors.rol && <p className={errorClass}>{errors.rol}</p>}
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Contraseña <span className="text-purple-400">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresá una contraseña"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Entre 9 y 20 caracteres, una mayúscula y un carácter especial
              </p>
              {errors.password && <p className={errorClass}>{errors.password}</p>}
            </div>

          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate("/admin/personal")}
              className="flex-1 border border-[#4a4a6a] text-gray-300 py-3 rounded-lg hover:border-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#8A0BD2] text-white py-3 rounded-lg hover:bg-[#AF50E5] transition font-medium"
            >
              Registrar
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}