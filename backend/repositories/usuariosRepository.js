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
}

module.exports = UsuariosRepository;