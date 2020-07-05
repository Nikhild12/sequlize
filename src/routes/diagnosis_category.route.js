const express = require("express");
const diagnosiscategoryCtrl = require("../controllers/diagnosis_category.contoller");

const diagnosisCategoryRoutes = express.Router(); // eslint-disable-line new-cap





diagnosisCategoryRoutes.route("/createDiagnosisCategory").post(diagnosiscategoryCtrl.postDiagnosisCategory);
diagnosisCategoryRoutes.route("/getDiagnosisCategory").post(diagnosiscategoryCtrl.getDiagnosisCategory);

// diagnosisCategoryRoutes.route("/deleteDiagnosis").post(diagnosiscategoryCtrl.deleteDiagnosis);
// diagnosisCategoryRoutes.route("/updateDiagnosisById").post(diagnosiscategoryCtrl.updateDiagnosisById);
diagnosisCategoryRoutes.route("/getDaignosisCategoryById").post(diagnosiscategoryCtrl.getDiagnosisCategoryById);
diagnosisCategoryRoutes.route("/getDiagnosisCategoryfilter").post(diagnosiscategoryCtrl.getDiagnosisCategoryfilter);

module.exports = diagnosisCategoryRoutes;