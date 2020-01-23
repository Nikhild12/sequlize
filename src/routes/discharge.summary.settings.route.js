// package Imports
const express = require("express");

// Express Router Initialize
const dischargeSummaryRoute = express.Router();

// Discharge Controller
const dischargeCtrl = require("../controllers/discharge_summary_settings.controller");

dischargeSummaryRoute
  .route("/create")
  .post(dischargeCtrl.createDischargeSummarySettings);

module.exports = dischargeSummaryRoute;
