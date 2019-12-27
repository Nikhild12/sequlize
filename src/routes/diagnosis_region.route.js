const express = require("express");
const diagnosisRegionCtrl = require("../controllers/diagnosis_region.controller");

const diagnosisRegionRoutes = express.Router(); // eslint-disable-line new-cap





diagnosisRegionRoutes.route("/createDiagnosistype").post(diagnosisRegionCtrl.postDiagnosisRegion);
diagnosisRegionRoutes.route("/getDiagnosisRegion").post(diagnosisRegionCtrl.getDiagnosisRegion);

// diagnosisRegionRoutes.route("/deleteDiagnosis").post(diagnosisRegionCtrl.deleteDiagnosis);
// diagnosisRegionRoutes.route("/updateDiagnosisById").post(diagnosisRegionCtrl.updateDiagnosisById);
diagnosisRegionRoutes.route("/getDaignosisRegionById").post(diagnosisRegionCtrl.getDiagnosisRegionById);
diagnosisRegionRoutes.route("/getDiagnosisRegionfilter").post(diagnosisRegionCtrl.getDiagnosisRegionfilter);

module.exports = diagnosisRegionRoutes;