class ClasesRepository {
  constructor(db) {
    this.db = db;
  }

  async getDisponibles() {
    const [rows] = await this.db.promise().execute(
      `SELECT * FROM clases
       WHERE fecha_hora_inicio > NOW()
       AND cupos_disponibles > 0
       ORDER BY fecha_hora_inicio ASC`
    );
    return rows;
  }

  async getPorDia(nombreDia) {
    const [rows] = await this.db.promise().execute(
      `SELECT * FROM clases 
       WHERE dia = ? AND estado = 'activa' AND cupos_disponibles > 0`,
      [nombreDia]
    );
    return rows;
  }
}

module.exports = ClasesRepository;