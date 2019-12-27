const express = require("express");
const diagnosisVersionCtrl = require("../controllers/diagnosis_version.controller");

const diagnosisVersionRoutes = express.Router(); // eslint-disable-line new-cap





diagnosisVersionRoutes.route("/createDiagnosisversion").post(diagnosisVersionCtrl.postDiagnosisVersion);
diagnosisVersionRoutes.route("/getDiagnosisVersion").post(diagnosisVersionCtrl.getDiagnosisVersion);

// diagnosisVersionRoutes.route("/deleteDiagnosis").post(diagnosisVersionCtrl.deleteDiagnosis);
// diagnosisVersionRoutes.route("/updateDiagnosisById").post(diagnosisVersionCtrl.updateDiagnosisById);
diagnosisVersionRoutes.route("/getDaignosisVersionById").post(diagnosisVersionCtrl.getDiagnosisVersionById);
diagnosisVersionRoutes.route("/getDiagnosisVersionfilter").post(diagnosisVersionCtrl.getDiagnosisVersionfilter);

module.exports = diagnosisVersionRoutes;