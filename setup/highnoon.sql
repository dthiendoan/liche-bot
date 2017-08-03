--
-- Table structure for table `highnoon`
--

DROP TABLE IF EXISTS `highnoon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `highnoon` (
  `username` varchar(25) NOT NULL,
  `wins` int(10) unsigned DEFAULT NULL,
  `losses` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;