// package Imports
const express = require("express");

// EMR Workflow Controller Import
const Encounter = require("../controllers/encounter.controller");

// Express Router Initialize
const EncounterRoutes = express.Router();

EncounterRoutes.route("/create").post(Encounter.createPatientEncounter);
EncounterRoutes.route("/getEncounterByDocAndPatientId").get( Encounter.getEncounterByDocAndPatientId );
EncounterRoutes.route("/getEncountersByPatientId").post( Encounter.getEncountersByPatientId );
EncounterRoutes.route("/get-visit-history").get( Encounter.getVisitHistoryByPatientId );
EncounterRoutes.route("/getcommonvisitinfo").post(Encounter.commonVisitInformation);
EncounterRoutes.route("/delete-by-id").put(Encounter.deleteEncounterById);
EncounterRoutes.route("/updateECdischarge").put(Encounter.updateECdischarge);
EncounterRoutes.route("/update-tat-time").put(Encounter.updateTATTimeInEncounterDoctor);
EncounterRoutes.route("/getPatientDoc").get(Encounter.getPatientDoc);
EncounterRoutes.route("/close-encounter").put(Encounter.closeEncounter);
EncounterRoutes.route("/getAll").get(Encounter.getEncounterByPatientIdAndVisitdate);
EncounterRoutes.route("/get-latest-enc-by-patient").get(Encounter.getLatestEncounterByPatientId);
EncounterRoutes.route("/bulk-create").post(Encounter.createEncounterBulk);
EncounterRoutes.route("/get-enc-by-admission-id").get(Encounter.getEncounterByAdmissionId);
EncounterRoutes.route("/updateecounterbyid").put(Encounter.updateEcounterById);
EncounterRoutes.route("/getEncounterDashboardPatientCount").post(Encounter.getEncounterDashboardPatientCount);
EncounterRoutes.route("/getEncounterDashboardPatientInfo").post(Encounter.getEncounterDashboardPatientInfo);
EncounterRoutes.route("/getEncountersByPatientIdsAndDate").post(Encounter.getEncountersByPatientIdsAndDate);
EncounterRoutes.route("/getOutPatientDatas").post(Encounter.getOutPatientDatas);
EncounterRoutes.route("/getOldVisitInformation").post(Encounter.getOldVisitInformation);
EncounterRoutes.route("/getOldHistoryInfo").post(Encounter.getOldHistoryInfo);

module.exports = EncounterRoutes;
