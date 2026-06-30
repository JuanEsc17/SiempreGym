-- Crear tabla de devoluciones si no existe
CREATE TABLE IF NOT EXISTS devoluciones (
  id_devolucion INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(50) COMMENT 'seña, credito, total',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Verificar que la tabla fue creada
SHOW TABLES LIKE 'devoluciones';

-- cambio cancelar clase--
ALTER TABLE instancias_clases
ADD COLUMN cancelada BOOLEAN NOT NULL DEFAULT FALSE;