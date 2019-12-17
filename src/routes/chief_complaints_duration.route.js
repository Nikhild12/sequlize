// package Imports
const express = require('express');

// EMR Workflow Controller Import
const ChiefComplaintsDurationCtrl = require('../controllers/chief_complaints_duration.controller');

// Express Router Initialize
const chiefDurationRoute = express.Router();

chiefDurationRoute.route('/get').get(ChiefComplaintsDurationCtrl.getComplaintsDurationPeriodList);
chiefDurationRoute.route('/create').post(ChiefComplaintsDurationCtrl.createComplaintsDurationPeriod);

module.exports = chiefDurationRoute;

