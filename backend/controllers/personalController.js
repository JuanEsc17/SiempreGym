const db = require("../src/db");

class PersonalController {

  async getPersonal(req, res) {
  try {
    const { busqueda = "", pagina = 1, porPagina = 10 } = req.query;

    const offset = (parseInt(pagina) - 1) * parseInt(porPagina);
    const limite = parseInt(porPagina);
    const like = `%${busqueda}%`;

    const queryDatos = `
      SELECT id_usuario, nombre, apellido, username, email, rol
      FROM usuarios
      WHERE rol IN ('empleado', 'profesor')
        AND (
          CONCAT(nombre, ' ', apellido) LIKE ?
          OR username LIKE ?
          OR email LIKE ?
        )
      ORDER BY nombre ASC
      LIMIT ${limite} OFFSET ${offset}
    `;

    const queryTotal = `
      SELECT COUNT(*) AS total
      FROM usuarios
      WHERE rol IN ('empleado', 'profesor')
        AND (
          CONCAT(nombre, ' ', apellido) LIKE ?
          OR username LIKE ?
          OR email LIKE ?
        )
    `;

    const [filas] = await db.promise().execute(queryDatos, [like, like, like]);
    const [[{ total }]] = await db.promise().execute(queryTotal, [like, like, like]);

    return res.json({
      personal: filas,
      total,
      pagina: parseInt(pagina),
      porPagina: limite,
      totalPaginas: Math.ceil(total / limite)
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

  async cambiarRol(req, res) {
    try {
      const { id } = req.params;
      const { rol } = req.body;

      if (!rol) {
        return res.status(400).json({ error: "El rol es obligatorio" });
      }

      if (!["empleado", "profesor"].includes(rol)) {
        return res.status(400).json({ error: "Rol inválido" });
      }

      const [rows] = await db.promise().execute(
        "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol IN ('empleado', 'profesor')",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      await db.promise().execute(
        "UPDATE usuarios SET rol = ? WHERE id_usuario = ?",
        [rol, id]
      );

      return res.json({ mensaje: "Rol actualizado con éxito" });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

module.exports = new PersonalController();