class RegisterRepository {
  constructor(db) {
    this.db = db;
  }

  // busco por email, si existe devuelve el objeto
  async findByEmail(email) {
    const [rows] = await this.db.promise().execute(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );
    return rows[0];
  }

  // busco por nombre de usuario, si existe devuelve el objeto
  async findByUsername(username) {
    const [rows] = await this.db.promise().execute(
      "SELECT * FROM usuarios WHERE username = ?",
      [username]
    );
    return rows[0];
  }

  // creo un nuevo cliente en la base de datos con los valores correspondientes
  async create(cliente) {
    const query = `
      INSERT INTO usuarios
      (nombre, apellido, username, email, dni, telefono, fecha_nacimiento,password, foto_autorizacion, tipo_plan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      cliente.nombre,
      cliente.apellido,
      cliente.username,
      cliente.email,
      cliente.dni,
      cliente.telefono,
      cliente.fechaNacimiento,
      cliente.password,
      cliente.permiso || null,
      cliente.plan
    ];

    const [result] = await this.db.promise().execute(query, values);
    return result.insertId;
  }
}

module.exports = RegisterRepository;