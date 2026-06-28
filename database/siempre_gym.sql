-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: siempre_gym
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `clases`
--

DROP TABLE IF EXISTS `clases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clases` (
  `id_clase` int NOT NULL AUTO_INCREMENT,
  `actividad` varchar(100) NOT NULL,
  `dia` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  `precio_individual` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `horario` time NOT NULL,
  `duracion` int NOT NULL,
  `cupo_maximo` int NOT NULL,
  `cantidad_inscriptos` int DEFAULT '0',
  `estado` enum('activa','cancelada') DEFAULT 'activa',
  `imagen` varchar(255) DEFAULT NULL,
  `id_profesor` int DEFAULT NULL,
  `id_sala` int DEFAULT NULL,
  PRIMARY KEY (`id_clase`),
  KEY `id_profesor` (`id_profesor`),
  KEY `id_sala` (`id_sala`),
  CONSTRAINT `clases_ibfk_1` FOREIGN KEY (`id_profesor`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `clases_ibfk_2` FOREIGN KEY (`id_sala`) REFERENCES `salas` (`id_sala`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases`
--

LOCK TABLES `clases` WRITE;
/*!40000 ALTER TABLE `clases` DISABLE KEYS */;
/*!40000 ALTER TABLE `clases` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `instancias_clases`;
CREATE TABLE `instancias_clases` (
  `id_instancia` int NOT NULL AUTO_INCREMENT,
  `id_clase` int NOT NULL,
  `fecha_exacta` datetime NOT NULL, -- Ej: 2026-05-25 16:00:00 
  PRIMARY KEY (`id_instancia`),
  KEY `id_clase` (`id_clase`),
  CONSTRAINT `instancias_clases_ibfk_1` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id_clase`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
--
-- Table structure for table `codigos_confirmacion`
--

DROP TABLE IF EXISTS `codigos_confirmacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigos_confirmacion` (
  `id_codigo` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `fecha_expiracion` timestamp NOT NULL,
  `usado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_codigo`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `codigos_confirmacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigos_confirmacion`
--

LOCK TABLES `codigos_confirmacion` WRITE;
/*!40000 ALTER TABLE `codigos_confirmacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `codigos_confirmacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','pagado','cancelado') DEFAULT 'pendiente',
  `metodo` enum('efectivo','tarjeta','transferencia') DEFAULT NULL,
  `tipo` enum('mensual','individual') DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_clase` int NOT NULL,
  `id_instancia` int NULL,
  `tipo_reserva` enum('individual','mensual') NOT NULL,
  `estado` enum('reservada','cancelada','asistio', 'pendiente') DEFAULT 'reservada',
  `tipo_pago` enum('membresia','credito','total','seña') DEFAULT NULL,
  `saldo_pendiente` decimal(10,2) DEFAULT '0.00',
  `fecha_reserva` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_clase` date NOT NULL,
  `grupo_mensual_id` int NULL,
  `id_renovacion` int NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_clase` (`id_clase`),
  CONSTRAINT `reservas_ibfk_3` FOREIGN KEY (`id_instancia`) REFERENCES `instancias_clases` (`id_instancia`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id_clase`),
  CONSTRAINT `fk_reservas_renovacion` FOREIGN KEY (id_renovacion) REFERENCES renovaciones(id_renovacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lista_espera`
--

DROP TABLE IF EXISTS `lista_espera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lista_espera` (
  `id_lista` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_clase` int NOT NULL,
  `posicion` int NOT NULL,
  `estado` enum('esperando', 'notificado', 'vencido', 'completado') DEFAULT 'esperando',

  `tipo_reserva`
    enum('individual','mensual')
    NOT NULL,

  `fecha_ingreso`
    timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_notificacion` timestamp NULL DEFAULT NULL,

  PRIMARY KEY (`id_lista`),

  KEY `id_usuario` (`id_usuario`),
  KEY `id_clase` (`id_clase`),

  CONSTRAINT `lista_espera_ibfk_1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `usuarios` (`id_usuario`),

  CONSTRAINT `lista_espera_ibfk_2`
    FOREIGN KEY (`id_clase`)
    REFERENCES `clases` (`id_clase`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lista_espera`
--

LOCK TABLES `lista_espera` WRITE;
/*!40000 ALTER TABLE `lista_espera` DISABLE KEYS */;
/*!40000 ALTER TABLE `lista_espera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ofertas_lista_espera`
--

/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `salas`
--

DROP TABLE IF EXISTS `salas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salas` (
  `id_sala` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `capacidad` int NOT NULL,
  PRIMARY KEY (`id_sala`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salas`
--

LOCK TABLES `salas` WRITE;
/*!40000 ALTER TABLE `salas` DISABLE KEYS */;
/*!40000 ALTER TABLE `salas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date NOT NULL,
  `rol` enum('cliente','admin','profesor','empleado') DEFAULT 'cliente',
  `foto_autorizacion` varchar(255) DEFAULT NULL,
  `estado_permiso` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `creditos` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `codigo_qr` TEXT DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `dni` (`dni`),
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;

CREATE TABLE `asistencias` (
  `id_asistencia` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `id_reserva` int NOT NULL UNIQUE,
  `presente` tinyint(1) NOT NULL DEFAULT '1',
  `metodo` enum('qr','manual') NOT NULL,
  `empleado_id` int DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id_asistencia`),

  KEY `usuario_id` (`usuario_id`),
  KEY `id_reserva` (`id_reserva`),
  KEY `empleado_id` (`empleado_id`),

  CONSTRAINT `asistencias_ibfk_1`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id_usuario`),

  CONSTRAINT `asistencias_ibfk_2`
    FOREIGN KEY (`id_reserva`)
    REFERENCES `reservas` (`id_reserva`)
    ON DELETE CASCADE,

  CONSTRAINT `asistencias_ibfk_3`
    FOREIGN KEY (`empleado_id`)
    REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE renovaciones (
  id_renovacion     INT NOT NULL AUTO_INCREMENT,
  id_usuario        INT NOT NULL,
  id_clase          INT NOT NULL,
  mes               INT NOT NULL,
  anio              INT NOT NULL,
  estado            ENUM('pendiente','confirmada','vencida') DEFAULT 'pendiente',
  fecha_generada    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_vencimiento DATE NOT NULL,
  PRIMARY KEY (id_renovacion),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_clase)   REFERENCES clases(id_clase)
);

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Ana','Gomez','anag','ana@gmail.com','1234','12345678','2215555555','2000-05-10','cliente',NULL,NULL,0,'2026-05-10 20:16:25');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-10 17:28:47
