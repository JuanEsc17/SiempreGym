import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:3000/api";

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;

  const today = new Date();
  const birthDate = new Date(fechaNacimiento);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export default function RegistrarUsuarioEmpleado() {
    const navigate = useNavigate();
  const [permisoFile, setPermisoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    username: "",
    email: "",
    dni: "",
    telefono: "",
    fechaNacimiento: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState("");

  const age = calcularEdad(formData.fechaNacimiento);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "fechaNacimiento") {
      const edad = calcularEdad(value);

      if (edad < 14 || edad >= 18) {
        setPermisoFile(null);
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const emailRegex = /\S+@\S+\.\S+/;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,20}$/;

    if (!formData.nombre) {
      newErrors.nombre = "Ingrese un nombre";
    } else if (!textRegex.test(formData.nombre)) {
      newErrors.nombre =
        "El nombre solo puede contener letras y espacios";
    }

    if (!formData.apellido) {
      newErrors.apellido = "Ingrese un apellido";
    } else if (!textRegex.test(formData.apellido)) {
      newErrors.apellido =
        "El apellido solo puede contener letras y espacios";
    }

    if (!formData.username) {
      newErrors.username = "Ingrese un usuario";
    }

    if (!formData.email) {
      newErrors.email = "Ingrese un email";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.dni) {
      newErrors.dni = "Ingrese DNI";
    } else if (!/^[0-9]+$/.test(formData.dni)) {
      newErrors.dni = "El dni solo puede contener números";
    }

    if (!formData.telefono) {
      newErrors.telefono = "Ingrese teléfono";
    } else if (!/^[0-9]+$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono solo puede contener números";
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento =
        "Ingrese fecha de nacimiento";
    } else if (age < 14) {
      newErrors.fechaNacimiento =
        "El usuario debe ser mayor de 14 años";
    }

    if (!formData.password) {
      newErrors.password =
        "Ingrese contraseña";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "La contraseña debe tener entre 9 y 20 caracteres, una mayúscula y un carácter especial";
    }

    if (age >= 14 && age < 18) {
      if (!permisoFile) {
        newErrors.permiso =
          "Debe adjuntar autorización";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });

      if (permisoFile) {
        form.append("permiso", permisoFile);
      }

      const response = await fetch(
        `${BASE_URL}/register`,
        {
          method: "POST",
          body: form
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMensaje(data.mensaje);

        setFormData({
          nombre: "",
          apellido: "",
          username: "",
          email: "",
          dni: "",
          telefono: "",
          fechaNacimiento: "",
          password: ""
        });

        setPermisoFile(null);
      } else {
        setMensaje(data.error);
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: "#12121f" }}
    >
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-start mb-8">
            <div>
            <h1 className="text-4xl font-bold text-white">
            Registrar Cliente
            </h1>

            <p className="text-white/50 mt-2">
            Crear una nueva cuenta de cliente
            </p>
            </div>

        <button
        onClick={() => navigate("/empleado")}
        className="px-4 py-2 rounded-xl font-medium transition-all hover:opacity-80"
        style={{
            background: "rgba(138,11,210,0.2)",
            border: "1px solid rgba(138,11,210,0.4)",
            color: "#AF50E5"
        }}
        >
        ← Volver
        </button>
        </div>

        <div
          className="rounded-3xl p-8"
          style={{
            background: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
            />

            <Input
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              error={errors.apellido}
            />

            <Input
              label="Usuario"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
            />

            <Input
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="DNI"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              error={errors.dni}
            />

            <Input
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              error={errors.telefono}
            />

            <Input
              label="Fecha de nacimiento"
              name="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              error={errors.fechaNacimiento}
            />

            <Input
              label="Contraseña"
              placeholder="Entre 9 y 20 caracteres, una mayúscula y un carácter especial."
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            {age >= 14 && age < 18 && (
              <div className="md:col-span-2">
                <label className="block text-white mb-2">
                  Autorización firmada
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPermisoFile(e.target.files[0])
                  }
                  className="w-full rounded-xl p-3 text-white"
                  style={{
                    background:
                      "rgba(255,255,255,0.05)",
                    border:
                      "1px solid rgba(255,255,255,0.1)"
                  }}
                />

                {errors.permiso && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.permiso}
                  </p>
                )}
              </div>
            )}

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold transition-all"
                style={{
                  background:
                    "linear-gradient(135deg,#AF50E5,#8A0BD2)"
                }}
              >
                {loading
                  ? "Registrando..."
                  : "Registrar Cliente"}
              </button>
            </div>

            {mensaje && (
              <div className="md:col-span-2">
                <div
                  className="p-4 rounded-xl text-white"
                  style={{
                    background:
                      "rgba(138,11,210,0.2)"
                  }}
                >
                  {mensaje}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  error,
  ...props
}) {
  return (
    <div>
      <label className="block text-white mb-2">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-xl px-4 py-3 text-white outline-none"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      />

      {error && (
        <p className="text-red-400 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}