-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: servicio_lavadoras
-- ------------------------------------------------------
-- Server version	9.3.0

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
-- Table structure for table `agendamiento`
--

DROP TABLE IF EXISTS `agendamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamiento` (
  `id_agendamiento` int NOT NULL AUTO_INCREMENT,
  `persona_id` int NOT NULL,
  `servicio_id` int NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `estado` enum('pendiente','confirmado','en_proceso','finalizado','cancelado') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `hora_inicio` datetime DEFAULT NULL,
  `hora_fin` datetime DEFAULT NULL COMMENT 'Hora de finalización del servicio',
  `horas_facturadas` decimal(10,2) DEFAULT NULL COMMENT 'Horas totales facturadas',
  PRIMARY KEY (`id_agendamiento`),
  KEY `fk_ag_persona` (`persona_id`),
  KEY `fk_ag_servicio` (`servicio_id`),
  KEY `idx_ag_fecha` (`fecha`,`hora`),
  CONSTRAINT `fk_ag_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id_persona`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ag_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicio` (`id_servicio`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamiento`
--

LOCK TABLES `agendamiento` WRITE;
/*!40000 ALTER TABLE `agendamiento` DISABLE KEYS */;
INSERT INTO `agendamiento` VALUES (7,140,1,'2025-11-07','10:45:00','cancelado','2025-11-07 23:44:04',NULL,NULL,NULL,NULL),(9,140,1,'2025-11-07','23:48:00','cancelado','2025-11-07 23:55:33',NULL,NULL,NULL,NULL),(10,127,8,'2025-11-07','14:48:00','cancelado','2025-11-07 23:56:52',NULL,NULL,NULL,NULL),(11,104,11,'2025-11-18','23:03:00','cancelado','2025-11-07 23:59:43',NULL,NULL,NULL,NULL),(12,157,1,'2025-11-11','14:30:00','cancelado','2025-11-10 04:44:41',NULL,NULL,NULL,NULL),(13,157,1,'2025-11-11','14:30:00','cancelado','2025-11-10 04:58:08',NULL,NULL,NULL,NULL),(14,157,1,'2025-11-11','14:30:00','cancelado','2025-11-10 05:10:02',NULL,NULL,NULL,NULL),(15,157,1,'2025-11-11','14:30:00','cancelado','2025-11-10 05:11:06','hjgghghj',NULL,NULL,NULL),(16,157,1,'2025-11-11','14:30:00','cancelado','2025-11-10 05:11:50','hjgghghj',NULL,NULL,NULL),(17,157,6,'2025-11-10','17:24:00','cancelado','2025-11-10 05:19:17',NULL,NULL,NULL,NULL),(18,157,8,'2025-11-10','16:25:00','finalizado','2025-11-10 05:20:35','mmmm',NULL,NULL,NULL),(19,171,1,'2025-11-20','16:01:00','finalizado','2025-11-10 05:59:20','sdfdds',NULL,NULL,NULL),(20,172,2,'2025-11-11','07:27:00','finalizado','2025-11-10 19:43:20',NULL,NULL,NULL,NULL),(21,172,2,'2025-11-12','20:16:00','finalizado','2025-11-10 20:11:50',NULL,NULL,NULL,NULL),(22,172,2,'2025-11-10','09:04:00','finalizado','2025-11-10 22:00:30',NULL,NULL,NULL,NULL),(23,172,1,'2025-11-10','23:32:00','finalizado','2025-11-10 22:26:19',NULL,NULL,NULL,NULL),(24,172,5,'2025-11-12','10:00:00','finalizado','2025-11-11 02:56:28',NULL,NULL,NULL,NULL),(25,172,2,'2025-11-27','13:29:00','finalizado','2025-11-11 03:26:41','lavadora #7',NULL,NULL,NULL),(26,172,2,'2025-11-11','14:33:00','finalizado','2025-11-11 07:31:06',NULL,NULL,NULL,NULL),(27,172,1,'2025-11-11','18:20:00','finalizado','2025-11-11 20:18:35',NULL,NULL,NULL,NULL),(28,172,1,'2025-11-11','20:40:00','finalizado','2025-11-11 22:35:26',NULL,NULL,NULL,NULL),(29,172,7,'2025-11-21','10:10:00','finalizado','2025-11-14 00:07:08',NULL,NULL,NULL,NULL),(30,172,2,'2025-11-26','04:16:00','finalizado','2025-11-15 06:13:53',NULL,'2025-11-15 01:14:09',NULL,NULL);
/*!40000 ALTER TABLE `agendamiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificado_pago`
--

DROP TABLE IF EXISTS `certificado_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificado_pago` (
  `id_certificado` int NOT NULL AUTO_INCREMENT,
  `factura_id` int NOT NULL,
  `fecha_emision` date DEFAULT (curdate()),
  `observacion` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_certificado`),
  KEY `fk_cert_factura` (`factura_id`),
  CONSTRAINT `fk_cert_factura` FOREIGN KEY (`factura_id`) REFERENCES `factura` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificado_pago`
--

LOCK TABLES `certificado_pago` WRITE;
/*!40000 ALTER TABLE `certificado_pago` DISABLE KEYS */;
INSERT INTO `certificado_pago` VALUES (1,1,'2025-10-23','Pago recibido en efectivo'),(2,2,'2025-10-23','Pago con tarjeta');
/*!40000 ALTER TABLE `certificado_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_factura`
--

DROP TABLE IF EXISTS `detalle_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_factura` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `factura_id` int NOT NULL,
  `servicio_id` int DEFAULT NULL,
  `cantidad` int DEFAULT '1',
  `precio_unitario` decimal(12,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(12,2) GENERATED ALWAYS AS ((`cantidad` * `precio_unitario`)) STORED,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_det_fac` (`factura_id`),
  KEY `fk_det_servicio` (`servicio_id`),
  CONSTRAINT `fk_det_fac` FOREIGN KEY (`factura_id`) REFERENCES `factura` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_det_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicio` (`id_servicio`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_factura`
--

LOCK TABLES `detalle_factura` WRITE;
/*!40000 ALTER TABLE `detalle_factura` DISABLE KEYS */;
INSERT INTO `detalle_factura` (`id_detalle`, `factura_id`, `servicio_id`, `cantidad`, `precio_unitario`) VALUES (1,1,1,1,10000.00),(2,2,3,1,20000.00),(3,1,1,1,10000.00),(4,2,3,1,20000.00);
/*!40000 ALTER TABLE `detalle_factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direccion`
--

DROP TABLE IF EXISTS `direccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direccion` (
  `id_direccion` int NOT NULL AUTO_INCREMENT,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barrio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion_detalle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_direccion`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direccion`
--

LOCK TABLES `direccion` WRITE;
/*!40000 ALTER TABLE `direccion` DISABLE KEYS */;
INSERT INTO `direccion` VALUES (1,'Bogotá','Chapinero','Calle 10 #20-30','3001234567'),(2,'Quibdó','La Yesquita','Calle 10 #5-23','3001112233'),(3,'Medellín','El Poblado','Carrera 8 #12-45','3012223344'),(4,'Cali','San Fernando','Calle 7 #9-34','3023334455'),(5,'Bogotá','Chapinero','Carrera 15 #22-10','3034445566'),(6,'Barranquilla','El Prado','Calle 20 #14-56','3045556677'),(7,'Cartagena','Bocagrande','Carrera 11 #8-99','3056667788'),(8,'Pereira','Los Alpes','Calle 5 #2-20','3067778899'),(9,'Bucaramanga','Cabecera','Carrera 9 #17-33','3078889900'),(10,'Manizales','La Francia','Calle 30 #10-15','3089990011'),(11,'Neiva','Altico','Carrera 18 #24-50','3090001122'),(12,'Bogotá','Chapinero','Calle 70 # 8-12','3101234567'),(13,'Medellín','El Poblado','Carrera 43 # 10-15','3007654321'),(14,'Cali','Granada','Calle 5 # 22-30','3209876543'),(15,'Barranquilla','El Prado','Calle 20 # 14-56','3045556677');
/*!40000 ALTER TABLE `direccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factura`
--

DROP TABLE IF EXISTS `factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura` (
  `id_factura` int NOT NULL AUTO_INCREMENT,
  `persona_id` int DEFAULT NULL,
  `agendamiento_id` int DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `forma_pago_id` int DEFAULT NULL,
  `estado` enum('emitida','pagada','anulada') COLLATE utf8mb4_unicode_ci DEFAULT 'emitida',
  PRIMARY KEY (`id_factura`),
  KEY `fk_fac_persona` (`persona_id`),
  KEY `fk_fac_formapago` (`forma_pago_id`),
  KEY `idx_fac_fecha` (`fecha`),
  KEY `fk_factura_agendamiento` (`agendamiento_id`),
  CONSTRAINT `fk_fac_formapago` FOREIGN KEY (`forma_pago_id`) REFERENCES `forma_pago` (`id_forma_pago`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fac_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id_persona`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_factura_agendamiento` FOREIGN KEY (`agendamiento_id`) REFERENCES `agendamiento` (`id_agendamiento`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factura`
--

LOCK TABLES `factura` WRITE;
/*!40000 ALTER TABLE `factura` DISABLE KEYS */;
INSERT INTO `factura` VALUES (1,1,NULL,'2025-10-24 01:43:49',10000.00,1,'emitida'),(2,2,NULL,'2025-10-24 01:43:49',20000.00,2,'emitida'),(23,157,NULL,'2025-11-10 19:01:43',40000.00,1,'emitida'),(24,171,NULL,'2025-11-10 19:02:35',10000.00,1,'emitida'),(25,171,NULL,'2025-11-10 19:02:35',10000.00,1,'emitida'),(26,172,NULL,'2025-11-10 19:43:49',14000.00,1,'emitida'),(27,172,NULL,'2025-11-10 19:43:49',14000.00,1,'emitida'),(28,172,NULL,'2025-11-10 20:12:23',14000.00,1,'emitida'),(29,172,NULL,'2025-11-10 20:12:23',14000.00,1,'emitida'),(30,172,22,'2025-11-10 22:21:07',14000.00,1,'emitida'),(31,172,23,'2025-11-10 22:29:24',10000.00,1,'emitida'),(32,172,24,'2025-11-11 02:57:08',14000.00,1,'emitida'),(33,172,25,'2025-11-11 07:17:31',14000.00,1,'emitida'),(34,172,26,'2025-11-11 07:31:24',14000.00,1,'emitida'),(35,172,27,'2025-11-11 20:19:06',10000.00,1,'emitida'),(36,172,28,'2025-11-11 22:35:57',10000.00,1,'emitida'),(37,172,29,'2025-11-14 00:07:37',15000.00,1,'emitida'),(38,172,30,'2025-11-15 06:14:21',9000.00,NULL,'pagada');
/*!40000 ALTER TABLE `factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finalizacion_servicio`
--

DROP TABLE IF EXISTS `finalizacion_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finalizacion_servicio` (
  `id_finalizacion` int NOT NULL AUTO_INCREMENT,
  `agendamiento_id` int NOT NULL,
  `fecha_finalizacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `calificacion` tinyint DEFAULT NULL,
  PRIMARY KEY (`id_finalizacion`),
  KEY `fk_finalizacion_agendamiento` (`agendamiento_id`),
  CONSTRAINT `fk_finalizacion_agendamiento` FOREIGN KEY (`agendamiento_id`) REFERENCES `agendamiento` (`id_agendamiento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finalizacion_servicio`
--

LOCK TABLES `finalizacion_servicio` WRITE;
/*!40000 ALTER TABLE `finalizacion_servicio` DISABLE KEYS */;
INSERT INTO `finalizacion_servicio` VALUES (1,18,'2025-11-10 14:01:43','string',0),(2,19,'2025-11-10 14:02:35','Tiempo: 0m 0s',NULL),(3,20,'2025-11-10 14:43:49','Tiempo: 0m 9s',NULL),(4,21,'2025-11-10 15:12:23','Tiempo: 0m 11s',NULL),(5,22,'2025-11-10 17:21:07','Tiempo: 1m 31s',NULL),(6,23,'2025-11-10 17:29:24','Tiempo: 2m 53s',NULL),(7,24,'2025-11-10 21:57:08','Tiempo: 0m 33s',NULL),(8,25,'2025-11-11 02:17:31','Tiempo: 0m 0s',NULL),(9,26,'2025-11-11 02:31:24','Tiempo: 0m 7s',NULL),(10,27,'2025-11-11 15:19:06','Tiempo: 0m 8s',NULL),(11,28,'2025-11-11 17:35:57','Tiempo: 0m 12s',NULL),(12,29,'2025-11-13 19:07:37','Tiempo: 0m 15s',NULL),(13,30,'2025-11-15 01:14:21','Tiempo: 0h 0m - Tiempo: 0m 10s',NULL);
/*!40000 ALTER TABLE `finalizacion_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forma_pago`
--

DROP TABLE IF EXISTS `forma_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forma_pago` (
  `id_forma_pago` int NOT NULL AUTO_INCREMENT,
  `nombre_forma` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_forma_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forma_pago`
--

LOCK TABLES `forma_pago` WRITE;
/*!40000 ALTER TABLE `forma_pago` DISABLE KEYS */;
INSERT INTO `forma_pago` VALUES (1,'Efectivo','Pago en moneda física'),(2,'Tarjeta','Pago mediante tarjeta de crédito o débito'),(26,'PSE','Pago mediante PSE'),(27,'Nequi/Daviplata','Pago por aplicaciones móviles');
/*!40000 ALTER TABLE `forma_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_servicio`
--

DROP TABLE IF EXISTS `historial_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_servicio` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `persona_id` int DEFAULT NULL,
  `servicio_id` int DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_historial`),
  KEY `fk_hist_persona` (`persona_id`),
  KEY `fk_hist_servicio` (`servicio_id`),
  CONSTRAINT `fk_hist_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id_persona`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_hist_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicio` (`id_servicio`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_servicio`
--

LOCK TABLES `historial_servicio` WRITE;
/*!40000 ALTER TABLE `historial_servicio` DISABLE KEYS */;
INSERT INTO `historial_servicio` VALUES (1,1,1,'2025-10-23',NULL),(2,2,3,'2025-10-23',NULL),(3,1,1,'2025-10-23',NULL),(4,2,3,'2025-10-23',NULL),(5,1,1,'2025-10-23',NULL),(6,2,3,'2025-10-23',NULL),(7,1,1,'2025-10-23',NULL),(8,2,3,'2025-10-23',NULL);
/*!40000 ALTER TABLE `historial_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `informacion`
--

DROP TABLE IF EXISTS `informacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `informacion` (
  `id_info` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `tutorial_id` int DEFAULT NULL,
  `reporte_servicio` int DEFAULT NULL,
  PRIMARY KEY (`id_info`),
  KEY `fk_informacion_tutorial` (`tutorial_id`),
  KEY `fk_informacion_reporte` (`reporte_servicio`),
  CONSTRAINT `fk_informacion_reporte` FOREIGN KEY (`reporte_servicio`) REFERENCES `reporte_servicio` (`id_reporte`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_informacion_tutorial` FOREIGN KEY (`tutorial_id`) REFERENCES `tutorial` (`id_tutorial`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `informacion`
--

LOCK TABLES `informacion` WRITE;
/*!40000 ALTER TABLE `informacion` DISABLE KEYS */;
INSERT INTO `informacion` VALUES (1,'site_name','Servicio Lavadora S.A.S.',1,NULL),(2,'contact_phone','3101234567',NULL,NULL);
/*!40000 ALTER TABLE `informacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu` (
  `id_menu` int NOT NULL AUTO_INCREMENT,
  `nombre_menu` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruta` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int DEFAULT '0',
  PRIMARY KEY (`id_menu`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES (1,'Inicio','/',1),(2,'Servicios','/servicios',2),(3,'Administración','/admin',3);
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_factura` int DEFAULT NULL,
  `id_forma_pago` int DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `fecha_pago` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('Pendiente','Completado','Fallido') COLLATE utf8mb4_unicode_ci DEFAULT 'Pendiente',
  PRIMARY KEY (`id_pago`),
  KEY `id_factura` (`id_factura`),
  KEY `id_forma_pago` (`id_forma_pago`),
  CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`),
  CONSTRAINT `pago_ibfk_2` FOREIGN KEY (`id_forma_pago`) REFERENCES `forma_pago` (`id_forma_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permiso`
--

DROP TABLE IF EXISTS `permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permiso` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `nombre_permiso` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_permiso`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permiso`
--

LOCK TABLES `permiso` WRITE;
/*!40000 ALTER TABLE `permiso` DISABLE KEYS */;
INSERT INTO `permiso` VALUES (1,'crear_usuario','Permite crear nuevos usuarios'),(2,'ver_reportes','Permite ver reportes y facturas'),(3,'gestionar_agendamientos','Permite gestionar/agendar servicios'),(4,'crear_usuario','Permite crear nuevos usuarios'),(5,'ver_reportes','Permite ver reportes y facturas'),(6,'gestionar_agendamientos','Permite gestionar/agendar servicios');
/*!40000 ALTER TABLE `permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `persona`
--

DROP TABLE IF EXISTS `persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `persona` (
  `id_persona` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `tipo_identificacion_id` int DEFAULT NULL,
  `identificacion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion_id` int DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol_id` int DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `identificacion` (`identificacion`),
  KEY `fk_persona_tipo` (`tipo_identificacion_id`),
  KEY `fk_persona_direccion` (`direccion_id`),
  KEY `fk_persona_rol` (`rol_id`),
  KEY `idx_persona_identificacion` (`identificacion`),
  CONSTRAINT `fk_persona_direccion` FOREIGN KEY (`direccion_id`) REFERENCES `direccion` (`id_direccion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_persona_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id_rol`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_persona_tipo` FOREIGN KEY (`tipo_identificacion_id`) REFERENCES `tipo_identificacion` (`id_tipo_identificacion`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `persona`
--

LOCK TABLES `persona` WRITE;
/*!40000 ALTER TABLE `persona` DISABLE KEYS */;
INSERT INTO `persona` VALUES (1,'theking','UTCH',NULL,1,'1111111111',NULL,'123456789','UTCH@gmai.com',1,'2024-01-20 19:15:00'),(32,'Juan','Pérez',NULL,1,'1001234567',1,'3001234567','juanperez@gmail.com',1,'2024-01-10 05:00:00'),(43,'Juan','Pérez',NULL,1,'1000000001',1,'3001234567','juan.perez@gmail.com',1,'2024-01-10 15:00:00'),(44,'María','Gómez',NULL,2,'1000000002',2,'3012345678','maria.gomez@hotmail.com',2,'2024-01-11 16:30:00'),(45,'Pedro','Rodríguez',NULL,1,'1000000003',3,'3023456789','pedro.rodriguez@yahoo.com',3,'2024-01-15 14:45:00'),(46,'Laura','López',NULL,1,'1000000004',4,'3034567890','laura.lopez@gmail.com',2,'2024-01-20 19:15:00'),(47,'Carlos','Martínez',NULL,2,'1000000005',5,'3045678901','carlos.martinez@gmail.com',3,'2024-02-02 13:25:00'),(48,'Ana','García',NULL,1,'1000000006',6,'3056789012','ana.garcia@outlook.com',1,'2024-02-05 21:40:00'),(49,'Andrés','Hernández',NULL,2,'1000000007',7,'3067890123','andres.hernandez@gmail.com',2,'2024-02-08 22:10:00'),(50,'Sofía','Torres',NULL,3,'1000000008',8,'3078901234','sofia.torres@gmail.com',3,'2024-02-12 18:20:00'),(51,'Miguel','Ramírez',NULL,1,'1000000009',9,'3089012345','miguel.ramirez@gmail.com',2,'2024-02-15 15:50:00'),(52,'Camila','Castro',NULL,1,'1000000010',10,'3090123456','camila.castro@gmail.com',3,'2024-02-18 17:30:00'),(103,'Daniela','Rojas',NULL,2,'1000000012',2,'3112345678','daniela.rojas@hotmail.com',1,'2024-02-22 20:10:00'),(104,'Felipe','Jiménez',NULL,3,'1000000013',3,'3123456789','felipe.jimenez@yahoo.com',3,'2024-02-23 16:45:00'),(105,'Paula','Vargas',NULL,1,'1000000014',4,'3134567890','paula.vargas@gmail.com',2,'2024-02-25 13:20:00'),(106,'Ricardo','Navarro',NULL,2,'1000000015',5,'3145678901','ricardo.navarro@gmail.com',1,'2024-02-26 23:15:00'),(107,'Natalia','Sánchez',NULL,3,'1000000016',6,'3156789012','natalia.sanchez@gmail.com',3,'2024-02-28 00:30:00'),(108,'Esteban','Ruiz',NULL,1,'1000000017',7,'3167890123','esteban.ruiz@gmail.com',2,'2024-02-28 15:10:00'),(109,'Valentina','Mendoza',NULL,2,'1000000018',8,'3178901234','valentina.mendoza@gmail.com',1,'2024-03-01 19:00:00'),(110,'Santiago','Córdoba',NULL,1,'1000000019',9,'3189012345','santiago.cordoba@gmail.com',3,'2024-03-03 21:45:00'),(111,'Diana','Salazar',NULL,2,'1000000020',10,'3190123456','diana.salazar@gmail.com',2,'2024-03-04 14:25:00'),(112,'Lucía','Ortiz',NULL,1,'1000000021',1,'3201234567','lucia.ortiz@gmail.com',1,'2024-03-06 17:30:00'),(113,'Sebastián','Luna',NULL,2,'1000000022',2,'3212345678','sebastian.luna@hotmail.com',2,'2024-03-08 13:45:00'),(114,'Isabella','Mejía',NULL,3,'1000000023',3,'3223456789','isabella.mejia@yahoo.com',3,'2024-03-09 16:20:00'),(115,'Tomás','Patiño',NULL,1,'1000000024',4,'3234567890','tomas.patino@gmail.com',1,'2024-03-10 20:10:00'),(116,'Manuela','Restrepo',NULL,2,'1000000025',5,'3245678901','manuela.restrepo@gmail.com',3,'2024-03-12 22:40:00'),(117,'Samuel','Gutiérrez',NULL,3,'1000000026',6,'3256789012','samuel.gutierrez@gmail.com',2,'2024-03-13 15:55:00'),(118,'Gabriela','Naranjo',NULL,1,'1000000027',7,'3267890123','gabriela.naranjo@gmail.com',1,'2024-03-14 18:00:00'),(119,'Matías','Pardo',NULL,2,'1000000028',8,'3278901234','matias.pardo@gmail.com',2,'2024-03-15 14:35:00'),(120,'Juliana','Ocampo',NULL,1,'1000000029',9,'3289012345','juliana.ocampo@gmail.com',3,'2024-03-17 21:05:00'),(121,'Diego','Valencia',NULL,1,'1000000030',10,'3290123456','diego.valencia@gmail.com',3,'2024-03-19 23:30:00'),(122,'Lorena','Murillo',NULL,2,'1000000031',1,'3301234567','lorena.murillo@gmail.com',2,'2024-03-20 17:00:00'),(123,'Oscar','Zapata',NULL,3,'1000000032',2,'3312345678','oscar.zapata@hotmail.com',1,'2024-03-22 14:45:00'),(124,'Catalina','Mora',NULL,1,'1000000033',3,'3323456789','catalina.mora@gmail.com',2,'2024-03-23 19:55:00'),(125,'Nicolás','Ramírez',NULL,2,'1000000034',4,'3334567890','nicolas.ramirez@gmail.com',1,'2024-03-25 20:25:00'),(126,'Mariana','Cifuentes',NULL,3,'1000000035',5,'3345678901','mariana.cifuentes@gmail.com',3,'2024-03-27 18:50:00'),(127,'Andrés','Osorio',NULL,1,'1000000036',6,'3356789012','andres.osorio@gmail.com',2,'2024-03-28 15:10:00'),(128,'Susana','Rincón',NULL,2,'1000000037',7,'3367890123','susana.rincon@gmail.com',1,'2024-03-29 16:30:00'),(129,'Cristian','Bermúdez',NULL,1,'1000000038',8,'3378901234','cristian.bermudez@gmail.com',2,'2024-03-30 14:20:00'),(130,'Yuliana','Montoya',NULL,3,'1000000039',9,'3389012345','yuliana.montoya@gmail.com',3,'2024-03-31 22:15:00'),(131,'Kevin','González',NULL,1,'1000000040',10,'3390123456','kevin.gonzalez@gmail.com',2,'2024-04-01 15:05:00'),(132,'Daniel','Moreno',NULL,2,'1000000041',1,'3401234567','daniel.moreno@gmail.com',3,'2024-04-03 13:15:00'),(133,'Tatiana','Restrepo',NULL,1,'1000000042',2,'3412345678','tatiana.restrepo@gmail.com',1,'2024-04-04 16:45:00'),(134,'Julián','Castillo',NULL,3,'1000000043',3,'3423456789','julian.castillo@gmail.com',2,'2024-04-06 18:40:00'),(135,'Daniela','Ortiz',NULL,1,'1000000044',4,'3434567890','daniela.ortiz@gmail.com',1,'2024-04-08 14:25:00'),(136,'Felipe','Correa',NULL,2,'1000000045',5,'3445678901','felipe.correa@gmail.com',2,'2024-04-09 21:50:00'),(137,'Natalia','Ruiz',NULL,3,'1000000046',6,'3456789012','natalia.ruiz@gmail.com',3,'2024-04-11 17:35:00'),(138,'Alejandro','Suárez',NULL,1,'1000000047',7,'3467890123','alejandro.suarez@gmail.com',2,'2024-04-13 13:10:00'),(139,'Sara','Arias',NULL,2,'1000000048',8,'3478901234','sara.arias@gmail.com',1,'2024-04-15 22:45:00'),(140,'Mateo','Herrera',NULL,1,'1000000049',9,'3489012345','mateo.herrera@gmail.com',3,'2024-04-18 00:00:00'),(141,'Camilo','Vega',NULL,3,'1000000050',10,'3490123456','camilo.vega@gmail.com',2,'2024-04-19 14:20:00'),(142,'Yiber','Renteria',NULL,NULL,NULL,NULL,'3000000000','yiber@example.com',NULL,'2025-10-23 06:48:43'),(143,'Juan','Pérez','1985-03-12',1,'10101010',1,'3101112222','juan.perez@example.com',2,'2025-10-24 01:42:09'),(144,'María','Gómez','1990-07-25',1,'20202020',2,'3002223333','maria.gomez@example.com',2,'2025-10-24 01:42:09'),(145,'Carlos','Rodríguez','1988-11-05',2,'X1234567',3,'3203334444','carlos.rodriguez@example.com',3,'2025-10-24 01:42:09'),(146,'Ana','Martínez','1995-01-20',1,'30303030',1,'3114445555','ana.martinez@example.com',2,'2025-10-24 01:42:09'),(155,'Admin','Sistema',NULL,1,'1000000000',1,'3001111111','admin@servilavadora.com',1,'2025-10-24 18:41:20'),(156,'María','González',NULL,1,'1007654321',3,'3109876543','maria.gonzalez@hotmail.com',2,'2025-10-24 18:41:20'),(157,'Carlos','Ramírez',NULL,1,'1005555555',4,'3155555555','carlos.ramirez@gmail.com',3,'2025-10-24 18:41:20'),(158,'yiber','renteria',NULL,1,'',NULL,'3145341174','yiber@gmail.com',1,'2025-11-02 05:00:00'),(159,'dfdfd','dsfsd',NULL,1,NULL,NULL,'12234','dsf@bmai.com',1,'2025-11-02 05:00:00'),(160,'juan','peres',NULL,1,NULL,NULL,'123456','juan@gmail.com',1,'2025-11-02 05:00:00'),(161,'smith','renteria',NULL,1,NULL,NULL,'3145341174','smith@gmail.com',1,'2025-11-04 05:12:31'),(162,'f*2','ttt',NULL,1,NULL,NULL,'3145341174','yyyiber@gmail.com',1,'2025-11-05 21:56:19'),(163,'tt','tt',NULL,1,NULL,NULL,'3145341174','tt@gmail.com',1,'2025-11-08 00:12:12'),(164,'lavadora','renteria rivas',NULL,1,NULL,NULL,'3145341174','smithdysoltero7@gmail.com',1,'2025-11-08 00:51:14'),(165,'fhghg','renteria',NULL,1,NULL,NULL,'3145341174','yibekkr@gmail.com',1,'2025-11-09 00:50:53'),(166,'sando','renteria',NULL,1,NULL,NULL,'3145341174','yiberrrr@gmail.com',1,'2025-11-09 00:52:39'),(167,'yania','renteria',NULL,1,NULL,NULL,'3145341174','yibrrer@gmail.com',1,'2025-11-09 01:03:54'),(168,'esteisi','mena',NULL,2,NULL,NULL,'3145341174','yibelllr@gmail.com',1,'2025-11-09 01:09:50'),(169,'smith','rivas',NULL,1,NULL,NULL,'3145341174','yibelllopr@gmail.com',1,'2025-11-09 01:19:59'),(170,'yirle','escobar','2025-11-04',1,'35602377',NULL,'3145341174','smithyiber@gmail.com',1,'2025-11-09 01:22:40'),(171,'rsrdrrtr','ereferf','2025-11-08',1,'123456789',NULL,'3145341174','yibernnn@gmail.com',1,'2025-11-09 01:33:47'),(172,'sma','adadad','2025-11-08',3,'12345678',NULL,'3145341174','vvyiber@gmail.com',1,'2025-11-09 01:36:39'),(173,'esteisi','renteria','2000-06-29',1,'1234567890',NULL,'3145341174','amor-mio@gmail.com',1,'2025-11-10 04:30:10'),(174,'andres','mena','1993-06-16',1,'987654321',NULL,'3145341174','smith7@gmail.com',1,'2025-11-12 05:37:53'),(175,'perla','mena','2003-02-04',1,'12345678901',NULL,'3145341174','smitn8@gmail.com',1,'2025-11-12 05:41:07'),(176,'theking','Principal',NULL,NULL,NULL,NULL,NULL,'theking@servi.com',1,'2025-11-12 21:52:29'),(177,'yiber','renteria','2025-11-12',1,'1077472354',NULL,'3145341174','yiberf@gmail.com',3,'2025-11-12 22:57:53'),(179,'peres','palomeque','2025-11-12',1,'1077472353',NULL,'3145341174','smith9yiber@gmail.com',3,'2025-11-14 06:42:28'),(180,'fran','mena perea','2000-06-14',1,'12344444',NULL,'3145341174','yibebtrrftr@gmail.com',3,'2025-11-15 07:18:55');
/*!40000 ALTER TABLE `persona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `persona_rol`
--

DROP TABLE IF EXISTS `persona_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `persona_rol` (
  `persona_id` int NOT NULL,
  `rol_id` int NOT NULL,
  PRIMARY KEY (`persona_id`,`rol_id`),
  KEY `fk_pr_rol` (`rol_id`),
  CONSTRAINT `fk_pr_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id_persona`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pr_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `persona_rol`
--

LOCK TABLES `persona_rol` WRITE;
/*!40000 ALTER TABLE `persona_rol` DISABLE KEYS */;
INSERT INTO `persona_rol` VALUES (1,2),(2,2),(4,2),(3,3);
/*!40000 ALTER TABLE `persona_rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte_servicio`
--

DROP TABLE IF EXISTS `reporte_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte_servicio` (
  `id_reporte` int NOT NULL AUTO_INCREMENT,
  `fecha_generacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `datos` json DEFAULT NULL,
  `servicio_id` int DEFAULT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `fk_reporte_servicio_servicio` (`servicio_id`),
  CONSTRAINT `fk_reporte_servicio_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicio` (`id_servicio`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte_servicio`
--

LOCK TABLES `reporte_servicio` WRITE;
/*!40000 ALTER TABLE `reporte_servicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Administrador','Acceso total'),(2,'Repartidor','Acceso a entregas y recolecciones'),(3,'Cliente','Acceso cliente'),(5,'Empleado','Gestiona facturación, servicios y usuarios'),(19,'Administrador','Acceso total'),(20,'Tecnico','Acceso técnico'),(21,'Cliente','Acceso cliente'),(22,'Administrador','Acceso total'),(23,'Tecnico','Acceso técnico'),(24,'Cliente','Acceso cliente'),(25,'administrador','Acceso total al sistema'),(26,'cliente','Usuario final que agenda servicios'),(27,'empleado','Empleado que realiza los servicios'),(28,'Administrador',NULL);
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_menu`
--

DROP TABLE IF EXISTS `rol_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_menu` (
  `id_rol` int NOT NULL,
  `id_menu` int NOT NULL,
  PRIMARY KEY (`id_rol`,`id_menu`),
  KEY `fk_rm_menu` (`id_menu`),
  CONSTRAINT `fk_rm_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rm_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_menu`
--

LOCK TABLES `rol_menu` WRITE;
/*!40000 ALTER TABLE `rol_menu` DISABLE KEYS */;
INSERT INTO `rol_menu` VALUES (2,1),(2,2),(1,3);
/*!40000 ALTER TABLE `rol_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permiso` (
  `id_rol` int NOT NULL,
  `id_permiso` int NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `fk_rp_permiso` (`id_permiso`),
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permiso`
--

LOCK TABLES `rol_permiso` WRITE;
/*!40000 ALTER TABLE `rol_permiso` DISABLE KEYS */;
INSERT INTO `rol_permiso` VALUES (1,1),(1,2),(3,3);
/*!40000 ALTER TABLE `rol_permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicio`
--

DROP TABLE IF EXISTS `servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio` (
  `id_servicio` int NOT NULL AUTO_INCREMENT,
  `nombre_servicio` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio_base` decimal(10,2) NOT NULL DEFAULT '0.00',
  `duracion_minutos` int DEFAULT '60',
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio`
--

LOCK TABLES `servicio` WRITE;
/*!40000 ALTER TABLE `servicio` DISABLE KEYS */;
INSERT INTO `servicio` VALUES (1,'Lavado básico','Lavado rápido, sin planchado',10000.00,45,1),(2,'Lavado + secado','Lavado y secado con secadora industrial',14000.00,60,1),(3,'Lavado y planchado','Lavado y planchado a máquina/manual',20000.00,90,1),(4,'Lavado básico','Lavado rápido, sin planchado',10000.00,45,1),(5,'Lavado + secado','Lavado y secado con secadora industrial',14000.00,60,1),(6,'Lavado y planchado','Lavado y planchado a máquina/manual',20000.00,90,1),(7,'Alquiler Lavadora - 1 Día','Alquiler de lavadora automática por 1 día',15000.00,1440,1),(8,'Alquiler Lavadora - 3 Días','Alquiler de lavadora automática por 3 días',40000.00,4320,1),(9,'Alquiler Lavadora - 1 Semana','Alquiler de lavadora automática por 1 semana',80000.00,10080,1),(10,'Alquiler con Secadora - 1 Día','Alquiler de lavadora + secadora por 1 día',25000.00,1440,1),(11,'Mantenimiento Preventivo','Servicio de mantenimiento y limpieza de equipos',50000.00,120,1);
/*!40000 ALTER TABLE `servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesion`
--

DROP TABLE IF EXISTS `sesion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesion` (
  `id_sesion` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `inicio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fin` timestamp NULL DEFAULT NULL,
  `ip_origen` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_sesion`),
  KEY `fk_sesion_usuario` (`usuario_id`),
  CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesion`
--

LOCK TABLES `sesion` WRITE;
/*!40000 ALTER TABLE `sesion` DISABLE KEYS */;
INSERT INTO `sesion` VALUES (1,1,'2025-10-24 01:46:33',NULL,'192.168.1.10'),(2,2,'2025-10-24 01:46:33',NULL,'192.168.1.11');
/*!40000 ALTER TABLE `sesion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_identificacion`
--

DROP TABLE IF EXISTS `tipo_identificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_identificacion` (
  `id_tipo_identificacion` int NOT NULL AUTO_INCREMENT,
  `nombre_tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abreviacion` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_tipo_identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_identificacion`
--

LOCK TABLES `tipo_identificacion` WRITE;
/*!40000 ALTER TABLE `tipo_identificacion` DISABLE KEYS */;
INSERT INTO `tipo_identificacion` VALUES (1,'Cédula de ciudadanía','CC'),(2,'Tarjeta de identidad','TI'),(3,'Cédula de extranjería','CE'),(4,'NIT','NIT'),(5,'Cédula',NULL),(6,'Pasaporte',NULL),(7,'NIT',NULL),(8,'Cédula',NULL),(9,'Pasaporte',NULL),(10,'NIT',NULL),(11,'Cédula de ciudadanía','CC'),(12,'Cédula de extranjería','CE'),(13,'NIT','NIT'),(14,'Cédula de ciudadanía','CC'),(15,'Cédula de extranjería','CE'),(16,'NIT','NIT');
/*!40000 ALTER TABLE `tipo_identificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutorial`
--

DROP TABLE IF EXISTS `tutorial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutorial` (
  `id_tutorial` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci,
  `ruta_video` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int DEFAULT '0',
  PRIMARY KEY (`id_tutorial`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutorial`
--

LOCK TABLES `tutorial` WRITE;
/*!40000 ALTER TABLE `tutorial` DISABLE KEYS */;
INSERT INTO `tutorial` VALUES (1,'Cómo agendar un servicio','Paso 1: ... Paso 2: ...',NULL,1);
/*!40000 ALTER TABLE `tutorial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `persona_id` int DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `rol_id` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `fk_usuarios_persona` (`persona_id`),
  KEY `fk_usuario_rol` (`rol_id`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id_rol`),
  CONSTRAINT `fk_usuarios_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id_persona`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=364 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (331,'juanp','plan',1,1,'2025-10-24 01:46:14',NULL),(332,'mariag','plan',2,1,'2025-10-24 01:46:14',NULL),(333,'carlosr','plan',3,1,'2025-10-24 01:46:14',NULL),(334,'yiber123','$2b$12$vtJXy3ZgrXRM7iGDtUv9y.NCo.bIeiM8YSP2tm/HuCaa1ebvFvErS',NULL,1,NULL,NULL),(335,'david','$2b$12$gnJ1inU0GjlUXfNbF014a.usIvMXf2NtoNYRNOh9bKXTJv0cKecli',NULL,1,NULL,NULL),(339,'yiberdd','$2b$12$en.b/YNMRfg9eZRWLKbUSOpYvTo.eLgcTMHELR7bF1Bp5JUnpuVZe',158,1,NULL,NULL),(340,'dsf','$2b$12$kf7KKVISpAHhbzdM/fc9Iu6DjwcRmkaNnhD/bvzKm5NwRnD/ySGVG',159,1,NULL,NULL),(341,'juan','$2b$12$CIBUaTpoFGH367LUagzhouWsKL6gI/5rIyaEQckrsIcotn8UIEE52',160,1,NULL,NULL),(342,'theking','$2b$12$4aVOYvIYoNtOoPqanhxWQOVZQPO.v0IBTvpFI/6Hn.O7IQNDHcQQi',161,1,'2025-11-04 05:12:31',NULL),(343,'f','$2b$12$nq9Wg3yWos9QhYEG2TJhcOZIiJXiLo5JF9eQ0PiaPVSOsmafcxQya',162,1,'2025-11-05 21:56:19',NULL),(344,'tt','$2b$12$cAIy0d97Df3.kvNg6fUnEOVOPT9NvRWwxtm4oy.wKffIgmXU3Ifui',163,1,'2025-11-08 00:12:12',NULL),(345,'smithdysoltero7','$2b$12$C9X5aS16h7LrnyAC4EnXU.5AiVDTXUllVdb1uD4c/Gh5PgQXl1A0e',164,1,'2025-11-08 00:51:14',NULL),(346,'fff','$2b$12$w9rRb8ZRadSIp8DwrE9YKOKIH8XQ8gF8O3RPU2EUh3pFwB6XQI7ue',165,1,'2025-11-09 00:50:53',NULL),(347,'redes','$2b$12$Hq431pXhIbq6uGMGyYXjN.QyFesDr8UWvn.tU6wtTLUynn4HflQLW',166,1,'2025-11-09 00:52:39',NULL),(348,'yania','$2b$12$6XttiuFzi69AjLBnz5qD3OOiVG9K7Rny5.jaHcvqMbgy1GG2GdpuG',167,1,'2025-11-09 01:03:54',NULL),(349,'ysania.','$2b$12$eESzK6qlHnTrlfFKsJslZur75ab3cvHCQW4P.gFe8lyI.VpkxRrpm',168,1,'2025-11-09 01:09:50',NULL),(350,'fran2','$2b$12$nglzohAFYBd.RkyE4DwgRO6AS9Mk5ssTBCa9XyyOBnwtk6kwH1.tK',169,1,'2025-11-09 01:19:59',NULL),(351,'dm','$2b$12$vLFfJVTmHIDH2ge3IoQiU.YID90pUZBBGVXgSlgESA7/TZ/WFS8mG',170,1,'2025-11-09 01:22:41',NULL),(352,'terreno','$2b$12$GoiqR6zLERWqnh4vDHNlxeF4r7h5XvghRg2hbPYaTBUvwNgbVYIn6',171,1,'2025-11-09 01:33:47',NULL),(353,'123','$2b$12$RAz2YlgqN3n3yVbkmVkirO/62UY0naKw7xQCkoDui0S.q/RVJtdZy',172,1,'2025-11-09 01:36:40',NULL),(354,'amor','$2b$12$EnkQDAtkZKbXtA9sFfiY9uXfzzDyss4/iBQ1wP2WLo4ksNw/L8QAC',173,1,'2025-11-10 04:30:11',NULL),(355,'andres','$2b$12$WOnhfHHBcie9uk0besVp0OQgXpa19cD3wfFar5AQw1KJDOO0wqT0e',174,1,'2025-11-12 05:37:54',NULL),(356,'nino','$2b$12$/D5m.4z03nsGBfYLyYUuOeqyylEWop/iyJK63KzoEzhcJ7xIamYB6',175,1,'2025-11-12 05:41:08',NULL),(358,'ricura','$2b$12$m5k60K6k0.Mecj6UpUhAYOGqDFfaz1jaW0pRbDbSMAtTKsLrTeax6',177,1,'2025-11-12 22:57:53',3),(361,'PITI','$2b$12$RKunfLYpRr04b7/7naXrgOPZXapObEAxrePKD39f7t/yH8fBXRC.C',1,1,'2025-11-13 03:46:28',1),(362,'peres','$2b$12$BKt3NeFPDCJcdQ/QuX38/ukijOqFDg/U8wp8DezW7Ul1ZsUn3NZUy',179,1,'2025-11-14 06:42:29',3),(363,'fran','$2b$12$xiv7DZtZwLXswfjNVCEPbeb/nQd7FuXL.xgdW75ZfTYsn5RNyW8Ei',180,1,'2025-11-15 07:18:55',3);
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

-- Dump completed on 2025-11-15  8:17:58
