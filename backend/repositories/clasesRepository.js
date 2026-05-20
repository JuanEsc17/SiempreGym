class ClasesRepository {
  constructor(db) {
    this.db = db;
  }

  // Clases con cupo disponible (comportamiento original)
  async getPorDia(nombreDia) {
    const [rows] = await this.db.promise().execute(
      `SELECT * FROM clases
       WHERE dia = ? AND estado = 'activa' AND (cupo_maximo - cantidad_inscriptos) > 0
       ORDER BY horario ASC`,
      [nombreDia]
    );
    return rows;
  }
 
  async getPorDiaConLlenas(nombreDia, fecha) {
  // Calcula los cupos reales contando reservas por instancia para esa fecha exacta
  const query = `
    SELECT c.*,
      c.cupo_maximo - COALESCE(
        (SELECT COUNT(*) 
         FROM reservas r
         JOIN instancias_clases ic ON r.id_instancia = ic.id_instancia
         WHERE ic.id_clase = c.id_clase
           AND DATE(ic.fecha_exacta) = ?
           AND r.estado = 'reservada'),
        0
      ) AS cupos_disponibles
    FROM clases c
    WHERE c.dia = ? AND c.estado = 'activa'
    ORDER BY c.horario ASC
  `;
  const [rows] = await this.db.promise().execute(query, [fecha, nombreDia]);
  return rows;
}
  

  // cosas para crear clase
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

  async profesorOcupado(id_profesor, dia, horario, id_clase_excluir) {
    const [rows] = await this.db.promise().execute(
        `SELECT id_clase FROM clases WHERE id_profesor = ? AND dia = ? AND horario = ? AND estado = 'activa' AND id_clase != ?`,
        [id_profesor, dia, horario, id_clase_excluir]
    );
    return rows.length > 0;
  }

  async salaOcupada(id_sala, dia, horario, id_clase_excluir) {
    const [rows] = await this.db.promise().execute(
        `SELECT id_clase FROM clases WHERE id_sala = ? AND dia = ? AND horario = ? AND estado = 'activa' AND id_clase != ?`,
        [id_sala, dia, horario, id_clase_excluir]
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

  //editar clase 
  async obtenerClasePorId(id_clase) {
    const [rows] = await this.db.promise().execute(
        `SELECT * FROM clases WHERE id_clase = ?`,
        [id_clase]
    );
    return rows[0] || null;
}

  async editarClase(id_clase, datos) {
    const { actividad, dia, horario, duracion, cupo_maximo, id_profesor, id_sala, imagen } = datos;
    
    if (imagen) {
        const [result] = await this.db.promise().execute(
            `UPDATE clases SET actividad=?, dia=?, horario=?, duracion=?, cupo_maximo=?, id_profesor=?, id_sala=?, imagen=? WHERE id_clase=?`,
            [actividad, dia, horario, duracion, cupo_maximo, id_profesor, id_sala, imagen, id_clase]
        );
        return result.affectedRows > 0;
    } else {
        const [result] = await this.db.promise().execute(
            `UPDATE clases SET actividad=?, dia=?, horario=?, duracion=?, cupo_maximo=?, id_profesor=?, id_sala=? WHERE id_clase=?`,
            [actividad, dia, horario, duracion, cupo_maximo, id_profesor, id_sala, id_clase]
        );
        return result.affectedRows > 0;
    }
  }
  // para mostrar todas las clases en el admin
  async obtenerTodas() {
    const [rows] = await this.db.promise().execute(
        `SELECT * FROM clases ORDER BY dia, horario`
    );
    return rows;
  }
}

module.exports = ClasesRepository;