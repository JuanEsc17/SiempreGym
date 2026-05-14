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
}

module.exports = UsuariosRepository;