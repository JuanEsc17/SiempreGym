-- =====================================================
-- Migration: Crear tabla renovaciones si no existe
-- + agregar estado 'cancelada' al enum
-- =====================================================

USE siempre_gym;

CREATE TABLE IF NOT EXISTS renovaciones (
  id_renovacion     INT NOT NULL AUTO_INCREMENT,
  id_usuario        INT NOT NULL,
  id_clase          INT NOT NULL,
  mes               INT NOT NULL,
  anio              INT NOT NULL,
  estado            ENUM('pendiente','confirmada','vencida','cancelada') DEFAULT 'pendiente',
  fecha_generada    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_vencimiento DATE NOT NULL,
  PRIMARY KEY (id_renovacion),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_clase)   REFERENCES clases(id_clase)
);

-- Si ya existía, solo actualizar el enum
ALTER TABLE renovaciones MODIFY COLUMN estado
ENUM('pendiente','confirmada','vencida','cancelada') DEFAULT 'pendiente';

DESCRIBE renovaciones;
