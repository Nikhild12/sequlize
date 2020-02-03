// package imports

const express = require('express');

// Express route initialize

const patientDischareSummaryRoute =  express.Router();

const patientDischargeSummary_ctrl =  require("../controllers/patient_discharge_summary.controller");

patientDischareSummaryRoute.route("/getDischargeDetails").get(patientDischargeSummary_ctrl.getDischargeDetails);

module.exports =  patientDischareSummaryRoute;