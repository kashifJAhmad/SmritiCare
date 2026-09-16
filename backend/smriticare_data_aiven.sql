-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: smriticcare
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `Alert`
--

/*!40000 ALTER TABLE `Alert` DISABLE KEYS */;
/*!40000 ALTER TABLE `Alert` ENABLE KEYS */;

--
-- Dumping data for table `CaregiverInvite`
--

/*!40000 ALTER TABLE `CaregiverInvite` DISABLE KEYS */;
/*!40000 ALTER TABLE `CaregiverInvite` ENABLE KEYS */;

--
-- Dumping data for table `CaregiverPatient`
--

/*!40000 ALTER TABLE `CaregiverPatient` DISABLE KEYS */;
INSERT INTO `CaregiverPatient` VALUES ('cmu1ojvdh0000qwvzt5c65vku','cmttxkwtl00004gvzjsfdaqz4','cmtsdxf6m0000psvzg66bvnii','2026-09-14 20:13:04.279','2026-09-14 20:13:04.279');
/*!40000 ALTER TABLE `CaregiverPatient` ENABLE KEYS */;

--
-- Dumping data for table `CognitiveScore`
--

/*!40000 ALTER TABLE `CognitiveScore` DISABLE KEYS */;
/*!40000 ALTER TABLE `CognitiveScore` ENABLE KEYS */;

--
-- Dumping data for table `EmergencyContact`
--

/*!40000 ALTER TABLE `EmergencyContact` DISABLE KEYS */;
INSERT INTO `EmergencyContact` VALUES ('cmtsl74x300005cvz4t5wbuww','cmtsdxf6m0000psvzg66bvnii','Ahtehsam','Son','9529238710','2026-09-08 11:29:15.688','2026-09-08 11:29:15.688'),('cmtu4xldr0003i8vzdfjgzkq3','cmtu4l9670000i8vz7guxg1v5','Ziya','Frnd','9158139782','2026-09-09 13:29:28.960','2026-09-09 13:29:28.960'),('cmtv1rrbn000b9svzlrmd3w36','cmtu4l9670000i8vz7guxg1v5','Dr. Simran','Doctor','9423286651','2026-09-10 04:48:44.051','2026-09-10 04:48:44.051'),('cmtv1u527000c9svzql5a9ryp','cmtu4l9670000i8vz7guxg1v5','Pratham','Friend','9769319413','2026-09-10 04:50:35.167','2026-09-10 04:50:35.167'),('cmtv50rbb0000uovz6a5mupzq','cmtu4l9670000i8vz7guxg1v5','Kashif','Brother','9529238710','2026-09-10 06:19:42.791','2026-09-10 06:19:42.791');
/*!40000 ALTER TABLE `EmergencyContact` ENABLE KEYS */;

--
-- Dumping data for table `Game`
--

/*!40000 ALTER TABLE `Game` DISABLE KEYS */;
/*!40000 ALTER TABLE `Game` ENABLE KEYS */;

--
-- Dumping data for table `GameResult`
--

/*!40000 ALTER TABLE `GameResult` DISABLE KEYS */;
/*!40000 ALTER TABLE `GameResult` ENABLE KEYS */;

--
-- Dumping data for table `Memory`
--

/*!40000 ALTER TABLE `Memory` DISABLE KEYS */;
INSERT INTO `Memory` VALUES ('cmtsqzmbn0000lcvz6v9yib8t','cmtsdxf6m0000psvzg66bvnii','Friend','Belove memory','http://192.168.29.253:5000/uploads/memories/1788876682542-o0gxpnrv.jpg','Adventure','2026-09-08 14:11:22.691','2026-09-08 14:11:22.691',NULL,'photo'),('cmtsr785z0001lcvz1jvewnxl','cmtsdxf6m0000psvzg66bvnii','test','test',NULL,'test','2026-09-08 14:17:17.592','2026-09-08 14:17:17.592','http://192.168.29.253:5000/uploads/memories/1788877037461-ws94a4rh.m4a','voice'),('cmtu51kcc0004i8vzkcy6380g','cmtu4l9670000i8vz7guxg1v5','Hyderabad','Visiting Hyderabad',NULL,'Adventure','2026-09-09 13:32:34.236','2026-09-09 13:32:34.236',NULL,'text'),('cmtuwmlff000018vznw3l9tlo','cmtsdxf6m0000psvzg66bvnii','Sinhaghad','Sinhaghad Adventure','http://192.168.29.253:5000/uploads/memories/1789007084921-1496dd8x.jpeg','Adventure','2026-09-10 02:24:45.051','2026-09-10 02:24:45.051',NULL,'photo'),('cmtv0rdxt00009svzqay9lrbf','cmtu4l9670000i8vz7guxg1v5','Hospital','Visited my consultant Doctor','http://192.168.137.108:5000/uploads/memories/1789014027070-r2webtdw.jpeg','Photo','2026-09-10 04:20:27.090','2026-09-10 04:20:27.090',NULL,'photo'),('cmtv18zqc00079svzkpqogd5o','cmtu4l9670000i8vz7guxg1v5','Assignment','My friend shazil and umeir were doing their assignment. At Keystone School of Engineering college library','http://192.168.137.108:5000/uploads/memories/1789014848423-ckr1no0i.jpeg','Photo','2026-09-10 04:34:08.484','2026-09-10 04:34:08.484',NULL,'photo'),('cmtv1vtaw000d9svzwcb1zery','cmtu4l9670000i8vz7guxg1v5','Hackathon','Sih hackathon on Keystone',NULL,'Voice','2026-09-10 04:51:53.240','2026-09-10 04:51:53.240','http://192.168.137.108:5000/uploads/memories/1789015913219-l8zloyfm.m4a','voice'),('cmtv60g6q0001uovzb8huwqbp','cmtu4l9670000i8vz7guxg1v5','Internal SIH hackathon','Team members list , location, and what\'s the motive',NULL,'Voice','2026-09-10 06:47:27.986','2026-09-10 06:47:27.986','http://192.168.137.108:5000/uploads/memories/1789022847879-3p6so56g.m4a','voice'),('cmtv72yyq0002uovz7bnqsf9w','cmtu4l9670000i8vz7guxg1v5','Keystone library','Visited','http://192.168.137.108:5000/uploads/memories/1789024644957-fef7kn6f.jpeg','Photo','2026-09-10 07:17:25.250','2026-09-10 07:17:25.250',NULL,'photo');
/*!40000 ALTER TABLE `Memory` ENABLE KEYS */;

--
-- Dumping data for table `PatientLocation`
--

/*!40000 ALTER TABLE `PatientLocation` DISABLE KEYS */;
INSERT INTO `PatientLocation` VALUES ('cmtv1c7h0000a9svzujo72tvk','cmtu4l9670000i8vz7guxg1v5',18.44704,73.9372782,100,'2026-09-10 07:18:43.504','2026-09-10 04:36:38.484'),('cmu1p6k4800003cvzp50c43hv','cmtsdxf6m0000psvzg66bvnii',18.4806406,73.9338242,16.905000686645508,'2026-09-15 11:48:18.075','2026-09-14 20:30:42.776');
/*!40000 ALTER TABLE `PatientLocation` ENABLE KEYS */;

--
-- Dumping data for table `Task`
--

/*!40000 ALTER TABLE `Task` DISABLE KEYS */;
INSERT INTO `Task` VALUES ('cmtsj74kk0000icvzi812fdjf','cmtsci1pq0000ucvzgmsvybak','Take morning medicine','Take the prescribed medicine after breakfast','Medicine','2026-09-09 03:30:00.000',0,1,'2026-09-08 10:33:16.004','2026-09-08 10:33:16.004','NONE'),('cmtv13oco00059svzmisd3drr','cmtu4l9670000i8vz7guxg1v5','Take food at time',NULL,'Food','2026-09-10 04:39:00.000',0,1,'2026-09-10 04:30:00.456','2026-09-10 06:51:21.959','DAILY'),('cmtv2oyqi0000qcvzupuurcow','cmtu4l9670000i8vz7guxg1v5','medicine','take medicine after lunch',NULL,'2026-09-10 06:42:00.000',0,1,'2026-09-10 05:14:33.307','2026-09-10 05:31:38.416','DAILY'),('cmtv30h2r0001qcvzcm9ne5fn','cmtu4l9670000i8vz7guxg1v5','Contact','Call to mom','General','2026-09-10 07:00:00.000',0,1,'2026-09-10 05:23:30.291','2026-09-10 05:23:30.291','DAILY'),('cmu2x2ehr0000b8vzzjotayx7','cmtsdxf6m0000psvzg66bvnii','Hi take medicine',NULL,'Medicine','2026-09-15 17:00:00.000',0,1,'2026-09-15 16:59:11.968','2026-09-15 16:59:11.968','DAILY');
/*!40000 ALTER TABLE `Task` ENABLE KEYS */;

--
-- Dumping data for table `User`
--

/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('cmtsci1pq0000ucvzgmsvybak','Test Patient','patient@test.com','$2b$12$nMep08P8YiF6Lthu.hdlKe3d332lWSSqn/rqHzKMB69D.XQCcB6sG',70,'English',NULL,0,0,'Normal','2026-09-08 07:25:48.207','2026-09-08 07:25:48.207',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PATIENT',NULL),('cmtsdxf6m0000psvzg66bvnii','Kashif','kashifahmad9689@gmail.com','$2b$12$q89WM7jLlXA.I3MnY5fbZebZcw48/SLoNpiWxfZ8hD85O0TnxE/Fi',21,'English',NULL,1,1,'Extra Large','2026-09-08 08:05:45.132','2026-09-15 17:04:41.111','Hadapsar pune','O+','Pune','2007-02-05 00:00:00.000',NULL,NULL,'09529238710','http://192.168.29.253:5000/uploads/profiles/profile-1788887536720-693812','PATIENT','SC-PAT-V9RAY8'),('cmttxkwtl00004gvzjsfdaqz4','Ahtesham Khan','kashif.st001@gmail.com','$2b$12$CjmyC3R50D8//OjDmZvqr.pD1JTSh3hdr8cxvYuoKNLvb5HMSWX52',NULL,'English',NULL,0,0,'Normal','2026-09-09 10:03:39.946','2026-09-09 10:03:39.946',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CAREGIVER',NULL),('cmttzuuo80000y4vz88nxzc33','Kashif Ahmad','kashifjahmad@gmail.com','$2b$12$XHsSTROeaxJ1wlJYD2u1LOb.kH3JVpxZZqGC3CUAKpIi6NmIIZhkS',21,'English',NULL,0,0,'Normal','2026-09-09 11:07:22.952','2026-09-09 11:07:22.952',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PATIENT',NULL),('cmtu46v270000c0vzn7xmmu11','Ahtesham Khan','ahteshamkhan12507@gmail.com','$2b$12$e6RIqLu0IsunIzNZMN1.cO69ZJ51Fcdu/AhuWIQQCOrwP/BVkz01K',NULL,'English',NULL,0,0,'Normal','2026-09-09 13:08:41.791','2026-09-09 13:08:41.791',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CAREGIVER',NULL),('cmtu4l9670000i8vz7guxg1v5','Ahtesham','ahteshamkeystone@gmail.com','$2b$12$y4gjVwbWAvJECx8/rz5QPugHi24.417r1E00/CNK8hBcBz0utwJ4a',20,'English','Kashif',1,1,'Normal','2026-09-09 13:19:53.263','2026-09-10 06:49:34.643',NULL,'O+','Pune','2006-03-07 00:00:00.000','Male',NULL,'88065755535',NULL,'PATIENT','SC-PAT-ZEAEV9');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-16  2:47:07

