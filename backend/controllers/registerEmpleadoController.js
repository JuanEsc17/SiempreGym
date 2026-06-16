const RegisterRepository = require("../repositories/registerRepository");
const db = require("../src/db");

const repo = new RegisterRepository(db);

function calcularEdad(fechaNacimiento) {
  const today = new Date();
  const birth = new Date(fechaNacimiento);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const registerEmpleado = async (req, res) => {
  try {
    const data = req.body;

    if (
      !data.nombre ||
      !data.apellido ||
      !data.username ||
      !data.email ||
      !data.dni ||
      !data.telefono ||
      !data.fechaNacimiento ||
      !data.password ||
      !data.rol
    ) {
      return res.status(400).json({ error: "Se deben ingresar todos los datos" });
    }

    if (!["empleado", "profesor"].includes(data.rol)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    if (await repo.findByUsername(data.username)) {
      return res.status(400).json({ error: "Ya existe un usuario con ese nombre de usuario" });
    }

    if (await repo.findByEmail(data.email)) {
      return res.status(400).json({ error: "Ya existe un usuario con ese mail" });
    }

    if (await repo.findByDni(data.dni)) {
      return res.status(400).json({ error: "Ya existe un usuario con ese número de DNI" });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ error: "Casilla de mail inválida" });
    }

    const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!textRegex.test(data.nombre)) {
      return res.status(400).json({ error: "El nombre solo puede contener letras y espacios" });
    }
    if (!textRegex.test(data.apellido)) {
      return res.status(400).json({ error: "El apellido solo puede contener letras y espacios" });
    }

    if (!/^[0-9]+$/.test(data.dni)) {
      return res.status(400).json({ error: "Número de DNI inválido" });
    }

    if (!/^[0-9]+$/.test(data.telefono)) {
      return res.status(400).json({ error: "Número de teléfono inválido" });
    }

    if (data.username.length > 50) {
      return res.status(400).json({ error: "El nombre de usuario no puede superar los 50 caracteres" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,20}$/;
    if (!passwordRegex.test(data.password)) {
      return res.status(400).json({
        error: "La contraseña debe tener entre 9 y 20 caracteres, una mayúscula y un carácter especial"
      });
    }

    const age = calcularEdad(data.fechaNacimiento);
    if (age < 18) {
      return res.status(400).json({ error: "El empleado debe ser mayor de 18 años" });
    }

    await repo.create({
      username:        data.username,
      email:           data.email,
      password:        data.password,
      nombre:          data.nombre,
      apellido:        data.apellido,
      dni:             data.dni,
      telefono:        data.telefono,
      fechaNacimiento: data.fechaNacimiento,
      permiso:         null,
      estado_permiso:  "aprobado",
      rol:             data.rol
    });

    return res.status(201).json({ mensaje: "Empleado registrado con éxito" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { registerEmpleado };