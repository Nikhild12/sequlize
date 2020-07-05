// package imports

const express = require('express');

// Express route initialize

const patientDischareSummaryRoute =  express.Router();

const patientDischargeSummary_ctrl =  require("../controllers/patient_discharge_summary.controller");

const patientPreviousDischargeSummary_ctrl =  require("../controllers/patient_prev_discharge_summary.controller");

patientDischareSummaryRoute.route("/getDischargeDetails").get(patientDischargeSummary_ctrl.getDischargeDetails);
patientDischareSummaryRoute.route("/getdischargetype").get(patientDischargeSummary_ctrl.getDischargeType);
patientDischareSummaryRoute.route("/getdeathtype").get(patientDischargeSummary_ctrl.getDeathType);

patientDischareSummaryRoute.route("/getPreviousDischargeDetails").post(patientPreviousDischargeSummary_ctrl.getPreviousDischargeDetails);


module.exports =  patientDischareSummaryRoute;