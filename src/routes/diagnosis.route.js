const express = require("express");
const diagnosisCtrl = require("../controllers/diagnosis.controller");

const diagnosisRoutes = express.Router(); // eslint-disable-line new-cap



diagnosisRoutes.route("/getDFilter").get(diagnosisCtrl.getDiagnosisFilter);
diagnosisRoutes.route("/search").get(diagnosisCtrl.getDiagnosisSearch);

diagnosisRoutes.route("/createDiagnosis").post(diagnosisCtrl.createDiagnosis);
diagnosisRoutes.route("/getDiagnosis").get(diagnosisCtrl.getDiagnosis);

diagnosisRoutes.route("/deleteDiagnosis").put(diagnosisCtrl.deleteDiagnosis);
diagnosisRoutes.route("/updateDiagnosisById").put(diagnosisCtrl.updateDiagnosisById);
diagnosisRoutes.route("/getDaignosisById").get(diagnosisCtrl.getDaignosisById);

module.exports = diagnosisRoutes;