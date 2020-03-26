// package Imports
const express = require("express");

// EMR Workflow Controller Import
const Encounter = require("../controllers/encounter.controller");

// Express Router Initialize
const EncounterRoutes = express.Router();

EncounterRoutes.route("/create").post(Encounter.createPatientEncounter);
EncounterRoutes.route("/getEncounterByDocAndPatientId").get(
  Encounter.getEncounterByDocAndPatientId
);

EncounterRoutes.route("/get-visit-history").get(
  Encounter.getVisitHistoryByPatientId
);
EncounterRoutes.route("/delete-by-id").put(Encounter.deleteEncounterById);
EncounterRoutes.route("/updateECdischarge").put(Encounter.updateECdischarge);
EncounterRoutes.route("/update-tat-time").put(Encounter.updateTATTimeInEncounterDoctor);
EncounterRoutes.route("/getPatientDoc").get(Encounter.getPatientDoc);
EncounterRoutes.route("/close-encounter").put(Encounter.closeEncounter);
EncounterRoutes.route("/getAll").get(Encounter.getEncounterByPatientIdAndVisitdate);
EncounterRoutes.route("/get-latest-enc-by-patient").get(Encounter.getLatestEncounterByPatientId);


module.exports = EncounterRoutes;
