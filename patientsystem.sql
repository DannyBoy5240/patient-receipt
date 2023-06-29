/*
SQLyog Community v13.2.0 (64 bit)
MySQL - 10.4.28-MariaDB : Database - patientsystem
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`patientsystem` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `patientsystem`;

/*Table structure for table `company` */

DROP TABLE IF EXISTS `company`;

CREATE TABLE `company` (
  `id` int(1) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `tel` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `company` */

insert  into `company`(`id`,`logo`,`address`,`tel`) values 
(1,'福氣堂','油麻地彌敦道546號旺角大樓5D 45','2788 2951 34');

/*Table structure for table `patients` */

DROP TABLE IF EXISTS `patients`;

CREATE TABLE `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `engname` varchar(50) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `sex` int(11) DEFAULT NULL,
  `patientid` varchar(30) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `emergency` varchar(50) DEFAULT NULL,
  `emergencynumber` varchar(50) DEFAULT NULL,
  `pasthistory` text DEFAULT NULL,
  `pasthistorydate` varchar(50) DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `patients` */

insert  into `patients`(`id`,`name`,`engname`,`birthday`,`sex`,`patientid`,`telephone`,`address`,`emergency`,`emergencynumber`,`pasthistory`,`pasthistorydate`) values 
(16,'Test','AAAA','1993-06-28',1,'BBBB','CCCC','AAAA','BBBB','CCCC','AAAA','28/06/2023'),
(17,'Test1','AABE','2000-06-10',1,'BBEC','CCCC','AABB','AAAA','BBBB',NULL,NULL);

/*Table structure for table `pt_cards` */

DROP TABLE IF EXISTS `pt_cards`;

CREATE TABLE `pt_cards` (
  `cardid` int(30) NOT NULL AUTO_INCREMENT,
  `doctorid` varchar(30) NOT NULL,
  `patientid` varchar(30) DEFAULT NULL,
  `doctor` varchar(50) DEFAULT NULL,
  `date` varchar(50) DEFAULT NULL,
  `album` text DEFAULT NULL,
  `albumtext` text DEFAULT NULL,
  `disease` varchar(255) DEFAULT NULL,
  `diagnosis` varchar(255) DEFAULT NULL,
  `syndromes` text DEFAULT NULL,
  `medicines` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `toll` int(11) DEFAULT NULL,
  `checked` tinyint(1) DEFAULT 0,
  `paid` tinyint(1) DEFAULT 0,
  `receipt` text DEFAULT NULL,
  `prescription` text DEFAULT NULL,
  `pasthistory` text DEFAULT NULL,
  `pasthistorydate` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cardid`),
  KEY `cardid` (`cardid`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `pt_cards` */

insert  into `pt_cards`(`cardid`,`doctorid`,`patientid`,`doctor`,`date`,`album`,`albumtext`,`disease`,`diagnosis`,`syndromes`,`medicines`,`remark`,`toll`,`checked`,`paid`,`receipt`,`prescription`,`pasthistory`,`pasthistorydate`) values 
(17,'135791','BBBB','Yukko','2023-06-28T19:33:00.000Z',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL),
(18,'135791','BBBB','Yukko','2023-06-28T19:28:00.000Z',', 72aa12d48eb35f6e7611838003e058c1','AAAAA',NULL,'AAAA','BBB','[{\"name\":\"ww3\",\"amount\":\"2asd23\"}]','AB@@S@@C@@B@@3@@',NULL,1,0,NULL,NULL,NULL,NULL),
(19,'135791','BBBB','Yukko','2023-06-28T19:49:00.000Z',NULL,'AAAA',NULL,'BBB','CCC','[{\"name\":\"CCC\",\"amount\":\"23\"}]','@@@@@@@@@@',NULL,1,0,NULL,NULL,NULL,NULL),
(20,'135791','BBEC','Yukko','2023-06-29T01:59:00.000Z',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL);

/*Table structure for table `pt_history` */

DROP TABLE IF EXISTS `pt_history`;

CREATE TABLE `pt_history` (
  `id` varchar(30) NOT NULL,
  `detail` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `doctorid` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `pt_history` */

insert  into `pt_history`(`id`,`detail`,`date`,`doctorid`) values 
('BBBB','BBBBB','2023-06-28','135791'),
('BBBB','EEEECCCCC','2023-06-28','135791'),
('BBBB','BBDDD','2023-06-28','135791'),
('BBEC','EEEE','2023-06-28','135791');

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `email` varchar(30) NOT NULL,
  `username` varchar(20) NOT NULL,
  `fullname` varchar(30) NOT NULL,
  `doctorid` varchar(15) NOT NULL,
  `avatar` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `users` */

insert  into `users`(`email`,`username`,`fullname`,`doctorid`,`avatar`,`password`) values 
('jenny_816@hotmail.com','Jenny','Jenny','024680','','123456'),
('msyukkochan@gmail.com','Yukko','Yukko Chan','135791','','123456'),
('nayr1234@gmail.com','Ryan','Ryan','006073','','123456');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
