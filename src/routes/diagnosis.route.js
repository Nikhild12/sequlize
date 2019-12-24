const express = require("express");
const diagnosisCtrl = require("../controllers/diagnosis.controller");

const diagnosisRoutes = express.Router(); // eslint-disable-line new-cap



diagnosisRoutes.route("/getDFilter").get(diagnosisCtrl.getDiagnosisFilter);
diagnosisRoutes.route("/search").post(diagnosisCtrl.getDiagnosisSearch);

diagnosisRoutes.route("/createDiagnosis").post(diagnosisCtrl.createDiagnosis);
diagnosisRoutes.route("/getDiagnosis").post(diagnosisCtrl.getDiagnosis);

diagnosisRoutes.route("/deleteDiagnosis").post(diagnosisCtrl.deleteDiagnosis);
diagnosisRoutes.route("/updateDiagnosisById").put(diagnosisCtrl.updateDiagnosisById);
diagnosisRoutes.route("/getDaignosisById").post(diagnosisCtrl.getDaignosisById);

module.exports = diagnosisRoutes;