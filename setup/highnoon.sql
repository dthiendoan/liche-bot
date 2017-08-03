--
-- Table structure for table `highnoon`
--

DROP TABLE IF EXISTS `highnoon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `highnoon` (
  `user` varchar(25) NOT NULL,
  `wins` int(10) unsigned DEFAULT NULL,
  `losses` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;