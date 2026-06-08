class ListaEsperaRepository {
  constructor(db){
    this.db = db;
  }

  // buscar si ya está anotado
  async existeEnLista(idUsuario,idClase,tipoReserva){

    const [rows] = await this.db.promise().execute(
      `SELECT *
       FROM lista_espera
       WHERE id_usuario=?
       AND id_clase=?
       AND tipo_reserva=?`,
      [idUsuario,idClase,tipoReserva]
    );

    return rows[0];
  }

  // obtener última posición
  async obtenerUltimaPosicion(idClase,tipoReserva){

    const [rows] = await this.db.promise().execute(
      `SELECT MAX(posicion) ultima
      FROM lista_espera
      WHERE id_clase=?
      AND tipo_reserva=?`,
      [idClase,tipoReserva]
    );

    return rows[0]?.ultima || 0;
  }

  // ingresar usuario a lista de espera
  async agregar(usuario){

    const query=`
    INSERT INTO lista_espera
    (id_usuario,id_clase,tipo_reserva,posicion)
    VALUES(?,?,?,?)
    `;

    const values=[
      usuario.idUsuario,
      usuario.idClase,
      usuario.tipoReserva,
      usuario.posicion
    ];

    const [result]=
    await this.db.promise().execute(
      query,
      values
    );

    return result.insertId;
  }

  // devuelvo primero de la lista
  async obtenerPrimero(idClase,tipoReserva){

   const [rows]=
   await this.db.promise().execute(
   `SELECT *
    FROM lista_espera
    WHERE id_clase=?
    AND tipo_reserva=?
    ORDER BY posicion
    LIMIT 1`,
   [idClase,tipoReserva]
   );

   return rows[0];
  }

  async eliminar(idLista){

    await this.db.promise().execute(
      `DELETE FROM lista_espera
      WHERE id_lista=?`,
      [idLista]
    );

  }

  async obtenerPosicion(idUsuario, idClase, tipoReserva) {

  const [rows] = await this.db.promise().execute(
    `SELECT posicion
     FROM lista_espera
     WHERE id_usuario=?
     AND id_clase=?
     AND tipo_reserva=?`,
    [idUsuario, idClase, tipoReserva]
  );

  return rows[0] || null;
  }

  async obtenerPorUsuario(idUsuario) {

  const [rows] = await this.db.promise().execute(
    `
    SELECT
      le.id_lista,
      le.posicion,
      le.estado,
      le.tipo_reserva,
      le.fecha_ingreso,

      c.id_clase,
      c.actividad,
      c.dia,
      c.horario,
      c.imagen

    FROM lista_espera le

    INNER JOIN clases c
      ON c.id_clase = le.id_clase

    WHERE le.id_usuario = ?
      AND le.estado = 'esperando'

    ORDER BY le.fecha_ingreso ASC
    `,
    [idUsuario]
  );

  return rows;
}

}

module.exports=ListaEsperaRepository;