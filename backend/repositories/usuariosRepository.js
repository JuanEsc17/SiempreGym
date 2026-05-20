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
}

module.exports = UsuariosRepository;