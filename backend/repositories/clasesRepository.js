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
      `SELECT * FROM clases WHERE dia = ? AND estado = 'activa' AND cupos_disponibles > 0`,
      [nombreDia]
    );
    return rows;
  }

  // Nuevo método para obtener sala por ID
  async obtenerSalaPorId(id_sala) {
    const [rows] = await this.db.promise().execute(
        `SELECT id_sala, nombre, capacidad FROM salas WHERE id_sala = ?`,
        [id_sala]
    );
    return rows[0];
  }
  async existeProfesor(id_profesor) {
    const [rows] = await this.db.promise().execute(
      `SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND rol = 'profesor'`,
      [id_profesor]
    );
    return rows.length > 0;
  }

  async existeSala(id_sala) {
    const [rows] = await this.db.promise().execute(
      `SELECT id_sala FROM salas WHERE id_sala = ?`,
      [id_sala]
    );
    return rows.length > 0;
  }

  async profesorOcupado(id_profesor, dia, horario) {
    const [rows] = await this.db.promise().execute(
      `SELECT id_clase FROM clases WHERE id_profesor = ? AND dia = ? AND horario = ? AND estado = 'activa'`,
      [id_profesor, dia, horario]
    );
    return rows.length > 0;
  }

  async salaOcupada(id_sala, dia, horario) {
    const [rows] = await this.db.promise().execute(
      `SELECT id_clase FROM clases WHERE id_sala = ? AND dia = ? AND horario = ? AND estado = 'activa'`,
      [id_sala, dia, horario]
    );
    return rows.length > 0;
  }

  async claseExiste(actividad, dia, horario, id_profesor, id_sala) {
    const [rows] = await this.db.promise().execute(
      `SELECT id_clase FROM clases WHERE actividad = ? AND dia = ? AND horario = ? AND id_profesor = ? AND id_sala = ?`,
      [actividad, dia, horario, id_profesor, id_sala]
    );
    return rows.length > 0;
  }

  async crearClase(datos) {
    const { actividad, dia, horario, duracion, cupo_maximo, id_profesor, id_sala, imagen } = datos;
    const [result] = await this.db.promise().execute(
      `INSERT INTO clases (actividad, dia, horario, duracion, cupo_maximo, id_profesor, id_sala, imagen, estado, cantidad_inscriptos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activa', 0)`,
      [actividad, dia, horario, duracion, cupo_maximo, id_profesor, id_sala, imagen]
    );
    return result.insertId;
  }

  async obtenerProfesores() {
    const [rows] = await this.db.promise().execute(
      `SELECT id_usuario, nombre, apellido FROM usuarios WHERE rol = 'profesor'`
    );
    return rows;
  }

  async obtenerSalas() {
    const [rows] = await this.db.promise().execute(
      `SELECT id_sala, nombre, capacidad FROM salas`
    );
    return rows;
  }
}

module.exports = ClasesRepository;