import gymImage from "../assets/hero.png"
import { useState } from "react"
import { useNavigate } from "react-router-dom";

// Función para calcular edad
const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  
  const today = new Date()
  const birthDate = new Date(fechaNacimiento)
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export default function Register() {

    const [permisoFile, setPermisoFile] = useState(null)

    const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    username: "",
    email: "",
    dni: "",
    telefono: "",
    fechaNacimiento: "",
    password: ""
    })

    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
    const { name, value } = e.target

        setFormData({
          ...formData,
          [name]: value
        })
        
        // Si cambió la fecha de nacimiento, validar permiso
        if (name === "fechaNacimiento") {
          const newAge = calcularEdad(value)
          // Si la edad ya no está entre 14 y 18, limpiar el archivo
          if (newAge === null || newAge < 14 || newAge >= 18) {
            setPermisoFile(null)
          }
        }
    }   


    const navigate = useNavigate();
    // revisa errores, si los hay no deja enviar el formulario
    const handleSubmit = async (e) => {
      e.preventDefault()

      const validationErrors = validate()

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

    setErrors({})
    console.log("Formulario válido:", formData)

    try {
        const form = new FormData();

        Object.keys(formData).forEach(key => {
          form.append(key, formData[key]);
        });

        if (permisoFile) {
          form.append("permiso", permisoFile);
        }

        const response = await fetch("http://localhost:3000/api/register", {
          method: "POST",
          body: form
        });

        const data = await response.json();

        console.log(data);

        if (response.ok) {
          alert(data.mensaje);
          navigate("/login");
        } else {
          alert(data.error);
        }

    } catch (error) {
        console.error(error);
        alert("Error al conectar con el servidor");
    }
  }
    
    // Calcular edad
    const age = calcularEdad(formData.fechaNacimiento)

    const validate = () => {
    const newErrors = {}

  // nombre obligatorio, solo letras y espacios (escenario 7)
    if (!formData.nombre) {
      newErrors.nombre = "El nombre es obligatorio"
    } else {
      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/

      if (!nameRegex.test(formData.nombre)) {
        newErrors.nombre = "El nombre solo puede contener letras y espacios"
      }
    }

  // apellido obligatorio, solo letras y espacios (escenario 8)
    if (!formData.apellido) {
      newErrors.apellido = "El apellido es obligatorio"
    } else {
      const lastnameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/

      if (!lastnameRegex.test(formData.apellido)) {
      newErrors.apellido = "El apellido solo puede contener letras y espacios"
      }
    }

  // username: obligatorio, maximo 50 caracteres
    if (!formData.username) {
        newErrors.username = "El usuario es obligatorio"
    } else if (formData.username.length > 50) {
        newErrors.username = "El usuario no puede superar los 50 caracteres"
    }

  // email: único, respetar formato
    if (!formData.email) {
        newErrors.email = "El email es obligatorio"
    } else {
        const emailRegex = /\S+@\S+\.\S+/
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email inválido"
        }
    }

  // dni obligatorio, solo números (escenario 10)
    if (!formData.dni) {
      newErrors.dni = "El DNI es obligatorio"
    } else {
      const dniRegex = /^[0-9]+$/

      if (!dniRegex.test(formData.dni)) {
        newErrors.dni = "Numero de DNI inválido"
      }
    }

  // telefono obligatorio, solo números (escenario 9)
    if (!formData.telefono) {
      newErrors.telefono = "El teléfono es obligatorio"
    } else {
      const phoneRegex = /^[0-9]+$/

      if (!phoneRegex.test(formData.telefono)) {
        newErrors.telefono = "Numero de telefono inválido"
      }
    }

  // fecha de nacimiento obligatoria, ser mayor de 14 años  
  if (!formData.fechaNacimiento) {
        newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria"
    } else {

    // si es menor de 14 no puede registrarse
        if (age < 14) {
            newErrors.fechaNacimiento = "Debes ser mayor de 14 años para registrarte"
        }

    // VALIDACIÓN PERMISO (14 a 18)
    if (age >= 14 && age < 18) {
        if (!permisoFile) {
            newErrors.permiso = "Debes subir una autorización firmada por un adulto"
        } else if (!permisoFile.type.startsWith("image/")) {
            newErrors.permiso = "Debes ingresar una imagen válida"
          } else if (permisoFile.size > 16 * 1024 * 1024) {
              newErrors.permiso = "La foto debe ocupar hasta 16MB"
          }
    }
  }

  // contraseña obligatoria, 
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria"
    } else {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,20}$/

      if (!passwordRegex.test(formData.password)) {
        newErrors.password = "La contraseña debe tener entre 9 y 20 caracteres, una mayúscula y un carácter especial"
      }
    }

    return newErrors
    }

  return (
    <div className="flex h-screen font-[Roboto] overflow-hidden">

      {/* PANEL IZQUIERDO */}
      <div className="w-1/2 bg-[#E2CEF6] overflow-y-auto">

        <div className="min-h-screen flex flex-col justify-center px-16 py-10">

          <div className="max-w-3xl mx-auto w-full">

            <h1 className="text-4xl italic font-light text-[#5B0672] mb-8">
              Registrarse
            </h1>

            <form className="grid grid-cols-2 gap-5" onSubmit={handleSubmit}>

              {/* NOMBRE */}
              <div>
                <label className="block text-sm mb-1 text-[#5B0672]">
                  Nombre
                </label>

                <input
                  type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-2 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                {errors.nombre && (
                    <p className="text-red-600 text-xs mt-1">
                    {errors.nombre}
                    </p>
                )}
              </div>

              {/* APELLIDO */}
              <div>
                <label className="block text-sm mb-1 text-[#5B0672]">
                  Apellido
                </label>

                <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Pérez"
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-2 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                {errors.apellido && (
                    <p className="text-red-600 text-xs mt-1">{errors.apellido}</p>
                )}
              </div>

              {/* USERNAME */}
              <div>
                <label className="block text-sm mb-1 text-[#5B0672]">
                  Nombre de usuario
                </label>

                <input
                    type="text"
                    name="username"
                    maxLength={50}
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="juan123"
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-2 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                {errors.username && (
                    <p className="text-red-600 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm mb-1 text-[#5B0672]">
                  Correo electrónico
                </label>

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juan@gmail.com"
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-2 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* DNI */}
              <div>
                <label className="block text-sm mb-1 text-[#5B0672]">
                  DNI
                </label>

                <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="12345678"
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-2 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                {errors.dni && (
                    <p className="text-red-600 text-xs mt-1">{errors.dni}</p>
                )}
              </div>

              {/* TELEFONO */}
              <div>
                <label className="block text-sm mb-1 text-[#5B0672]">
                  Teléfono
                </label>

                <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="2215555555"
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-2 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                {errors.telefono && (
                    <p className="text-red-600 text-xs mt-1">{errors.telefono}</p>
                )}
              </div>

              {/* FECHA NACIMIENTO */}
              <div>
                <label className="block text-sm mb-1 text-[#5B0672]">
                  Fecha de nacimiento
                </label>

                <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-2 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                {errors.fechaNacimiento && (
                    <p className="text-red-600 text-xs mt-1">{errors.fechaNacimiento}</p>
                )}
              </div>

              {/* CONTRASEÑA */}
              <div>
                <label className="block text-sm mb-1 text-[#5B0672]">
                  Contraseña
                </label>

                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-2 bg-transparent outline-none focus:border-[#AF50E5]"
                />
                <p className="text-gray-500 text-xs mt-1">Debe incluir entre 9 y 20 caracteres, una mayúscula y un carácter especial</p>
                {errors.password && (
                    <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* permiso */}
              {age >= 14 && age < 18 && (
              <div className="col-span-2">
                <label className="block text-sm mb-1 text-[#5B0672]">
                    Autorización firmada
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPermisoFile(e.target.files[0])}
                    className="w-full border-2 border-[#8A0BD2] rounded-md p-2"
                />
                {errors.permiso && (
                    <p className="text-red-600 text-xs mt-1">{errors.permiso}</p>
                )}
              </div>
              )}

              {/* BOTON */}
              <div className="col-span-2 mt-4">
                <button
                  type="submit"
                  className="w-full bg-[#8A0BD2] text-white py-3 rounded-full text-lg hover:bg-[#AF50E5] transition"
                >
                  Registrarse →
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="w-1/2 h-screen sticky top-0">
        <img
          src={gymImage}
          alt="Gym"
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  )
}