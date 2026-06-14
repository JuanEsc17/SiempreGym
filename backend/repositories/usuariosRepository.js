class UsuariosRepository {
  constructor(db) {
    this.db = db;
  }

  async buscarPorId(id_usuario) {
    const [rows] = await this.db.promise().execute(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );
    return rows[0] || null;
  }

  async buscarPorUsernameOMail(query) {

    const [rows] = await this.db.promise().execute(
      `
      SELECT id_usuario, username, email, nombre
      FROM usuarios
      WHERE username LIKE ? OR email LIKE ?
      LIMIT 10
      `,
      [`%${query}%`, `%${query}%`]
    );

    return rows;
  }

  async getMenoresPendientes() {
    const [rows] = await this.db.promise().execute(
      `SELECT id_usuario, nombre, apellido, email, dni, fecha_nacimiento, foto_autorizacion, estado_permiso
       FROM usuarios
       WHERE estado_permiso = 'pendiente'
       AND TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) < 18`
    );
    return rows;
  }

  async aprobarPermiso(id_usuario) {
    await this.db.promise().execute(
      `UPDATE usuarios SET estado_permiso = 'aprobado' WHERE id_usuario = ?`,
      [id_usuario]
    );
  }

  async rechazarPermiso(id_usuario) {
    await this.db.promise().execute(
      `UPDATE usuarios SET estado_permiso = 'rechazado' WHERE id_usuario = ?`,
      [id_usuario]
    );
  }

  async getMenoresRechazados(id_usuario) {
    const [rows] = await this.db.promise().execute(
      `SELECT id_usuario, nombre, apellido, email, foto_autorizacion, estado_permiso
       FROM usuarios
       WHERE id_usuario = ?
       AND estado_permiso = 'rechazado'
       AND TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) < 18`,
      [id_usuario]
    );
    return rows[0] || null;
  }

  async actualizarPermiso(id_usuario, foto_path) {
    await this.db.promise().execute(
      `UPDATE usuarios SET foto_autorizacion = ?, estado_permiso = 'pendiente' WHERE id_usuario = ?`,
      [foto_path, id_usuario]
    );
  }

  //para cambio de contraseña
async buscarPorEmail(email) {
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  const [result] = await this.db.promise().execute(query, [email]);
  return result[0];
}

async crearCodigoConfirmacion(id_usuario, codigo, fechaExpiracion) {
  const query = `
    INSERT INTO codigos_confirmacion (id_usuario, codigo, fecha_expiracion, usado) 
    VALUES (?, ?, ?, 0)
  `;
  await this.db.promise().execute(query, [id_usuario, codigo, fechaExpiracion]);
}

async obtenerUltimoCodigoConfirmacion(id_usuario) {
  const query = `
    SELECT * FROM codigos_confirmacion 
    WHERE id_usuario = ? 
    ORDER BY id_codigo DESC 
    LIMIT 1
  `;
  const [result] = await this.db.promise().execute(query, [id_usuario]);
  return result[0];
}

async marcarCodigoUsado(id_codigo) {
  const query = 'UPDATE codigos_confirmacion SET usado = 1 WHERE id_codigo = ?';
  await this.db.promise().execute(query, [id_codigo]);
}

async actualizarContraseña(id_usuario, contraseñaEncriptada) {
  const query = 'UPDATE usuarios SET password = ? WHERE id_usuario = ?';
  await this.db.promise().execute(query, [contraseñaEncriptada, id_usuario]);
}
}

module.exports = UsuariosRepository;