

const express = require("express");
const diagnosisgradeCtrl = require("../controllers/diagnosis_grade.controler");

const diagnosisGradeRoutes = express.Router(); // eslint-disable-line new-cap





diagnosisGradeRoutes.route("/createDiagnosisGrade").post(diagnosisgradeCtrl.postDiagnosisGrade);
diagnosisGradeRoutes.route("/getDiagnosisGrade").post(diagnosisgradeCtrl.getDiagnosisGrade);

// diagnosisGradeRoutes.route("/deleteDiagnosis").post(diagnosisgradeCtrl.deleteDiagnosis);
// diagnosisGradeRoutes.route("/updateDiagnosisById").post(diagnosisgradeCtrl.updateDiagnosisById);
diagnosisGradeRoutes.route("/getDaignosisGradeById").post(diagnosisgradeCtrl.getDiagnosisGradeById);
diagnosisGradeRoutes.route("/getDiagnosisGradefilter").post(diagnosisgradeCtrl.getDiagnosisGradefilter);

module.exports = diagnosisGradeRoutes;