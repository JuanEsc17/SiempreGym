// src/repositories/cliente.repository.js

class ClienteRepository {
  constructor(db) {
    this.db = db;
  }

  // busco por email, si existe devuelve el objeto
  async findByEmail(email) {
    const [rows] = await this.db.execute(
      "SELECT * FROM clientes WHERE email = ?",
      [email]
    );
    return rows[0];
  }

  // busco por nombre de usuario, si existe devuelve el objeto
  async findByUsername(username) {
    const [rows] = await this.db.execute(
      "SELECT * FROM clientes WHERE username = ?",
      [username]
    );
    return rows[0];
  }

  // creo un nuevo cliente en la base de datos con los valores correspondientes
  async create(cliente) {
    const query = `
      INSERT INTO clientes
      (username, email, password, nombre, apellido, dni, telefono, fecha_nacimiento, plan, permiso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      cliente.username,
      cliente.email,
      cliente.password,
      cliente.nombre,
      cliente.apellido,
      cliente.dni,
      cliente.telefono,
      cliente.fechaNacimiento,
      cliente.plan,
      cliente.permiso || null
    ];

    const [result] = await this.db.execute(query, values);
    return result.insertId;
  }
}

module.exports = ClienteRepository;