const RegisterRepository = require("../repositories/registerRepository");
const db = require("../src/db");

const repo = new RegisterRepository(db);

// calcular edad
function calcularEdad(fechaNacimiento) {
  const today = new Date();
  const birth = new Date(fechaNacimiento);

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

const register = async (req, res) => {
  try {
    const data = req.body;
    const file = req.file; // multer

    // verifico los campos obligatorios (escenario 6)
    if (
      !data.nombre ||
      !data.apellido ||
      !data.username ||
      !data.email ||
      !data.dni ||
      !data.telefono ||
      !data.fechaNacimiento ||
      !data.password 
    ) {
      return res.status(400).json({
        error: "Se deben ingresar todos los datos"
      });
    }

    // verifico nombre de usuario y mail únicos (escenario 2 y 3)
    if (await repo.findByUsername(data.username)) {
      return res.status(400).json({
        error: "Ya existe un usuario con ese nombre de usuario"
      });
    }

    if (await repo.findByEmail(data.email)) {
      return res.status(400).json({
        error: "Ya existe un usuario con ese mail"
      });
    }

    // valido formatos
    // formato email (escenario 11)
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        error: "Casilla de mail invalida"
      });
    }

    // verifico nombre y apellido con solo letras y espacios (escenario 7 y 8)
    const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!textRegex.test(data.nombre)) {
      return res.status(400).json({
        error: "El nombre solo puede contener letras y espacios"
      });
    }

    if (!textRegex.test(data.apellido)) {
      return res.status(400).json({
        error: "El apellido solo puede contener letras y espacios"
      });
    }

    // verifico dni solo números (escenario 10)
    if (!/^[0-9]+$/.test(data.dni)) {
      return res.status(400).json({
        error: "Numero de DNI inválido"
      });
    }

    // verifico dni único
    if (await repo.findByDni(data.dni)) {
      return res.status(400).json({
        error: "Ya existe un usuario con ese número de DNI"
      });
    }

    // verifico telefono solo números (escenario 9)
    if (!/^[0-9]+$/.test(data.telefono)) {
      return res.status(400).json({
        error: "Numero de telefono inválido"
      });
    }

    // verifico nombre de usuario max 50 caracteres (escenario 15)
    if (data.username.length > 50) {
      return res.status(400).json({
        error: "El nombre de usuario no puede superar los 50 caracteres"
      });
    }

    // verifico contraseña con una mayuscula, un caracter especial, y entre 8 y 20 caracteres (escenario 5)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,20}$/;

    if (!passwordRegex.test(data.password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener entre 8 y 20 caracteres, una mayuscula y un caracter especial"
      });
    }

    // verifico edad
    const age = calcularEdad(data.fechaNacimiento);
    let estado_permiso;

    if (age < 18) {
      estado_permiso = "pendiente";
    } else {
        estado_permiso = "aprobado";
      }

    // que sea mayor d 14 años (escenario 4)
    if (age < 14) {
      return res.status(400).json({
        error: "Debes ser mayor de 14 años para registrarte"
      });
    }

    // si tiene entre 14 y 18 necesita permiso d un adulto
    let permisoPath = null;

    // verifico que haya foto (escenario 14)
    if (age >= 14 && age < 18) {
      if (!file) {
        return res.status(400).json({
          error: "Debes ingresar una foto con una autorización firmada por un mayor"
        });
      }

      // verifico el formato del archivo (escenario 13??)
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Debes ingresar una imagen válida"
        });
      }

      // verifico tamaño de archivo (escenario 16)
      if (file.size > 16 * 1024 * 1024) {
        return res.status(400).json({
          error: "La foto debe ocupar hasta un máximo de 16MB"
        });
      }

      permisoPath = file.filename;
    }

    // agrego cliente a la base de datos (escenario 1 y 12)

    await repo.create({
      username: data.username,
      email: data.email,
      password: data.password, // guarda contraseña sin encriptar
      nombre: data.nombre,
      apellido: data.apellido,
      dni: data.dni,
      telefono: data.telefono,
      fechaNacimiento: data.fechaNacimiento,
      permiso: permisoPath,
      estado_permiso: estado_permiso
    });

    return res.status(201).json({
      mensaje: "Usuario registrado con éxito"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};

module.exports = { register };