const express = require("express");
const proceduresCtrl = require("../controllers/procedures.controller");

const proceduresRoutes = express.Router(); // eslint-disable-line new-cap



// proceduresRoutes.route("/getDFilter").get(proceduresCtrl.getDiagnosisFilter);
// proceduresRoutes.route("/search").post(proceduresCtrl.getDiagnosisSearch);

proceduresRoutes.route("/createProcedures").post(proceduresCtrl.postprocedures);
proceduresRoutes.route("/getProcedures").post(proceduresCtrl.getprocedures);

proceduresRoutes.route("/deleteProcedures").post(proceduresCtrl.deleteprocedures);
proceduresRoutes.route("/updateProceduresById").post(proceduresCtrl.updateproceduresId);
proceduresRoutes.route("/getProceduresById").post(proceduresCtrl.getproceduresById);

module.exports = proceduresRoutes;