-- =====================================================
-- Migration: Corregir saldo_pendiente en tabla reservas
-- =====================================================
-- Este script cambia el tipo de dato del campo saldo_pendiente
-- de tinyint(1) a decimal(10,2) para guardar correctamente
-- el monto pendiente de pago

USE siempre_gym;

-- Modificar el campo saldo_pendiente de tinyint(1) a decimal(10,2)
ALTER TABLE reservas 
MODIFY COLUMN saldo_pendiente DECIMAL(10,2) DEFAULT '0.00';

-- Verificar que el cambio se aplicó correctamente
DESCRIBE reservas;
