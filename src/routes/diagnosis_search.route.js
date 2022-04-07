const express = require("express");
const diagnosisCtrl = require("../controllers/diagnosis_search.conttroller");

const diagnosisRoutes = express.Router();

diagnosisRoutes.route("/searchData").post(diagnosisCtrl.getDiagnosisSearch); // H30-48750 Api for diagnosis search (khurshid)
diagnosisRoutes.route("/searchIcdData").post(diagnosisCtrl.getDiagnosisIcdSearch); // H30-48751 api for icd_diagnosis search (khurshid)

module.exports = diagnosisRoutes;