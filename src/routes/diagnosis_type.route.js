const express = require("express");
const diagnosistypeCtrl = require("../controllers/diagnosistype.controller");

const diagnosisTypeRoutes = express.Router(); // eslint-disable-line new-cap





diagnosisTypeRoutes.route("/createDiagnosistype").post(diagnosistypeCtrl.postDiagnosisType);
diagnosisTypeRoutes.route("/getDiagnosisType").post(diagnosistypeCtrl.getDiagnosisType);

// diagnosisTypeRoutes.route("/deleteDiagnosis").post(diagnosistypeCtrl.deleteDiagnosis);
// diagnosisTypeRoutes.route("/updateDiagnosisById").post(diagnosistypeCtrl.updateDiagnosisById);
diagnosisTypeRoutes.route("/getDaignosisTypeById").post(diagnosistypeCtrl.getDiagnosisTypeById);
diagnosisTypeRoutes.route("/getDiagnosisTypefilter").post(diagnosistypeCtrl.getDiagnosisTypefilter);

module.exports = diagnosisTypeRoutes;